var fs         = require('fs'),
		d3         = require('d3'),
		tt         = require('./toast-and-tea.js');

var data = d3.csv.parse(fs.readFileSync('sp500.csv').toString());

var formatDate = d3.time.format("%b %Y");

tt.selection()
		.datum(data)
  .call(tt.timeSeriesChart()
    .x(function(d) { return formatDate.parse(d.date); })
    .y(function(d) { return +d.price; }));

tt.load()