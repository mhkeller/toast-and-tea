var fs          = require('fs'),
    html        = require('html'),
    js_beautify = require('js-beautify').js_beautify,
		connect     = require('connect'),
    _           = require('underscore');

var htmlTemplateFactory = _.template('<html><head><link rel="stylesheet" type="text/css" href="css/chart.css"></head><body><%= divs %><script src="js/thirdparty/jquery-1.10.2.min.js"></script><script src="js/thirdparty/d3.v3.min.js"></script><script src="js/thirdparty/highcharts.js"></script><script src="js/thirdparty/miso.ds.deps.ie.0.4.1.js"></script><script src="js/thirdparty/jquery.all-my-charts.js"></script><script><%= script %></script></body></html>');

function createChartObject(){
  var description = '',
      data_name = '',
      data_value = {};

  function chart() { };

  chart.data = function(data_name_val, data_val) {
    if (!arguments.length) return {name: data_name, data: data_value};
    data_value = data_val;
    data_name  = data_name_val;
    return chart;
  };

  chart.desc = function(value) {
    if (!arguments.length) return description;
    description = value;
    return chart;
  };

  return chart;
}

function startTheShow(chart_fns, port){
  writeData(chart_fns);
  var divs   = createDivs(chart_fns);
  var script = createJs(chart_fns);
  createIndexFile(divs, script);
  startServer(port);
}

function writeData(chart_fns){
  if (typeof chart_fns == 'function'){
    writeDataToFile(chart_fns);
  }else if (typeof chart_fns == 'object'){
    _.each(chart_fns, function(chart_fn){
      writeDataToFile(chart_fn);
    })
  }
}

function writeDataToFile(chart_fn){
  var data_info   = chart_fn().data(),
      data_name   = data_info.name,
      data_object = data_info.data;

  writeToFile('data', data_name, data_object);
}

// Load the data externally
function frontendifyJs(fn){
  var data_name = fn().data().name,
      fn_string = fn.toString()
                    .replace(/\.chart\(\)\n*((\s*\..*\n)+)/, '')
                    .replace(/return.*/, '$.getJSON("./data/'+data_name+'.json", function('+data_name+') {');

  return '(' + fn_string + ')})();';
} 

function getDiv(fn){
  var fn_string = fn.toString(),
      selector  = fn_string.match(/^.*\.allMyCharts/m)[0].match(/(\'|\").+(\'|\")/)[0].replace(/(\'|\")/g, ''),
      prefix    = ((selector[0] == '#') ? 'id' : 'class'),
      div       = '<div ' + prefix + '="' + selector.slice(1) + ((prefix != 'id') ? ' chart' : '" class="chart') + '"></div>';

  return div;
}

function createDivs(chart_fns){
  var div;
  if (typeof chart_fns == 'function'){
    div = getDiv(chart_fns);
  }else if (typeof chart_fns == 'object'){
    div = _.map(chart_fns, function(chart_fn){ return getDiv(chart_fn) }).join('\n');
  }
  
  return div;
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
    fs.writeFileSync('./tt-charts/css/chart.css', fs.readFileSync(__dirname + '/assets/css/chart.css'))
  }
  fs.writeFileSync('./tt-charts/js/thirdparty/jquery-1.10.2.min.js',        fs.readFileSync(__dirname + '/assets/js/thirdparty/jquery-1.10.2.min.js'))
  fs.writeFileSync('./tt-charts/js/thirdparty/miso.ds.deps.ie.0.4.1.js',    fs.readFileSync(__dirname + '/assets/js/thirdparty/miso.ds.deps.ie.0.4.1.js'))
  fs.writeFileSync('./tt-charts/js/thirdparty/highcharts.js',               fs.readFileSync(__dirname + '/assets/js/thirdparty/highcharts.js'))
  fs.writeFileSync('./tt-charts/js/thirdparty/jquery.all-my-charts.js',     fs.readFileSync(__dirname + '/assets/js/thirdparty/jquery.all-my-charts.js'))
  fs.writeFileSync('./tt-charts/js/thirdparty/d3.v3.min.js',                fs.readFileSync(__dirname + '/assets/js/thirdparty/d3.v3.min.js'))
  fs.writeFileSync('./tt-charts/js/thirdparty/timeseries.js',               fs.readFileSync(__dirname + '/assets/js/thirdparty/timeseries.js'))
  
  fs.writeFileSync('./tt-charts/'+dir+'/'+name+'.' + ((dir == 'data') ? 'json' : 'css'), JSON.stringify(data));

}
function createIndexFile(divs, script){
  var page = htmlTemplateFactory({divs: divs, script: script});
  fs.writeFileSync('./tt-charts/index.html', html.prettyPrint(page, {indent_size: 2}));

}

function startServer(port){
	port = ((port) ? port : 8080);
	var app = connect().use(connect.static('./tt-charts'));
	app.listen(port);
	console.log('Running on 0.0.0.0:' + port)
}


module.exports = {
  load: startTheShow,
  chart: createChartObject
}