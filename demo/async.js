var tt = require('./../toast-and-tea.js');

var data = [
	{
		city: 'New York',
		temp: 27,
		country: 'USA'
	},
	{
		city: 'Los Angeles',
		temp: 72,
		country: 'USA'
	},
	{
		city: 'Paris',
		temp: 34,
		country: 'France'
	},
	{
		city: 'Marseille',
		temp: 43,
		country: 'France'
	},
	{
		city: 'London',
		temp: 33,
		country: 'UK'
	}
]
var db = tt.sql.createTableSync('cities', data);

// Save the reference to the db and call any native sqlite3 method
db.all('SELECT * FROM cities LIMIT 1 OFFSET 0', function(err, rows){
	console.log(rows)
})

// Create the table as you query
tt.sql.query('SELECT * FROM cities LIMIT 1 OFFSET 1', 'cities', data, function(err, rows){
	console.log(rows)
});

// Or query an existing table
tt.sql.query('SELECT * FROM cities LIMIT 1 OFFSET 2', function(err, rows){
	console.log(rows)
});

// Or do it the old fashioned way
tt.sql.createTable('cities', data, function(db){

	db.all('SELECT * FROM cities LIMIT 1 OFFSET 3', function(err, response){
		console.log(response)
	})

	db.all('SELECT * FROM cities LIMIT 1 OFFSET 4', function(err, response){
		console.log(response)
	})

})
