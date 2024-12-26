from flask import Flask,session, request, render_template, redirect, url_for
import pandas as pd
import numpy as np
import os
from functions import process_csv_data
from config import price_of_kWh, plans, hevrat_hashmal_plan_name, plans_translate_to_hebrew, SERVICES
import time
import logging
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST, CollectorRegistry
import psutil

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('flask_app')

app = Flask(__name__, template_folder='templates', 
            static_url_path='/static',
            static_folder='static')
app.secret_key = os.environ.get('FLASK_SECRET_KEY', os.urandom(24))

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
error_rate_create_reports = Gauge('app_error_rate_create_reports', 'Error rate as percentage of total report reports created', registry=registry)
avg_latency = Gauge('app_average_latency_last_hour', 'Average latency in the last hour', registry=registry)
last_latency = Gauge('app_last_latency_seconds', 'Last request latency in seconds', registry=registry)
cpu_usage = Gauge('app_cpu_usage_percent', 'CPU usage percentage', registry=registry)
memory_usage = Gauge('app_memory_usage_percent', 'Memory usage percentage', registry=registry)
reports_last_hour = Gauge('app_reports_generated_last_hour', 'Successful reports generated in the last hour', registry=registry)
unique_ips_last_hour = Gauge('app_unique_ips_last_hour', 'Number of unique IP connections in the last hour', registry=registry)

# Dictionary to store timestamps and latencies of requests
request_times = {
    'total': [],
    'success': [],
    'error': [],
    'reports': []
}
request_latencies = []

# Initialize IP connections list at the top level
ip_connections = []  # List of tuples (ip_address, timestamp)

def get_client_ip():
    """Get the real client IP address with detailed logging"""
    # Log all headers for debugging
    logger.info("=== FULL HEADERS ===")
    for header_name, header_value in request.headers.items():
        logger.info(f"{header_name}: {header_value}")
    logger.info("==================")

    # Try different headers in order of preference
    if request.headers.get('X-Forwarded-For'):
        client_ip = request.headers.get('X-Forwarded-For').split(',')[0].strip()
        logger.info(f"Using X-Forwarded-For IP: {client_ip}")
        return client_ip
    
    if request.headers.get('X-Real-IP'):
        client_ip = request.headers.get('X-Real-IP')
        logger.info(f"Using X-Real-IP: {client_ip}")
        return client_ip

    logger.info(f"Using remote_addr: {request.remote_addr}")
    return request.remote_addr

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
    global request_latencies, ip_connections
    original_latencies = len(request_latencies)
    request_latencies = [(ts, lat) for ts, lat in request_latencies if ts > hour_ago]
    
    # Clean old IP connections
    original_ips = len(ip_connections)
    ip_connections = [(ip, ts) for ip, ts in ip_connections if ts > hour_ago]
    logger.debug(f"Cleaned {original_ips - len(ip_connections)} old IP connections")

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
    reports_last_hour.set(len(request_times['reports']))
    
    # Update unique IPs metric
    current_time = time.time()
    hour_ago = current_time - 3600
    unique_ips = len(set(ip for ip, ts in ip_connections if ts > hour_ago))
    unique_ips_last_hour.set(unique_ips)
    logger.info(f"Current unique IPs in last hour: {unique_ips}")
    
    if request_latencies:
        average_latency = sum(lat for _, lat in request_latencies) / len(request_latencies)
        logger.debug(f"Updated average latency: {average_latency:.4f} seconds")
        avg_latency.set(average_latency)
    else:
        logger.debug("No latency data available, setting to 0")
        avg_latency.set(0)
    
    success_reports_count = len(request_times['reports'])
    error_count = len(request_times['error'])
    current_error_rate = calculate_error_rate(success_reports_count, error_count)
    error_rate_create_reports.set(current_error_rate)
    logger.debug("Metrics update completed")

def update_system_metrics():
    """Update CPU and memory usage metrics."""
    try:
        cpu_percent = psutil.cpu_percent(interval=None)
        memory_info = psutil.virtual_memory()
        memory_percent = memory_info.percent

        cpu_usage.set(cpu_percent)
        memory_usage.set(memory_percent)

        logger.debug(f"CPU usage updated to {cpu_percent}%")
        logger.debug(f"Memory usage updated to {memory_percent}%")
    except Exception as e:
        logger.error(f"Error updating system metrics: {str(e)}", exc_info=True)

def record_ip_connection():
    """Record IP address of the current request"""
    client_ip = get_client_ip()
    current_time = time.time()
    hour_ago = current_time - 3600
    
    # Log all details about the connection
    logger.info(f"=== CONNECTION INFO ===")
    logger.info(f"Detected Client IP: {client_ip}")
    logger.info(f"Remote Address: {request.remote_addr}")
    logger.info(f"Method: {request.method}")
    logger.info(f"Path: {request.path}")
    logger.info("=====================")
    
    # Only add if this IP isn't already recorded in the last hour
    existing_ips = {ip for ip, ts in ip_connections if ts > hour_ago}
    if client_ip not in existing_ips:
        ip_connections.append((client_ip, current_time))
        logger.info(f"Added new unique IP: {client_ip}")
    else:
        logger.info(f"IP already recorded: {client_ip}")

