from flask import Flask, request, render_template, jsonify
import pandas as pd
import numpy as np
import os
from functions import read_df_all_and_df, apply_discount, process_csv_data
from config import price_of_kWh, plans, hevrat_hashmal_plan_name
import time


app = Flask(__name__, template_folder='templates', 
            static_url_path='/static',
            static_folder='static')

@app.route('/', methods=['GET'])
def index():
    """Route for rendering the upload form."""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Route for processing uploaded CSV file."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        # Read uploaded file into DataFrame
        file_df = pd.read_csv(
            file,
            encoding='utf-8',
            names=['Date', 'Start Time', 'Consumption (kWh)'],
            usecols=[0, 1, 2],
            skip_blank_lines=True
        )
        
        # Process the data
        results_dict = process_csv_data(file_df, plans, price_of_kWh, hevrat_hashmal_plan_name)
        
        return render_template('index.html', results=results_dict)
        
    except Exception as e:
        return jsonify({"error": f"Error processing file: {str(e)}"}), 500


if __name__ == "__main__":
    # Use the PORT environment variable for Cloud Run
    port = int(os.environ.get("PORT", 5001))  # Default to 5001 if not set
    app.run(host='0.0.0.0', port=port, debug=True)
