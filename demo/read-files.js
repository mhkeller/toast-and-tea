var tt = require('../toast-and-tea.js');


tt.readCsv('data/sp500.csv', function(err, data){
	console.log(data[0])
});

var csvSync = tt.readCsvSync('data/sp500.csv');
console.log(csvSync[0])


tt.readJson('data/cities.json', function(err, data){
	console.log(data[0])
})

var jsonSync = tt.readJsonSync('data/cities.json');
console.log(jsonSync[0])