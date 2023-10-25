from flask import Flask,render_template, request, redirect, url_for
import os
import csv
import pandas as pd
import numpy as np
import prince
from sklearn.preprocessing import MinMaxScaler


    
app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'files'

@app.route("/")
def hello_world():
    return render_template("index.html")

@app.route("/categoricalData")
def allDataAsCategoricalData():
    return render_template("categorical.html")

@app.route("/continuousData")
def allDataAsContinuousData():
    return render_template("continuous.html")

@app.route("/interaction")
def interaction():
    return render_template("interaction.html")

@app.route('/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        # Check if a file is provided
        if 'csv_file' not in request.files:
            return "No file provided."

        file = request.files['csv_file']
        
        # Check if the file has a name and is allowed
        if file.filename == '':
            return "File name is empty."

        if file and file.filename.endswith(".csv"):
            # Save the file to the static folder
            filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            try:
                file.save(filename)
            except Exception as e:
                return f"An error occured while saving file"
            
            binning(filename)
            quantization(filename)
            

      
    return render_template('upload.html')


def binning(filename):
    print(filename)
    df = pd.read_csv(filename)

    labels = ['Ok', 'Good', 'Best']
    for column in df.columns:
        if pd.api.types.is_numeric_dtype(df[column]):
            try:
                # print(f"{column} contains numerical values.")
                # print(df[column])
                df[column + " " + "binned"] = pd.qcut(df[column], 3, labels=labels)
                # print(df[column])
                df.drop(columns=column, inplace=True)
            except ValueError:
                print(f"Skipping column '{column}' due to binning error")
                df.drop(columns=column, inplace=True)
                continue
        # else:
            # print(f"{column} contains non-numerical (string) values.")
        
    print(df)
    df.to_csv('static/test_categorical_data.csv', index=False)


def quantization(filename):
    fields = []
    df = pd.read_csv(filename)
    # Loop through the columns and check their data type
    for column in df.columns:
        if df[column].dtype == 'object':
            # The column contains string values
            fields.append(column)

    # Initialize a MinMaxScaler
    scaler = MinMaxScaler()

    # Print the column names with string values
    print("Columns with string values:", fields)

    # Clean the data by removing or replacing NaN values
    for column in fields:
        df[column].fillna("Unknown", inplace=True)  # Replace NaN values with "Unknown"


    for column in fields:
        mca = prince.MCA(n_components=1, copy=True, check_input=True, engine='sklearn', random_state=42)
        mca_results = mca.fit_transform(df[[column]])
    
        df[f'MCA_{column}'] = mca_results
    
        # Normalize the MCA results using Min-Max scaling
        normalized_values = scaler.fit_transform(mca_results)

        # Add the normalized values as a new column with an appropriate name
        df[f'Norm_{column}'] = normalized_values


    print(df)
    # print(mca.column_coordinates(df))
    df.to_csv('static/test_continuous_data.csv', index=False)







