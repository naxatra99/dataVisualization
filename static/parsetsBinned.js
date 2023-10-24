// Parasets horizontal view

var coffee;
var margin = {top: 0, right: 120, bottom: 50, left: 0},
    width = 1000 - margin.left - margin.right,
    height = 1000 - margin.top - margin.bottom;


var chart = d3.parsets()
.height(height)
.width(width)
// .dimensions(["Country of Origin", "Variety", "Processing Method", "Color", "Aroma", "Flavor", "Aftertaste", "Acidity"]);
//.dimensions(d3.keys(data[0]))

var svg = d3.select("#paraSet").append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", "translate(0," + height + ")rotate(-90)");


d3.csv("static/test_categorical_data.csv", function(error, data){
    // console.log(dimensions);
    // Populate the dropdown with dimension options
    coffee = data;
    makeChart(data);
});
// Handle the "Draw Graph" button click
document.getElementById("drawGraphButton").addEventListener("click", function() {
    // Get selected dimensions from the dropdown
    var selectedDimensions = Array.from(document.getElementById("dimensionSelect").selectedOptions, option => option.value);
    console.log(selectedDimensions);
    // Filter the data to include only selected dimensions
    var filteredCoffee = coffee.map(function (d) {
    var filteredData = {};
    selectedDimensions.forEach(function (dim) {
      filteredData[dim] = d[dim];
    });
    return filteredData;
    });
    console.log(filteredCoffee);
    svg.datum([]).call(chart); // Clear the existing plot
    // Update the Parallel Sets plot with selected dimensions
    // svg.datum([filteredCoffee]).call(chart); 
    makeChart(filteredCoffee);
    // chart.dimensions(filteredCoffee);
    // svg.call(chart);
});

function makeChart(data) {
    var dimensions = d3.keys(data[0]); // Get header names from the CSV file
    chart.dimensions(dimensions); // Set the dimensions for the chart
    console.log(dimensions)
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

    var dimensionSelect = document.getElementById("dimensionSelect");
    dimensions.forEach(function (dimension) {
        var option = document.createElement("option");
        option.value = dimension;
        option.text = dimension;
        dimensionSelect.appendChild(option);
    });
}