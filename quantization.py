# https://maxhalford.github.io/prince/mca/
# https://www.statology.org/contingency-table-python/

import pandas as pd 
import prince

# Quantization using PCA

# fields = ['Country of Origin', 'Variety', 'Processing Method', 'Color', 'Aroma', 'Flavor']
# dataset = pd.read_csv('static\df_arabica_clean.csv', usecols=fields)

# contigencyTableForVariety = pd.crosstab(index=dataset['Country of Origin'], columns=dataset['Variety'])
# contigencyTableForProcessingMethod = pd.crosstab(index=dataset['Variety'], columns=dataset['Processing Method'])
# contigencyTableForColor = pd.crosstab(index=dataset['Processing Method'], columns=dataset['Color'])
# contigencyTableForCountryOfOrigin = pd.crosstab(index=dataset['Color'], columns=dataset['Country of Origin'])

# ca = prince.CA(
#     n_components=1,
#     n_iter=3,
#     copy=True,
#     check_input=True,
#     engine='sklearn',
#     random_state=42
# )
# caVariety = ca.fit(contigencyTableForVariety)
# caOfVariety = ca.column_coordinates(contigencyTableForVariety)

# caPM = ca.fit(contigencyTableForProcessingMethod) 
# caOfPM = ca.column_coordinates(contigencyTableForProcessingMethod)

# caColor = ca.fit(contigencyTableForColor) 
# caOfColor = ca.column_coordinates(contigencyTableForColor)

# caCountryOfOrigin = ca.fit(contigencyTableForCountryOfOrigin) 
# caOfCOO = ca.column_coordinates(contigencyTableForCountryOfOrigin)

# print(contigencyTableForVariety)


# Quantization using MCA

fields = ['Country of Origin', 'Variety', 'Processing Method', 'Color']
dataset = pd.read_csv('static\df_arabica_clean.csv', usecols=fields)

mca = prince.MCA(
    n_components=1,
    n_iter=3,
    copy=True,
    check_input=True,
    engine='sklearn',
    random_state=42
)
mca = mca.fit(dataset)

print(mca.column_coordinates(dataset))
