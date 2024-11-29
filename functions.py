import pandas as pd
import numpy as np
import time

def read_df_all_and_df(uploaded_file_path=None, uploaded_file_df=None):
    if uploaded_file_path is not None:
        df_all = pd.read_csv(uploaded_file_path,
                         encoding='utf-8',
                         names=['Date', 'Start Time', 'Consumption (kWh)'],  # Manually set column names
                         usecols=[0, 1, 2],  # Only use the relevant columns
                         skip_blank_lines=True
                         )
    elif uploaded_file_df is not None:
        # Use the provided DataFrame directly
        df_all = uploaded_file_df
    else:
        # Neither a path nor a DataFrame was provided
        raise ValueError("Either 'uploaded_file_path' or 'uploaded_file_df' must be provided.")
    
    
    df = df_all.iloc[11:]
    df = df[df['Date'].str.strip().astype(bool) & df['Start Time'].str.strip().astype(bool)]

    # Combine Date and Start Time columns into a single datetime column
    df['Datetime'] = pd.to_datetime(df['Date'] + ' ' + df['Start Time'], format='%d/%m/%Y %H:%M', errors='coerce')

    # Drop rows with invalid datetime values (NaT)
    df = df.dropna(subset=['Datetime'])
    df['Consumption (kWh)'] = df['Consumption (kWh)'].astype(str).apply(
        lambda x: '0' + x if x.startswith('.') else x).astype(float)

    # Set Datetime as the index
    df.set_index('Datetime', inplace=True)
    # Create a new datetime range with 15-minute intervals, covering the full range of the data
    full_range = pd.date_range(start=df.index.min(), end=df.index.max(), freq='15min')

    # Reindex the dataframe with the complete range, filling missing values with NaN
    df = df.reindex(full_range)

    # Fill NaN values with 0
    df.fillna(0, inplace=True)

    # Rename the index back to 'Datetime'
    df.index.name = 'Datetime'

    df = df[['Consumption (kWh)']]
    # df sort by index
    df = df.sort_index()
    return df_all, df



def apply_discount(df, plan):
    discount = plan['discount']
    discount_hours = plan['hours']
    discount_days = {day.lower() for day in plan['days']}  # Convert to set for faster lookup
    # Safely calculate discount rate for each row based on the years passed
    if isinstance(discount, list):
        # i want the first 365 days discount[0] and the second 365 days discount[1]
        # discounted dates is [[first year dates], [second year dates], ....[last year dates]]
        discounted_hours_list = []
        for i in range(len(discount)):
            if i != len(discount) - 1:
                relevant_hours = df.index[(df.index >= df.index.min() + pd.DateOffset(years=i)) & (df.index < df.index.min() + pd.DateOffset(years=i + 1))]
            else:
                relevant_hours = df.index[(df.index >= df.index.min() + pd.DateOffset(years=i))]
            relevant_hours = relevant_hours[(relevant_hours.hour.isin(discount_hours)) & (
                relevant_hours.strftime('%A').str.lower().isin(discount_days))]
            discounted_hours_list.append(relevant_hours)
        discount_rate = np.zeros(len(df))
        for i in range(len(discount)):
            discount_rate[np.isin(df.index, discounted_hours_list[i])] = discount[i]

    else:
        discount_rate = discount
    current_hours = df.index.hour
    current_days = df.index.strftime('%A').str.lower()

    # Create mask for hours and days that fall within the discount period
    discount_mask = np.isin(current_hours, discount_hours) & np.isin(current_days, list(discount_days))

    # Apply the discount where the mask is True, otherwise keep the original value
    return np.where(discount_mask, df['Consumption (kWh)'] * (1 - discount_rate), df['Consumption (kWh)'])





def read_client_info(df_info):
    """Extract client information from the dataframe."""
    client = df_info.iloc[3, 0]
    address = df_info.iloc[3, 1]
    meter_code = int(df_info.iloc[7, 0])
    meter_number = int(df_info.iloc[7, 1])
    return {
        "client": client,
        "address": address,
        "meter_code": meter_code,
        "meter_number": meter_number
    }

