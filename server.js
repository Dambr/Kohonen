const mysql = require('mysql');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const urlencodedParser = bodyParser.urlencoded({extended : false});
const server = {host : '127.0.0.1', port : 4000};
const connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'test',
	insecureAuth : true,
	port : 3306
});

app.set('view engine', 'ejs');
app.use('/public', express.static('public'));


app.get('*', function(req, res){
	let array;
	new Promise(function(response, reject){
		connection.query("SELECT * FROM test", function(error, result){
			array = result;
			response();
		});
	})
	.then(
		() => {
			res.render('index.ejs', {array : JSON.stringify(array), size : Math.floor(Math.sqrt(array.length)), parameters: JSON.stringify(require('./parameters.json')), params: require('./parameters.json'), master_vector: require('./master_vector')});
		}
	)
});

app.listen(server.port, server.host);
console.log('\t\t\t', server);