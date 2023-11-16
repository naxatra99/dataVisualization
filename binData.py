# https://towardsdatascience.com/all-pandas-qcut-you-should-know-for-binning-numerical-data-based-on-sample-quantiles-c8b13a8ed844

import pandas as pd
import numpy as np

df = pd.read_csv()


labels = ['Low', 'Medium', 'High']

df['Aroma_Category'] = pd.qcut(df['Aroma'], 3, labels=labels)
df['Flavor_Category'] = pd.qcut(df['Flavor'], 3, labels=labels)
df['Aftertaste_Category'] = pd.qcut(df['Aftertaste'], 3, labels=labels)
df['Acidity_Category'] = pd.qcut(df['Acidity'], 3, labels=labels)
df['Body_Category'] = pd.qcut(df['Body'], 3, labels=labels)
df['Overall_Category'] = pd.qcut(df['Overall'], 3, labels=labels)

print(df)

df.sample(1000)

df.to_csv('static/all_coffee_categorical_data.csv', index=False)

# Aroma
# OK (6.5, 7.33]
# GOOD (7.33, 8.16]
# BEST (8.16, 9]