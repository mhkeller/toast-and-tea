var fs          = require('fs'),
    html        = require('html'),
    js_beautify = require('js-beautify').js_beautify,
		connect     = require('connect'),
    _           = require('underscore');

var htmlTemplateFactory = _.template('<html><head><link rel="stylesheet" type="text/css" href="css/chart.css"></head><body><script src="js/thirdparty/d3.v3.min.js"></script><script src="js/timeseries.js"></script><script><%= script %></script></body></html>');

function load(chart_fns, port){

  writeData(chart_fns);
  var script = createJs(chart_fns);
  createIndexFile(script);
  startServer(port);
}

function writeData(chart_fns){
  if (typeof chart_fns == 'function'){
    writeDataToFile(chart_fns)
  }else if (typeof chart_fns == 'object'){
    _.each(chart_fns, function(chart_fn){
      writeDataToFile(chart_fn);
    })
  }
}

function writeDataToFile(chart_fn){
  _.each(chart_fn(), function(data, name){
    writeToFile('data', name, data)
  });
}

// Load the data externally
function frontendifyJs(fn){
  var data_name = _.keys(fn())[0];
  var fn_string = fn.toString()
                    .replace(/return.*/, 'd3.json("./data/'+data_name+'.json", function(error, '+data_name+') {');

  return '(' + fn_string + ')})();';
} 

function createJs(chart_fns){
  var script;

  if (typeof chart_fns == 'function'){
    script = frontendifyJs(chart_fns);
  }else if (typeof chart_fns == 'object'){
    script = _.map(chart_fns, function(chart_fn){ return frontendifyJs(chart_fn) }).join('\n');
  }
  
  return js_beautify(script, { indent_size: 2 })
}

function writeToFile(dir, name, data){
  if (!fs.existsSync('./tt-charts')) {
    fs.mkdirSync('./tt-charts');
    fs.mkdirSync('./tt-charts/css');
    fs.mkdirSync('./tt-charts/data');
    fs.mkdirSync('./tt-charts/js');
    fs.mkdirSync('./tt-charts/js/thirdparty');
    fs.writeFileSync('./tt-charts/js/thirdparty/d3.v3.min.js', fs.readFileSync(__dirname + '/assets/js/thirdparty/d3.v3.min.js'))
    fs.writeFileSync('./tt-charts/js/timeseries.js',           fs.readFileSync(__dirname + '/assets/js/timeseries.js'))
    fs.writeFileSync('./tt-charts/css/chart.css',              fs.readFileSync(__dirname + '/assets/css/chart.css'))
  }
  
  fs.writeFileSync('./tt-charts/'+dir+'/'+name+'.' + ((dir == 'data') ? 'json' : 'css'), JSON.stringify(data));

}
function createIndexFile(script){

  var page = htmlTemplateFactory({script: script});
  fs.writeFileSync('./tt-charts/index.html', html.prettyPrint(page, {indent_size: 2}));

}

function startServer(port){
	port = ((port) ? port : 8080);
	var app = connect().use(connect.static('./tt-charts'));
	app.listen(port);
	console.log('Running on 0.0.0.0:' + port)
}


module.exports = {
  load: load
}