//  USED RESOURCES:
// https://stackoverflow.com/questions/13227136/d3js-parallel-coordinates-categorical-data
// http://jsfiddle.net/yFXqj/

var m = [30, 10, 10, 10],
    w = 1600 - m[1] - m[3],  //change numerical value for width
    h = 900 - m[0] - m[2];  //change numerical value for height

var x = d3.scale.ordinal().rangePoints([0, w], 1),
    y = {},
    dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left").ticks(4),
    background,
    foreground;

var svg = d3.select("#paraCoord").append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
  .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

d3.csv("/static/test_continuous_data.csv", function(error, coffee) {
  
  function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  // Parse the columns with numerical values
  coffee.forEach(function(d) {
    for (var key in d) {
      if (isNumeric(d[key])) {
        d[key] = +d[key];
      }
    }
  });

  // Define the scales based on the data
  x.domain(dimensions = d3.keys(coffee[0]).filter(function(d) {
  // Check if the data type of the current column is numeric
    return !isNaN(coffee[0][d]) && !d.startsWith("MCA_");
  }));

  // Set the domain and range for each continuous dimension
  dimensions.forEach(function(dim) {
    var columnValues = coffee.map(function (d) { return d[dim]; });
    var min = d3.min(columnValues);
    var max = d3.max(columnValues);
    if (dim.startsWith("Norm_")) {
      y[dim] = d3.scale.linear()
        .domain(d3.extent(coffee, function(d) { return d[dim]; }))
        .range([h, 0]);
    } else {
      y[dim] = d3.scale.linear()
        .domain([min -1, max + 1])
        .range([h, 0]);
    }
  });

  
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
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .call(d3.behavior.drag()
        .on("dragstart", function(d) {
          dragging[d] = this.__origin__ = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
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
.each(function(d) {
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
      // d3.select(this).call(axis.scale(y[d]).tickValues([5, 6, 7, 8, 9])).append("text")
      // .call(g => g.selectAll(".tick").remove())
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
  .attr("y", function(d) { return h + 5; })
  .text(function(d) {
    for (var key in d) {
      if (typeof d[key] === "string") {
        return d[key];
      }
    }
  });


  // Add and store a brush for each axis.
  g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);

    // Add data point labels for each dimension.
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
  .style("text-anchor", function(d) {
      // Alternate between "start" and "middle" based on the index
      return d.index % 2 === 0 ? "start" : "middle";
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

  // Function to load the CSV file and get column names
  function loadCSVAndPopulateDropdown() {
    d3.csv("/static/test_continuous_data.csv", function (error, data) {
        if (error) {
            console.error("Error loading CSV:", error);
            return;
        }

        // Extract column names from the data
        var columnNames = Object.keys(data[0]);

        // Update the dropdown with column names
        updateDimensionDropdown(columnNames);
    });
  }

  // Function to draw the graph based on selected dimensions
  function drawGraph() {
    var selectedDimensions = Array.from(document.getElementById("dimensionSelect").selectedOptions, option => option.value);

    // Filter the data to include only selected dimensions
    var filteredCoffee = coffee.map(function (d) {
        var filteredData = {};
        selectedDimensions.forEach(function (dim) {
            filteredData[dim] = d[dim];
        });
        return filteredData;
    });

    // Update scales and redraw the graph based on the filtered data
    // Your existing code for scales and graph drawing here...
  }

  // Call the function to load CSV and populate the dropdown initially
  loadCSVAndPopulateDropdown();

  // Event listener for the "Draw Graph" button
  document.getElementById("drawGraphButton").addEventListener("click", drawGraph);




});


function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) {
   return [position(p), y[p](d[p])]; }));
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
      extents = actives.map(function(p) { return y[p].brush.extent(); });
  foreground.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? null : "none";
  });
}