def process_hourly_aggregation(df_hourly):
    """Calculate hourly means aggregated by hour of day."""
    hour_means = df_hourly.groupby(df_hourly.index.hour).mean()
    return hour_means.to_dict(orient='index')

def calculate_plan_prices(df, plans, price_of_kWh):
    """Calculate prices for each plan."""
    plan_prices = pd.DataFrame(index=df.index)
    
    # Process plans in chunks to reduce memory usage
    chunk_size = 1000
    num_chunks = len(df) // chunk_size + 1
    
    for plan in plans:
        # Process data in chunks
        prices = []
        for i in range(num_chunks):
            start_idx = i * chunk_size
            end_idx = min((i + 1) * chunk_size, len(df))
            df_chunk = df.iloc[start_idx:end_idx]
            chunk_prices = apply_discount(df_chunk, plans[plan]) * price_of_kWh
            prices.extend(chunk_prices)
        plan_prices[plan] = prices
    
    return plan_prices

def calculate_cumulative_stats(df, plan_prices, hevrat_hashmal_plan_name, plans):
    """Calculate cumulative statistics and plan comparisons."""
    # Resample to daily data for cumulative calculations
    df_daily = df.resample('D').sum()
    plan_prices_daily = plan_prices.resample('D').sum()
    
    # Combine consumption and plan prices
    df_combined = pd.concat([df_daily, plan_prices_daily], axis=1)
    
    # Calculate cumulative sums
    df_cumsum = df_combined.cumsum()
    
    # Format dates
    df_cumsum.index = df_cumsum.index.strftime('%Y-%m-%d %H:%M:%S')
    
    # Calculate differences with other plans
    other_plans = [plan for plan in plans if plan != hevrat_hashmal_plan_name]
    df_diff_saving = pd.DataFrame(
        {f"{plan}_diff": df_cumsum[hevrat_hashmal_plan_name] - df_cumsum[plan] 
         for plan in other_plans}
    )
    
    # Calculate final plan rankings
    final_series_plans = df_cumsum.iloc[-1].sort_values(ascending=True)
    final_series_plans.index.name = 'plan'
    final_series_plans.name = 'price(ILS)'
    final_df_plans = final_series_plans.reset_index()
    
    return {
        'price_sumcum': df_cumsum.to_dict(orient='index'),
        'diff_saving': df_diff_saving.to_dict(),
        'final_top_plans': final_df_plans.to_dict(orient='index')
    }

def process_csv_data(file_df, plans, price_of_kWh, hevrat_hashmal_plan_name):
    """Process the uploaded CSV data and return results."""
    start_time = time.time()
    
    # Get all dataframes and client info
    df_all, uploaded_file_df = read_df_all_and_df(uploaded_file_df=file_df)
    df_info = df_all.iloc[:10]
    client_info = read_client_info(df_info)
    
    # Create hourly and daily aggregations
    df_hourly = uploaded_file_df.resample('h').sum()
    df_daily = df_hourly[['Consumption (kWh)']].resample('D').sum()
    
    # Calculate various statistics
    hourly_agg = process_hourly_aggregation(df_hourly)
    plan_prices = calculate_plan_prices(df_hourly, plans, price_of_kWh)
    cumulative_stats = calculate_cumulative_stats(df_hourly, plan_prices, 
                                                hevrat_hashmal_plan_name, plans)
    
    # Format daily sums
    df_daily.index = df_daily.index.strftime('%Y-%m-%d')
    daily_sum = df_daily['Consumption (kWh)'].to_dict()
    
    # Calculate latency
    latency = time.time() - start_time
    
    # Compile results
    results_dict = {
        "price_of_kWh": price_of_kWh,
        "client_info": client_info,
        "hevrat_hashmal_plan_name": hevrat_hashmal_plan_name,
        "relevant_plans": plans,
        "hourly_agg": hourly_agg,
        "daily_sum": daily_sum,
        "latency": latency,
        **cumulative_stats
    }
    print("Latency:", latency)
    return results_dict


