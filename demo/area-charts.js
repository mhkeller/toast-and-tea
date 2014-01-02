var fs         = require('fs'),
		d3         = require('d3'),
		tt         = require('./../toast-and-tea.js');

var sp500 = d3.csv.parse(fs.readFileSync('data/sp500.csv').toString());

var area_chart_1 = function() {
	return tt.chart()
           .data('sp500', sp500)
           .scripts('js/timeseries.js'); // Note, you only need to include a script once and it will work for all chart instances.

	var formatDate = d3.time.format("%b %Y");

	d3.select('#chart1')
		.datum(sp500)
  .call(timeSeriesChart()
    .x(function(d) { return formatDate.parse(d.date); })
    .y(function(d) { return +d.price; }))
  	.on('mouseover', function(d){console.log(d)});

}

var spRandom = d3.csv.parse(fs.readFileSync('data/sp500.csv').toString());

// Introduce some noise to this dataset
spRandom.forEach(function(d){
	d.price = +d.price * Math.random();
})


var area_chart_2 = function() {
	return tt.chart()
           .data('spRandom', spRandom);

	var formatDate = d3.time.format("%b %Y");

	d3.select('#chart2')
		.datum(spRandom)
  .call(timeSeriesChart()
    .x(function(d) { return formatDate.parse(d.date); })
    .y(function(d) { return d.price }))
  	.on('mouseover', function(d){console.log(d)});

}

tt.load(area_chart_1, area_chart_2);