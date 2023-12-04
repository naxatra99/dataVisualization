// Resources used:
// https://stackoverflow.com/questions/13227136/d3js-parallel-coordinates-categorical-data
// http://jsfiddle.net/yFXqj/

// Select the container

// // Calculate the width and height based on the container's size
// const containerWidth = container.node().getBoundingClientRect().width;
// const containerHeight = container.node().getBoundingClientRect().height;
// // const containerHeight = containerWidth * 0.17; // Adjust the aspect ratio as needed
// console.log("container width:" + containerWidth)
// console.log("container height:" + containerHeight)


// var m = { top:30, right: 10, bottom: 10, left: 10 },
// w = containerWidth - m.left - m.right,
// h = containerHeight - m.top - m.bottom;

// Define margins and dimensions
var m = [30, 10, 10, 10];
var w = 1600 - m[1] - m[3];
var h = 650 - m[0] - m[2];


var x = d3.scale.ordinal().rangePoints([0, w], 1);
var y = {};
var dragging = {};

var line = d3.svg.line();
var axis = d3.svg.axis().orient("left").ticks(4);
var background;
var foreground;
var coffee; // Your data will be assigned to this variable

var svg = d3.select("#paraCoord").append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
    .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

// Function to set the position of dimensions
function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Function to return the path for a given data point
function path(d) {
    return line(dimensions.map(function (p) {
        return [position(p), y[p](d[p])];
    }));
}

// Function to handle a brush event
function brush() {
    var actives = dimensions.filter(function (p) { return !y[p].brush.empty(); });
    var extents = actives.map(function (p) { return y[p].brush.extent(); });
    foreground.style("display", function (d) {
        return actives.every(function (p, i) {
            return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        }) ? null : "none";
    });
}

// Function to clear the parallel coordinates plot
function clearPlot() {
    // Remove the background lines
    svg.selectAll(".background").selectAll("path").remove();
    // Remove the foreground lines
    svg.selectAll(".foreground").selectAll("path").remove();
    svg.selectAll(".dimension").remove();
    svg.selectAll(".data-point-label").remove();
}

// Load CSV data and populate dropdown
function loadCSVAndPopulateDropdown() {
    d3.csv("/static/test_continuous_data.csv", function (error, data) {
        if (error) {
            console.error("Error loading CSV:", error);
            return;
        }

        coffee = data; // Assign the data to the coffee variable

        // Function to update the dropdown with column names
        function updateDimensionDropdown(columnNames) {
            var dropdown = document.getElementById("dimensionSelect");
            dropdown.innerHTML = ''; // Clear the dropdown

            // Populate the dropdown with column names
            columnNames.forEach(function (column) {
                var option = document.createElement("option");
                option.value = column;
                option.text = column;
                dropdown.appendChild(option);
            });
        }

        // Extract column names from the data
        var columnNames = Object.keys(coffee[0]);

        // Update the dropdown with column names
        updateDimensionDropdown(columnNames);

        // Set up the parallel coordinates plot with default dimensions
        setupParallelCoordinates(coffee);
    });
}

