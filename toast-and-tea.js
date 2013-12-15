var fs          = require('fs'),
    html        = require('html'),
    js_beautify = require('js-beautify').js_beautify,
		connect     = require('connect'),
    _           = require('underscore');


/* TODO
- integrate sequel library
- turn chart() into highchart(), d3(), basic() methods

*/

// Code to turn javascript in node into a flat file
var jsff = {
  htmlTemplateFactory: _.template('<html><head><link rel="stylesheet" type="text/css" href="css/chart.css"></head><body><%= divs %><script src="js/thirdparty/jquery-1.10.2.min.js"></script><script src="js/thirdparty/d3.v3.min.js"></script><script src="js/thirdparty/highcharts.js"></script><script src="js/thirdparty/miso.ds.deps.ie.0.4.1.js"></script><script src="js/thirdparty/jquery.all-my-charts.js"></script><%= libs %><script><%= scripts %></script></body></html>'),
  jsToFlatFile: function(){
    jsff.writeDataToFile(arguments);
    var libs    = jsff.appendJsLibs(arguments);
    var divs    = jsff.prependTargetDivs(arguments);
    var scripts = jsff.appendJs(arguments);
    jsff.createIndexFile(divs, libs, scripts);
    jsff.startServer();
  },
  createChartObject: function(){
    var description = '',
        data_name   = '',
        scripts     = [],
        data_value  = {};

    function chart() { };

    chart.data = function(data_name_val, data_val) {
      if (!arguments.length) return {name: data_name, data: data_value};
      data_value = data_val;
      data_name  = data_name_val;
      return chart;
    };

    chart.scripts = function(value) {
      if (!arguments.length) return scripts;
      scripts = arguments;
      return chart;
    };

    chart.desc = function(value) {
      if (!arguments.length) return description;
      description = value;
      return chart;
    };

    return chart;
  },
  writeDataToFile: function(arguments){
    var createFolderStructure_once = _.once(jsff.createFolderStructure);

    _.each(arguments, function(fn){ 
      var data_info   = fn().data(),
          data_name   = data_info.name,
          data_object = data_info.data;

      createFolderStructure_once();
      fs.writeFileSync('./tt-charts/data/' + data_name + '.json', JSON.stringify(data_object));
    });
  },
  writeJsLibs: function(lib_path){
    var file_name = lib_path.match(/[^\/]*(?=[\w\.]*$)/)[0],
        lib       = fs.readFileSync('./'  + lib_path).toString();

    fs.writeFileSync('./tt-charts/js/' + file_name, lib);
  },
  appendJsLibs: function(arguments){
    var libs = _.map(arguments, function(fn){ 
      var fn_libs = _.map(fn().scripts(), function(fn_lib){
        jsff.writeJsLibs(fn_lib)
        return '<script src="' + fn_lib + '"></script>'
      }).join('');

      return fn_libs
    }).join('');
    return libs;
  },
  prependTargetDivs: function(arguments){
    var divs = _.map(arguments, function(fn){ 
      var selector  = fn.toString().match(/(^.*\.allMyCharts|d3.select.*\))/m)[0].match(/(\'|\").+(\'|\")/)[0].replace(/(\'|\")/g, ''),
          prefix    = ((selector[0] == '.') ? 'class' : 'id'),
          div = ''

      if (selector != 'body' && selector != 'html'){
        div = '<div ' + prefix + '="' + selector.slice(1) + ((prefix != 'id') ? ' chart' : '" class="chart') + '"></div>';
      };

      return div;
    }).join('');

    return divs;
  },
  appendJs: function(arguments){
    var scripts = _.map(arguments, function(fn){ 
      var data_name = fn().data().name,
          fn_string = fn.toString()
                        .replace(/\.chart\(\)\n*((\s*\..*\n)+)/, '')
                        .replace(/return.*/, '$.getJSON("./data/' + data_name + '.json", function(' + data_name + ') {');

      return '(' + fn_string + ')})();';
    }).join('');

    return js_beautify(scripts, { indent_size: 2 });
  },
  createFolderStructure: function(){
    if (!fs.existsSync('./tt-charts')) {
      fs.mkdirSync('./tt-charts');
      fs.mkdirSync('./tt-charts/css');
      fs.mkdirSync('./tt-charts/data');
      fs.mkdirSync('./tt-charts/js');
      fs.mkdirSync('./tt-charts/js/thirdparty');
      fs.writeFileSync('./tt-charts/css/chart.css', fs.readFileSync(__dirname + '/assets/css/chart.css'));
    }
    fs.writeFileSync('./tt-charts/js/thirdparty/jquery-1.10.2.min.js',        fs.readFileSync(__dirname + '/assets/js/thirdparty/jquery-1.10.2.min.js'));
    fs.writeFileSync('./tt-charts/js/thirdparty/miso.ds.deps.ie.0.4.1.js',    fs.readFileSync(__dirname + '/assets/js/thirdparty/miso.ds.deps.ie.0.4.1.js'));
    fs.writeFileSync('./tt-charts/js/thirdparty/highcharts.js',               fs.readFileSync(__dirname + '/assets/js/thirdparty/highcharts.js'));
    fs.writeFileSync('./tt-charts/js/thirdparty/jquery.all-my-charts.js',     fs.readFileSync(__dirname + '/assets/js/thirdparty/jquery.all-my-charts.js'));
    fs.writeFileSync('./tt-charts/js/thirdparty/d3.v3.min.js',                fs.readFileSync(__dirname + '/assets/js/thirdparty/d3.v3.min.js'));
  },
  createIndexFile: function(divs, libs, scripts){
    var page = jsff.htmlTemplateFactory({divs: divs, libs: libs, scripts: scripts});
    fs.writeFileSync('./tt-charts/index.html', html.prettyPrint(page, {indent_size: 2}));

  },
  startServer: function(port){
  	port = ((port) ? port : 8080);
  	var app = connect().use(connect.static('./tt-charts'));
  	app.listen(port);
  	console.log('Running on 0.0.0.0:' + port)
  }

}


module.exports = {
  load: jsff.jsToFlatFile,
  chart: jsff.createChartObject
}