class LatencyTimer:
    def __enter__(self):
        self.start = time.time()
        logger.debug("Started latency timer")
        return self

    def __exit__(self, *args):
        self.duration = time.time() - self.start
        request_latencies.append((time.time(), self.duration))
        last_latency.set(self.duration)
        logger.debug(f"Updated last_latency metric to {self.duration:.4f} seconds")
        update_metrics()


def filter_plans(meter_type, selected_services, plans):
    filtered_plans = {}

    for plan_name, plan_details in plans.items():
        # Check if the meter type is compatible
        if meter_type not in plan_details["work_with_meter"]:
            continue
        
        # Check if required services are met
        required_services = plan_details.get("more_services_that_needed", [])
        if all(service in selected_services for service in required_services):
            filtered_plans[plan_name] = plan_details

    return filtered_plans


@app.route('/', methods=['GET'])
def index():
    logger.info("Received request for index page")
    current_time = time.time()
    requests_total.inc()
    request_times['total'].append(current_time)
    record_ip_connection()

    with LatencyTimer(), request_duration.time():
        try:
            logger.info("Rendering index template")
            request_times['success'].append(current_time)
            
            # Get results from session if they exist
            results = session.get('results')
            plans_translate = session.get('plans_translate')
            
            return render_template('index.html',
                                results=results,
                                plans_translate=plans_translate,
                                services=SERVICES)
        except Exception as e:
            logger.error(f"Error rendering index template: {str(e)}", exc_info=True)
            requests_error.inc()
            request_times['error'].append(current_time)
            raise e

@app.route('/upload_file', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'GET':
        # Redirect GET requests to index
        return redirect(url_for('index'))
        
    logger.info("Received file upload request")
    current_time = time.time()
    requests_total.inc()
    request_times['total'].append(current_time)
    report_button_clicks.inc()
    record_ip_connection()

    meter_type = request.form.get('meterType')
    selected_services = request.form.getlist('services[]')
    updated_plans = filter_plans(meter_type, selected_services, plans)

    # עיבוד המידע או הצגת המידע
    print(f"Meter Type: {meter_type}")
    print(f"Selected Services: {selected_services}")

    with LatencyTimer(), request_duration.time():
        try:
            # Check if the file is in the Dropzone files
            file = request.files.get('file')
            if not file:
                logger.warning("No file provided in upload request")
                requests_error.inc()
                request_times['error'].append(current_time)
                return {'error': "נא לבחור קובץ"}, 400

            logger.info(f"Processing file: {file.filename}")

            # Read and process the CSV file
            file_df = pd.read_csv(
                file,
                encoding='utf-8',
                names=['Date', 'Start Time', 'Consumption (kWh)'],
                usecols=[0, 1, 2],
                skip_blank_lines=True
            )

            logger.info(f"CSV file read successfully. Shape: {file_df.shape}")
            results_dict = process_csv_data(file_df, updated_plans, price_of_kWh, hevrat_hashmal_plan_name)
            logger.info(f"Results keys: {results_dict.keys()}")

            # Store results in session
            session['results'] = results_dict
            session['plans_translate'] = plans_translate_to_hebrew

            # Log success metrics
            requests_success.inc()
            request_times['success'].append(current_time)
            request_times['reports'].append(current_time)
            logger.info("Processing completed successfully")

            # Return the rendered template with results
            return render_template('index.html',
                                results=results_dict,
                                plans_translate=plans_translate_to_hebrew,
                                meter_type=meter_type,)

        except pd.errors.EmptyDataError:
            logger.error("Empty CSV file uploaded")
            requests_error.inc()
            request_times['error'].append(current_time)
            return {'error': "הקובץ ריק"}, 400

        except pd.errors.ParserError:
            logger.error("CSV parsing error")
            requests_error.inc()
            request_times['error'].append(current_time)
            return {'error': "הפורמט של הקובץ לא מתאים"}, 400

        except Exception as e:
            logger.error(f"Unexpected error processing file: {str(e)}", exc_info=True)
            requests_error.inc()
            request_times['error'].append(current_time)
            return {'error': "אירעה שגיאה בעיבוד הקובץ"}, 500
@app.route('/clear_results', methods=['POST'])
def clear_results():
    """Clear the results from the session"""
    session.pop('results', None)
    session.pop('plans_translate', None)
    return redirect(url_for('index'))
        
@app.route('/metrics', methods=['GET'])
def metrics():
    logger.info("Metrics endpoint accessed")
    record_ip_connection()
    update_metrics()
    update_system_metrics()
    return generate_latest(registry), 200, {'Content-Type': CONTENT_TYPE_LATEST}

@app.route('/about', methods=['GET'])
def about():
    logger.info("Received request for about page")
    return render_template('about.html')

@app.route('/videos', methods=['GET'])
def videos():
    logger.info("Received request for videos page")
    return render_template('videos.html')

@app.route('/terms', methods=['GET'])
def terms():
    logger.info("Received request for terms page")
    return render_template('terms.html')

@app.route('/contact', methods=['GET'])
def contact():
    logger.info("Received request for contact page")
    return render_template('contact.html')


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    logger.info(f"Starting Flask application on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)