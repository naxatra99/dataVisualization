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

d3.csv("/static/testQuantifized.csv", function(error, coffee) {
  
      // Parse the numeric columns
      coffee.forEach(function(d) {
        d["Norm COO MCA"] = +d["Norm COO MCA"];
        d["Norm Variety MCA"] = +d["Norm Variety MCA"];
        d["Norm PM MCA"] = +d["Norm PM MCA"];
        d["Norm Color MCA"] = +d["Norm Color MCA"];
        d["Aroma"] = +d["Aroma"];
        d["Flavor"] = +d["Flavor"];
        d["Aftertaste"] = +d["Aftertaste"];
        d["Acidity"] = +d["Acidity"];
        // d["Body"] = +d["Body"];
        // d["Balance"] = +d["Balance"];
        // d["Uniformity"] = +d["Uniformity"];
        // d["Overall"] = +d["Overall"];
        // Add more columns here for continuous dimensions
      });

      // Define the scales based on the data
      x.domain(dimensions = d3.keys(coffee[0]).filter(function(d) {
        return d === "Norm COO MCA" ||
               d === "Norm Variety MCA" ||
               d === "Norm PM MCA" ||
               d === "Norm Color MCA" ||
               d === "Aroma" ||
               d === "Flavor" ||
               d === "Aftertaste" ||
               d === "Acidity";
              //  d === "Body" ||
              //  d === "Balance" ||
              //  d === "Uniformity" ||
              //  d === "Overall";
      }));

      // Set the domain and range for each continuous dimension
      dimensions.forEach(function(dim) {
        if (dim === "Norm COO MCA" ||dim === "Norm Variety MCA" ||dim === "Norm PM MCA" ||dim ===  "Norm Color MCA" ) {
              y[dim] = d3.scale.linear()
              .domain(d3.extent(coffee, function(d) { return d[dim]; }))
              // .domain([6.5, 9])
              .range([h, 0]);
        } else {
            y[dim] = d3.scale.linear()
            // .domain(d3.extent(coffee, function(d) { return d[dim]; }))
            .domain([6.5, 9])
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
  var g = svg.selectAll(".dimension")
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
  if (d === "Norm COO MCA") {
    d3.select(this).call(axis.scale(y[d]))
      .call(g => g.selectAll(".tick").remove())
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text("Country of Origin");
  } else if (d === "Norm Variety MCA") {
    d3.select(this).call(axis.scale(y[d]))
      .call(g => g.selectAll(".tick").remove())
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text("Variety");
  } else if (d === "Norm PM MCA") {
    d3.select(this).call(axis.scale(y[d]))
      .call(g => g.selectAll(".tick").remove())
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text("Processing Method");
  } else if (d === "Norm Color MCA") {
    d3.select(this).call(axis.scale(y[d]))
      .call(g => g.selectAll(".tick").remove())
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text("Color");
  }
  else {
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
        .text(function(d) { return d["Country of Origin"] || d["Variety"] || d["Processing Method"] || d["Color"]; });


  // Add and store a brush for each axis.
  g.append("svg:g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
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
        if (d.dimension === "Norm COO MCA") {
            return d.CountryOfOrigin;
          } else if (d.dimension === "Norm Variety MCA") {
            return d.Variety;
          } else if (d.dimension === "Norm PM MCA") {
            return d.ProcessingMethod;
          } else if (d.dimension === "Norm Color MCA") {
            return d.Color;
          } 
          // else if (d.dimension === "Aroma") {
          //   return d.Aroma
          // }
          // else if (d.dimension === "Flavor") {
          //   return d.Flavor;
          // }
          // else if (d.dimension === "Aftertaste") {
          //   return d.Aftertaste;
          // }
          // else if (d.dimension === "Acidity") {
          //   return d.Acidity;
          // }
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