// Function to set up parallel coordinates with default dimensions
function setupParallelCoordinates(coffee) {
    function isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    // Parse the columns with numerical values
    coffee.forEach(function (d) {
        for (var key in d) {
            if (isNumeric(d[key])) {
                d[key] = +d[key];
            }
        }
    });

    // Define the scales based on the data
    x.domain(dimensions = d3.keys(coffee[0]).filter(function (d) {
        // Check if the data type of the current column is numeric and not starting with "MCA_"
        return !isNaN(coffee[0][d]) && !d.startsWith("MCA_");
    }));

    // Set the domain and range for each continuous dimension
    dimensions.forEach(function (dim) {
        var columnValues = coffee.map(function (d) { return d[dim]; });
        var min = d3.min(columnValues);
        var max = d3.max(columnValues);
        if (dim.startsWith("Norm_")) {
            y[dim] = d3.scale.linear()
                .domain(d3.extent(coffee, function (d) { return d[dim]; }))
                .range([h, 0]);
        } else {
            y[dim] = d3.scale.linear()
                .domain([min - 1, max + 1])
                .range([h, 0]);
        }
    });

    // Your existing code for creating the parallel coordinates plot
    // ...
    // Add grey background lines for context.
    background = svg.append("svg:g")
        .attr("class", "background")
        .selectAll("path")
        .data(coffee)
        .enter().append("svg:path")
        .attr("d", path);

    // Add blue foreground lines for focus.
    foreground = svg.append("svg:g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(coffee)
        .enter().append("svg:path")
        .attr("d", path);

    // Add a group element for each dimension.
    var g = svg.selectAll(".dimension .data-point-label")
        .data(dimensions)
        .enter().append("svg:g")
        .attr("class", "dimension")
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
        .call(d3.behavior.drag()
            .on("dragstart", function (d) {
                dragging[d] = this.__origin__ = x(d);
                background.attr("visibility", "hidden");
            })
            .on("drag", function (d) {
                dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
                foreground.attr("d", path);
                dimensions.sort(function (a, b) { return position(a) - position(b); });
                x.domain(dimensions);
                g.attr("transform", function (d) { return "translate(" + position(d) + ")"; })
            })
            .on("dragend", function (d) {
                delete this.__origin__;
                delete dragging[d];
                transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                transition(foreground)
                    .attr("d", path);
                background
                    .attr("d", path)
                    .transition()
                    .delay(500)
                    .duration(0)
                    .attr("visibility", null);
            }));

    // Add an axis and title.
    g.append("svg:g")
        .attr("class", "axis")
        .each(function (d) {
            if (d.startsWith("Norm_")) {
                var label = d.substring(5); // Remove "Norm_" prefix from the column name
                d3.select(this).call(axis.scale(y[d]))
                    .call(g => g.selectAll(".tick").remove())
                    .append("text")
                    .style("text-anchor", "middle")
                    .attr("y", -9)
                    .text(label); // Use the extracted label
            } else {
                d3.select(this).call(axis.scale(y[d]))
                    .append("text")
                    .style("text-anchor", "middle")
                    .attr("y", -9)
                    .text(String);
            }
        });

        g.selectAll(".dimension")
        .data(coffee)
        .append("text")
        .attr("class", "label")
        .style("text-anchor", "middle")
        .attr("y", function (d) { return h + 5; })
        .text(function (d) {
            for (var key in d) {
                if (typeof d[key] === "string") {
                    return d[key];
                }
            }
        });

    // Add and store a brush for each axis.
    g.append("svg:g")
        .attr("class", "brush")
        .each(function (d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    // Add data point labels for each dimension.
    var dataPointLabels = svg.selectAll(".data-point-label")
        .data(coffee)
        .enter()
        .append("g")
        .attr("class", "data-point-label");

    dataPointLabels.selectAll(".label")
        .data(function (d, i) {
            return dimensions.map(function (p) {
                var dimensionParts = p.split('_');
                if (dimensionParts.length === 2 && dimensionParts[0] === 'Norm') {
                    var columnName = dimensionParts[1];
                    return {
                        index: i,
                        dimension: p,
                        value: d[p], // Use values from the "Norm_<<something>>" column
                        label: d[columnName] // Use labels from the "<<something>>" column
                    };
                } else {
                    return {
                        index: i,
                        dimension: p,
                        value: d[p],
                        label: "" // Empty label for non-"Norm" columns
                    };
                }
            });
        })
        .enter()
        .append("text")
        .attr("class", "data-point")
        .style("text-anchor", function (d) {
            // Alternate between "start" and "middle" based on the index
            return d.index % 2 === 0 ? "middle" : "middle";
        })
        .attr("x", function (d) {
            return position(d.dimension);
        })
        .attr("y", function (d) {
            return y[d.dimension](d.value);
        })
        .text(function (d) {
            return d.label; // Use the label for the data points
        });

    // Call the function to update the graph based on selected dimensions
    document.getElementById("drawGraphButton").addEventListener("click", drawGraph);
}

function drawGraph() {
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
  clearPlot();
  setupParallelCoordinates(filteredCoffee);
  // Call the brush function to update the display (if needed)
  brush(); // You can include this if brushing is necessary

}




// Initial call to load CSV and populate the dropdown
loadCSVAndPopulateDropdown();
