var fs          = require('fs'),
    html        = require('html'),
    js_beautify = require('js-beautify').js_beautify,
		connect     = require('connect'),
    _           = require('underscore');


/* TODO
- allow for .load to be called asynchronously and only load after all are done.
- integrate sequel library
- turn chart() into highchart(), d3(), basic() methods
- allow for tt.port() to specify a new port

*/

// Code to turn javascript in node into a flat file
var jsff = {
  htmlTemplateFactory: _.template('<html><head><link rel="stylesheet" type="text/css" href="css/chart.css"></head><body><%= divs %><script src="js/thirdparty/jquery-1.10.2.min.js"></script><script src="js/thirdparty/d3.v3.min.js"></script><script src="js/thirdparty/highcharts.js"></script><script src="js/thirdparty/miso.ds.deps.ie.0.4.1.js"></script><script src="js/thirdparty/jquery.all-my-charts.js"></script><%= libs %><script><%= scripts %></script></body></html>'),
  waitForCharts: function(){
    
  },
  jsToFlatFile: function(){
    jsff.writeDataToFile(arguments);
    var libs    = jsff.appendJsLibs(arguments);
    var divs    = jsff.prependTargetDivs(arguments);
    var scripts = jsff.appendJs(arguments);
    jsff.createIndexFile(divs, libs, scripts);
    jsff.startServer();
    return this
  },
  port: 8889,
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
      scripts = _.values(arguments);
      return chart;
    };

    chart.desc = function(value) {
      if (!arguments.length) return description;
      description = value;
      return chart;
    };

    return chart;
  },
  writeDataToFile: function(args){
    var createFolderStructure_once = _.once(jsff.createFolderStructure);

    _.each(args, function(fn){ 
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
  findUniqueLibs: function(args){
    var uniq_libs = [];
    _.each(args, function(fn){
      uniq_libs.push(fn().scripts())
    });
    return _.uniq(_.flatten(uniq_libs));
  },
  appendJsLibs: function(args){
    var uniq_libs = jsff.findUniqueLibs(args);
    var libs = _.map(uniq_libs, function(lib){
      jsff.writeJsLibs(lib)
      return '<script src="' + lib + '"></script>'
    }).join('');

    return libs;
  },
  prependTargetDivs: function(args){
    var divs = _.map(args, function(fn){ 
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
  appendJs: function(args){
    var scripts = _.map(args, function(fn){ 
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
  startServer: function(){
  	var app = connect().use(connect.static('./tt-charts'));
  	app.listen(jsff.port);
  	console.log('Running on 0.0.0.0:' + jsff.port)
  }

}


module.exports = {
  load: jsff.waitForCharts,
  loadSync: jsff.jsToFlatFile,
  chart: jsff.createChartObject
}