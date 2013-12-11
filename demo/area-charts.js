var fs         = require('fs'),
		d3         = require('d3'),
		tt         = require('./../toast-and-tea.js');

var sp500 = d3.csv.parse(fs.readFileSync('data/sp500.csv').toString());


var area_chart_1 = function() {
	return tt.chart()
           .data('sp500', sp500)
           .desc('This chart is great');

	var formatDate = d3.time.format("%b %Y");

	d3.select('body')
		.datum(sp500)
  .call(timeSeriesChart()
    .x(function(d) { return formatDate.parse(d.date); })
    .y(function(d) { return +d.price; }))
  	.on('mouseover', function(d){console.log(d)});

}

// var area_chart_2 = function() {
// 	return {sp500: sp500};

// 	var formatDate = d3.time.format("%b %Y");

// 	d3.select('body')
// 		.datum(sp500)
//   .call(timeSeriesChart()
//     .x(function(d) { return formatDate.parse(d.date); })
//     .y(function(d) { return +d.other; }))
//   	.on('mouseover', function(d){console.log(d)});

// }

tt.load(area_chart_1)