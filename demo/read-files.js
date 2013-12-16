var tt = require('../toast-and-tea.js');


tt.readCsvAsync('data/sp500.csv', function(err, data){
	console.log(data[0])
});

var csvSync = tt.readCsv('data/sp500.csv');
console.log(csvSync[0])


tt.readJsonAsync('data/cities.json', function(err, data){
	console.log(data[0])
})

var jsonSync = tt.readJson('data/cities.json');
console.log(jsonSync[0])