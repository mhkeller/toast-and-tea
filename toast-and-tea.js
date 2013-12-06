var fs      = require('fs'),
		connect = require('connect'),
		jsdom   = require('jsdom'),
		d3      = require('d3');

var css = '<style>.area {fill: steelblue;}.line {fill: none;stroke: #000;stroke-width: 1px;}</style>',
		htmlStub = '<html><head>' + css + '</head><body><div id="chart"></div><script src="js/thirdparty/d3.v3.min.js"></script></body></html>'

function loadPage(window, port){
	port = ((port) ? port : 8080);

	var page = window.document.documentElement.innerHTML;
	fs.writeFileSync(__dirname + '/tmp/index.html', page);

	var app = connect().use(connect.static(__dirname + '/tmp'));
	app.listen(port);
	console.log('Running on 0.0.0.0:' + port)
}

function timeSeriesChart(opts){
	var data  = opts.data,
	    x_val = opts.x,
	    y_val = opts.y;

	jsdom.env({ 
		features: { QuerySelector : true }, 
		html: htmlStub, 
		done: function(errors, window) {

			var formatDate = d3.time.format("%b %Y");
			d3.select(window.document.querySelector("#chart"))
			    .datum(data)
			  .call(timeSeriesChartCreate()
			    .x(function(d) { return formatDate.parse(d[x_val]); })
			    .y(function(d) { return +d[y_val]; }));

			loadPage(window);

		}
	})




}

function timeSeriesChartCreate() {
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = 760,
      height = 120,
      xValue = function(d) { return d[0]; },
      yValue = function(d) { return d[1]; },
      xScale = d3.time.scale(),
      yScale = d3.scale.linear(),
      xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(6, 0),
      area = d3.svg.area().x(X).y1(Y),
      line = d3.svg.line().x(X).y(Y);

  function chart(selection) {
    selection.each(function(data) {

      // Convert data to standard representation greedily;
      // this is needed for nondeterministic accessors.
      data = data.map(function(d, i) {
        return [xValue.call(data, d, i), yValue.call(data, d, i)];
      });

      // Update the x-scale.
      xScale
          .domain(d3.extent(data, function(d) { return d[0]; }))
          .range([0, width - margin.left - margin.right]);

      // Update the y-scale.
      yScale
          .domain([0, d3.max(data, function(d) { return d[1]; })])
          .range([height - margin.top - margin.bottom, 0]);

      // Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg").data([data]);

      // Otherwise, create the skeletal chart.
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("path").attr("class", "area");
      gEnter.append("path").attr("class", "line");
      gEnter.append("g").attr("class", "x axis");

      // Update the outer dimensions.
      svg .attr("width", width)
          .attr("height", height);

      // Update the inner dimensions.
      var g = svg.select("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // Update the area path.
      g.select(".area")
          .attr("d", area.y0(yScale.range()[0]));

      // Update the line path.
      g.select(".line")
          .attr("d", line);

      // Update the x-axis.
      g.select(".x.axis")
          .attr("transform", "translate(0," + yScale.range()[0] + ")")
          .call(xAxis);
    });
  }

  // The x-accessor for the path generator; xScale ∘ xValue.
  function X(d) {
    return xScale(d[0]);
  }

  // The x-accessor for the path generator; yScale ∘ yValue.
  function Y(d) {
    return yScale(d[1]);
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return xValue;
    xValue = _;
    return chart;
  };

  chart.y = function(_) {
    if (!arguments.length) return yValue;
    yValue = _;
    return chart;
  };

  return chart;
}

module.exports = {
	timeSeriesChart: timeSeriesChart
}