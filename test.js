var fs         = require('fs'),
		d3         = require('d3'),
		tt         = require('./toast-and-tea.js'),
		timeseries = require('./js/timeseries.js');

var data = d3.csv.parse(fs.readFileSync('sp500.csv').toString());

tt.timeSeriesChart({
	data: data,
	x: 'date',
	y: 'price'
})
