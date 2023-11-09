import pandas as pd
import numpy as np


fileName = "static/all_coffee_categorical_data_cleaned.csv" # fileName here

df = pd.read_csv(fileName)

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
        
# print(df)

df.sample(1000)

print(df)

df.to_csv('static/test_categorical_data.csv', index=False)