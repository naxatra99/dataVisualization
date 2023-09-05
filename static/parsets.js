// USED RESOURCES: 
// https://www.jasondavies.com/parallel-sets/
// https://stackoverflow.com/questions/36066931/rotate-d3-parset-visualization-90-degrees-make-horizontal-instead-of-vertical

var chart = d3.parsets()
.dimensions(["Country of Origin", "Variety", "Processing Method", "Color"])


var vis = d3.select("#paraSet").append("svg") 
.attr("width", chart.width())
.attr("height", chart.height());


d3.csv("/static/arabica_data_cleaned_V02.csv", function(error, data){
    // console.log(data);
    vis.datum(data).call(chart);
})

