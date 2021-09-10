var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 80
};

//Define chart area
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// *******remove this block later 
// Initial Params
//var chosenXAxis = "hair_length";
//*******remove this block later 

//Load Census data
d3.csv("files/data/data.csv")
  .then(function(stateData) {
    console.log(stateData);
    
    stateData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });

    // xLinearScale function above csv import
    var xLinearScale = d3
      .scaleLinear()
      .domain([
        d3.min(stateData, d => d.healthcare) * 1.8,
        d3.max(stateData, d => d.poverty) * 1.2
      ])
      .range([0, width]);

    var yLinearScale = d3
      .scaleLinear()
      .domain([0, d3.max(stateData, d => d.healthcare * 1.2)])
      .range([height, 0]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x and y axis
    chartGroup
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g").call(leftAxis);

    /*Create the circle group for each state */
    var circles = chartGroup.selectAll("g circle").data(stateData);

    var r = 10;
    var circlesGroup = circles
      .enter()
      .append("g")
      .attr("id", "circlesGroup");

    // Generate circle
    circlesGroup
      .append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", r)
      .classed("stateCircle", true);

    // Add text to circle
    circlesGroup
      .append("text")
      .attr("x", d => xLinearScale(d.poverty))
      .attr("y", d => yLinearScale(d.healthcare))
      .classed("stateText", true)
      .text(d => d.abbr)
      .attr("font-size", r * 0.95);

    //Initialize tool tip
    var toolTip = d3
      .tip()
      .attr("class", "d3-tip")
      .offset([40, -20])
      .html(function(d) {
        return `${d.state}<br>Poverty: ${d.poverty}% <br>Lacks Healthcare: ${d.healthcare}%`;
      });

    svg.call(toolTip);

    circlesGroup
      .on("mouseover", function(data) {
        toolTip.show(data, this);
      })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });

    // Create axes labels
    chartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 20)
      .attr("x", 0 - (height - 100))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare(%)");

    chartGroup
      .append("text")
      .attr(
        "transform",
        `translate(${width / 2}, ${height + margin.top - 10})`
      )
      .attr("class", "axisText")
      .text("In Poverty(%)");
  })
  .catch(function(error) {
    console.log(error);
  });
