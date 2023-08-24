var chart = d3.parsets()
.dimensions(["Country of Origin", "Variety", "Processing Method", "Aroma_Category", "Flavor_Category", "Aftertaste_Category", "Acidity_Category", "Body_Category", "Overall_Category"]);

var vis = d3.select("#paraSet").append("svg")
.attr("width", chart.width())
.attr("height", chart.height());

d3.csv("/static/all_coffee_categorical_data_cleaned.csv", function(error, data){
    // console.log(data);
    vis.datum(data).call(chart);
})
