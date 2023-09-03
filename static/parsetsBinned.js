// Parasets old vertical view
// var chart = d3.parsets()
// .dimensions(["Country of Origin", "Variety", "Processing Method", "Color", "Aroma_Category", "Flavor_Category", "Aftertaste_Category", "Acidity_Category"]);

// var vis = d3.select("#paraSet").append("svg")
// .attr("width", chart.width())
// .attr("height", chart.height());

// d3.csv("/static/all_coffee_categorical_data_cleaned.csv", function(error, data){
//     // console.log(data);
//     vis.datum(data).call(chart);
// })

// Parasets horizontal view

var margin = {top: 0, right: 120, bottom: 50, left: 0},
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;


var chart = d3.parsets()
.height(height)
.width(width)
.dimensions(["Country of Origin", "Variety", "Processing Method", "Color", "Aroma", "Flavor", "Aftertaste", "Acidity"]);

var svg = d3.select("#paraSet").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(0," + height + ")rotate(-90)");

d3.csv("/static/all_coffee_categorical_data_cleaned.csv", function(error, data){
    // console.log(data);
    svg.datum(data).call(chart);
    svg.selectAll(".category text")
      .attr("dx", 5)
      .attr("transform", "rotate(90)");
  svg.selectAll(".category rect")
      .attr("y", 0);
  svg.selectAll("text.dimension")
      .attr("dy", "1.5em")
      .attr("transform", "rotate(90)");
  svg.selectAll("text.dimension .sort.alpha")
      .attr("x", 0)
      .attr("dx", 0)
      .attr("dy", "1.5em");
  svg.selectAll("text.dimension .sort.size")
      .attr("dx", "1em");
})