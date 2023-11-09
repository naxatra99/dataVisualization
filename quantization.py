# https://maxhalford.github.io/prince/mca/
# https://www.statology.org/contingency-table-python/

import pandas as pd 
import prince
from sklearn.preprocessing import MinMaxScaler


# Quantization using MCA

# fields = ['Country of Origin', 'Variety', 'Processing Method', 'Color']
# dataset = pd.read_csv('static\df_arabica_clean.csv', usecols=fields)


# Read the CSV file into a DataFrame
df = pd.read_csv('static\df_arabica_clean.csv')

# Initialize a list to store column names with string values
fields = []

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

# mca = prince.MCA(
#     n_components=1,
#     n_iter=3,
#     copy=True,
#     check_input=True,
#     engine='sklearn',
#     random_state=42
# )
# mca = mca.fit(df)

print(df)

df.sample(1000)

# print(mca.column_coordinates(df))
df.to_csv('static/test_continuous_data.csv', index=False)

# print(mca.column_coordinates(df))
