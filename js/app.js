(function(){

	d3.csv("sp500.csv", function(data) {
	  var formatDate = d3.time.format("%b %Y");
	  
	  d3.select("#example")
	      .datum(data)
	    .call(timeSeriesChart()
	      .x(function(d) { return formatDate.parse(d.date); })
	      .y(function(d) { return +d.price; }));
	});

}).call(this);


