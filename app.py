from flask import Flask, request, render_template, redirect, url_for
import pandas as pd
import numpy as np
import os
from functions import process_csv_data
from config import price_of_kWh, plans, hevrat_hashmal_plan_name, plans_translate_to_hebrew
import time
import logging
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST, CollectorRegistry

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('flask_app')

app = Flask(__name__, template_folder='templates', 
            static_url_path='/static',
            static_folder='static')

# Create a custom registry
registry = CollectorRegistry()

# Define Prometheus metrics with custom registry
requests_total = Counter('app_requests_total', 'Total number of requests', registry=registry)
requests_success = Counter('app_requests_success', 'Successful requests', registry=registry)
requests_error = Counter('app_requests_error', 'Failed requests', registry=registry)
request_duration = Histogram('app_request_duration_seconds', 'Request duration in seconds', registry=registry)
report_button_clicks = Counter('app_report_button_clicks_total', 'Total number of "הפק דוח" button clicks', registry=registry)

# Create gauges for real-time last hour metrics
requests_last_hour = Gauge('app_requests_last_hour', 'Requests in the last hour', registry=registry)
success_last_hour = Gauge('app_success_last_hour', 'Successful requests in the last hour', registry=registry)
errors_last_hour = Gauge('app_errors_last_hour', 'Failed requests in the last hour', registry=registry)
error_rate = Gauge('app_error_rate', 'Error rate as percentage of total requests', registry=registry)
avg_latency = Gauge('app_average_latency_last_hour', 'Average latency in the last hour', registry=registry)

# Dictionary to store timestamps and latencies of requests
request_times = {
    'total': [],
    'success': [],
    'error': []
}
request_latencies = []

def clean_old_requests():
    """Remove requests older than 1 hour"""
    logger.debug("Starting cleanup of old requests")
    current_time = time.time()
    hour_ago = current_time - 3600
    
    for key in request_times:
        original_count = len(request_times[key])
        request_times[key] = [t for t in request_times[key] if t > hour_ago]
        removed_count = original_count - len(request_times[key])
        logger.debug(f"Cleaned {removed_count} old requests from {key} category")
    
    # Clean old latencies
    global request_latencies
    original_latencies = len(request_latencies)
    request_latencies = [(ts, lat) for ts, lat in request_latencies if ts > hour_ago]
    logger.debug(f"Cleaned {original_latencies - len(request_latencies)} old latency records")

def calculate_error_rate(success_count, error_count):
    """Calculate error rate with proper handling of zero division"""
    logger.debug(f"Calculating error rate - Success: {success_count}, Errors: {error_count}")
    total = success_count + error_count
    if total == 0:
        logger.debug("No requests to calculate error rate, returning 0.0")
        return 0.0
    rate = (error_count / total) * 100
    logger.debug(f"Calculated error rate: {rate}%")
    return rate

def update_metrics():
    """Update all metrics for the last hour"""
    logger.debug("Starting metrics update")
    clean_old_requests()
    
    # Update counts for last hour
    requests_last_hour.set(len(request_times['total']))
    success_last_hour.set(len(request_times['success']))
    errors_last_hour.set(len(request_times['error']))
    
    # Calculate and update average latency
    if request_latencies:
        average_latency = sum(lat for _, lat in request_latencies) / len(request_latencies)
        logger.debug(f"Updated average latency: {average_latency:.4f} seconds")
        avg_latency.set(average_latency)
    else:
        logger.debug("No latency data available, setting to 0")
        avg_latency.set(0)
    
    # Calculate and update error rate
    success_count = len(request_times['success'])
    error_count = len(request_times['error'])
    current_error_rate = calculate_error_rate(success_count, error_count)
    error_rate.set(current_error_rate)
    logger.debug("Metrics update completed")

class LatencyTimer:
    def __enter__(self):
        self.start = time.time()
        logger.debug("Started latency timer")
        return self
    
    def __exit__(self, *args):
        self.duration = time.time() - self.start
        request_latencies.append((time.time(), self.duration))
        logger.debug(f"Request completed in {self.duration:.4f} seconds")
        update_metrics()

@app.route('/', methods=['GET'])
def index():
    logger.info("Received request for index page")
    current_time = time.time()
    requests_total.inc()
    request_times['total'].append(current_time)

    with LatencyTimer(), request_duration.time():
        try:
            logger.info("Rendering index template")
            requests_success.inc()
            request_times['success'].append(current_time)
            return render_template('index.html')
        except Exception as e:
            logger.error(f"Error rendering index template: {str(e)}", exc_info=True)
            requests_error.inc()
            request_times['error'].append(current_time)
            raise e

@app.route('/upload', methods=['POST'])
def upload_file():
    logger.info("Received file upload request")
    current_time = time.time()
    requests_total.inc()
    request_times['total'].append(current_time)

    try:
        file = request.files['file']
        if not file:
            logger.warning("No file provided in upload request")
            requests_error.inc()
            request_times['error'].append(current_time)
            return redirect(url_for('index', error="נא לבחור קובץ"))

        try:
            logger.info("Reading CSV file")
            file_df = pd.read_csv(
                file,
                encoding='utf-8',
                names=['Date', 'Start Time', 'Consumption (kWh)'],
                usecols=[0, 1, 2],
                skip_blank_lines=True
            )
            
            logger.info(f"CSV file read successfully. Shape: {file_df.shape}")
            logger.info("Processing CSV data")
            
            results_dict = process_csv_data(file_df, plans, price_of_kWh, hevrat_hashmal_plan_name)
            logger.info(f"Results keys: {results_dict.keys()}")
            
            report_button_clicks.inc()
            logger.info("File processing completed successfully")
            requests_success.inc()
            request_times['success'].append(current_time)
            
            return render_template('index.html', 
                                results=results_dict,
                                plans_translate=plans_translate_to_hebrew)
            
        except pd.errors.EmptyDataError:
            logger.error("Empty CSV file uploaded")
            requests_error.inc()
            request_times['error'].append(current_time)
            return render_template('index.html', error="הקובץ ריק")
        except pd.errors.ParserError:
            logger.error("CSV parsing error")
            requests_error.inc()
            request_times['error'].append(current_time)
            return render_template('index.html', error="הפורמט של הקובץ לא מתאים")
        except Exception as e:
            logger.error(f"Unexpected error processing file: {str(e)}", exc_info=True)
            requests_error.inc()
            request_times['error'].append(current_time)
            return render_template('index.html', error="הפורמט של הקובץ לא מתאים")

    except Exception as e:
        logger.error(f"General error in upload endpoint: {str(e)}", exc_info=True)
        requests_error.inc()
        request_times['error'].append(current_time)
        return render_template('index.html', error="אירעה שגיאה בעיבוד הקובץ")

@app.route('/metrics', methods=['GET'])
def metrics():
    logger.info("Metrics endpoint accessed")
    update_metrics()
    return generate_latest(registry), 200, {'Content-Type': CONTENT_TYPE_LATEST}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    logger.info(f"Starting Flask application on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)