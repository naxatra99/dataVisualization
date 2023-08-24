// Code for ParaSet plot
var chart = d3.parsets()
.dimensions(["Country of Origin", "Variety", "Processing Method"]);

var vis = d3.select("#paraSet").append("svg")
.attr("width", chart.width())
.attr("height", chart.height());

d3.csv("/static/df_arabica_clean.csv", function(error, data){
    // console.log(data);
    vis.datum(data).call(chart);
})

// Code for paraCoord plot

var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.ordinal()
    .rangePoints([0, width], 1),
y = {},
dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis()
        .orient("left"),
    background,
    foreground;

var svg = d3.select("#paraCoord")
.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
d3.csv("/static/df_arabica_clean.csv", function(error, coffee) {

  // Extract the list of dimensions and create a scale for each.
  var excludeColumn = ["", "Country of Origin", "Altitude", "Grading Date", "Variety", "Processing Method", "Color", "Expiration", "Defects", "Total Cup Points", "Moisture Percentage", "Category One Defects", "Quakers", "Category Two Defects", "Clean Cup", "Sweetness"];
  x.domain(dimensions = d3.keys(coffee[1]).filter(function(d) {
    return !excludeColumn.includes(d) && (y[d] = d3.scale.linear()
        .domain(d3.extent(coffee, function(p) { return +p[d]; }))
        .range([0, height]));
    }));
    

  // Add grey background lines for context.
  var background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(coffee)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  var foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(coffee)
    .enter().append("path")
      .attr("d", path);

  // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
      .data(dimensions)
    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .call(d3.behavior.drag()
        .origin(function(d) { return {x: x(d)}; })
        .on("dragstart", function(d) {
          dragging[d] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);
          background
              .attr("d", path)
            .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .each(function(d) { d3.select(this).call(axis.scale(y[d]).ticks(0)); })
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; });

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) {
        d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush));
      })
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
    .data(function (d) {
      return dimensions.map(function (p) {
        return { dimension: p, value: d[p], CountryOfOrigin: d["Country of Origin"],  Variety: d["Variety"], ProcessingMethod: d["Processing Method"], Aroma: d["Aroma"], Flavor: d["Flavor"], Aftertaste: d["Aftertaste"], Acidity: d["Acidity"], Body: d["Body"], Balance: d["Balance"], Uniformity: d["Uniformity"], Overall: d["Overall"],Color: d["Color"] };
      });
    })
    .enter()
    .append("text")
    .attr("class", "data-point")
    .style("text-anchor", "middle")
    .attr("x", function (d) {
      return position(d.dimension);
    })
    .attr("y", function (d) {
      return y[d.dimension](d.value);
    })
    .text(function (d) {
          if (d.dimension === "ID") {
            return d.ID;
          }
          else if (d.dimension === "Aroma") {
            return d.Aroma;
          }
          else if (d.dimension === "Flavor") {
            return d.Flavor;
          }
          else if (d.dimension === "Aftertaste") {
            return d.Aftertaste;
          }
          else if (d.dimension === "Acidity") {
            return d.Acidity;
          }
          else if (d.dimension === "Body") {
            return d.Body;
          }
          else if (d.dimension === "Balance") {
            return d.Balance;
          }
          else if (d.dimension === "Uniformity") {
            return d.Uniformity;
          }
          else if (d.dimension === "Overall") {
            return d.Overall;
          }
          else {
            return "";
          }
    });

      function filterData() {
        // Get the current brush extents
        var actives = dimensions.filter(function (p) { return !y[p].brush.empty(); }),
          extents = actives.map(function (p) { return y[p].brush.extent(); });
        
          foreground.style("display", function(d) {
            return actives.every(function(p, i) {
              return extents[i][0] <= d[p] && d[p] <= extents[i][1];
            }) ? null : "none";
          });

        // Filter the data based on the brush extents
        var filteredData = coffee.filter(function (d) {
          return actives.every(function (p, i) {
            return extents[i][0] <= d[p] && d[p] <= extents[i][1];
          });
        });
    
        // Update the parallel sets plot with the filtered data
        updateParallelSets(filteredData);
      }
    
      // Call the filterData function whenever the brush is used
      d3.selectAll(".brush")
        .each(function (d) { d3.select(this).call(y[d].brush.on("brush", filterData)); });
    
    
      // Function to update the parallel sets plot
      function updateParallelSets(filteredData) {
        // Clear the existing parallel sets plot
        vis.selectAll("*").remove();

          // Extract the dimensions to be shown in the parallel sets plot
        var dimensionsToShow = ["Country of Origin", "Processing Method", "Variety"];

        // Filter the data to include only the dimensions to be shown
        var filteredDataToShow = filteredData.map(function(d) {
            return {
            "Country of Origin": d["Country of Origin"],
            "Processing Method": d["Processing Method"],
            "Variety": d["Variety"]
            };
        });
    
        // Update the dimensions of the parallel sets plot with the filtered data
        chart.dimensions(dimensionsToShow);
    
        // Create the updated parallel sets plot with the filtered data
        vis.datum(filteredDataToShow).call(chart);
      }


      function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
      }
      
      function transition(g) {
        return g.transition().duration(500);
      }
      
      // Returns the path for a given data point.
      function path(d) {
        return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
      }
      
      function brushstart() {
        d3.event.sourceEvent.stopPropagation();
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
      
});


