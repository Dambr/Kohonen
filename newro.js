const mysql = require('mysql');
const parameters = require('./parameters');

// Открываем соединение с сервером
const connection = mysql.createConnection({
	host : 'localhost',
	user : 'root',
	password : '',
	database : 'test',
	insecureAuth : true,
	port : 3306
});

/*
CREATE TABLE `test` (
  `id` int(11) NOT NULL,
  `t` double NOT NULL,
  `s` double NOT NULL,
  `p` double NOT NULL,
  `a` double NOT NULL,
  `r` double NOT NULL,
  `g` double NOT NULL,
  `b` double NOT NULL
);
*/
let size = parameters.size; // Свойство объекта
let countStb = parameters.parameters.length // Количество столбцов в таблице базы
let stb = []; // Критерии создания базы в таблице базы
let names = [];
for (let i = 0; i < countStb; i ++){
	stb.push(parameters.parameters[i].name + " double NOT NULL");
	names.push(parameters.parameters[i].name);
}


new Promise(function(response, reject){
	connection.query("DROP TABLE test", function(err, res){
		if (err) throw err;
		console.log("\t\t\tПрежние данные стерты");
		connection.query("CREATE TABLE test(" +
			"id int(11) NOT NULL, " +
			stb.join(", ") +
			", r double NOT NULL" +
			", g double NOT NULL" +
			", b double NOT NULL" + 
			")",
		function(err, res){
			if (err) throw err;
			response();
		});
	});
})
.then(
	() => {
		console.log("\t\t\tФормат новых данных сконфигурирован");
		main();
	}
)
.then(
	() => {
		for (let i = 0; i < td.length; i ++){
			let values = [];
			for (let key of names){
				values.push(td[i][key]);
			}
			connection.query("INSERT INTO test VALUES(" + td[i].id + "," + values.join(",") + "," + td[i].r + "," + td[i].g + "," + td[i].b + ")", function(err, res){
				if (err) throw err;
				process.stdout.write('\r\x1b[K');
				process.stdout.write('\t\t\tЗаписано\t\t\t' + Math.round(100 * (i + 1) / Math.pow(size, 2)) + ' %');
				if (i == td.length - 1){
					console.log();
				}
			});
		}
	}
)
.then(
	() => {
		connection.end();
	}
);


function main(){
	// Размер сетки и кол-во итераций обучения
	let countOfIterations = parameters.countOfIterations;
	// Начальные константы, влияюще на скорость и величину обучения
	let sigma0 = parameters.sigma0;// size / 2;
	let L0     = parameters.L0;

	function randomInt(min, max) {
		let rand = min + Math.random() * (max + 1 - min);
		return Math.floor(rand);
	}
	function getTdIndex(i, j){
		return size * i + j;
	}
	function getDistance(vector1, vector2){
		let distance = 0;
		for (let key of names){
			distance += Math.pow((vector1[key] - vector2[key]), 2);
		}
		return distance;
	}
	function getNewralDistance(koord1, koord2){
		let distance = 0;
		distance += Math.pow((koord1[0] - koord2[0]), 2);
		distance += Math.pow((koord1[1] - koord2[1]), 2);
		return distance;
	}

	// Шаг 1
	// Создаем поле и инициализируем его
	// Глобальная переменная td
	td = [];
	for (let i = 0; i < size; i ++){
		for (let j = 0; j < size; j ++){
			let _td = {};
			_td.id = getTdIndex(i, j);
			for (let key = 0; key < parameters.parameters.length; key ++){
				_td[parameters.parameters[key].name] = randomInt(parameters.parameters[key].min, parameters.parameters[key].max);
			}
			_td.r = 255;
			_td.g = 255;
			_td.b = 255;
			td.push(_td);
		}
	}

	let master_vector = require('./master_vector');

	// Обучение сети
	
	for (let k = 1; k < countOfIterations; k ++){
		process.stdout.write('\r\x1b[K');
		process.stdout.write('\t\t\tОбучено\t\t\t\t' + Math.round(100 * (k + 1) / countOfIterations) + ' %');
		if (k == countOfIterations - 1){
			console.log();
		}
		let distances = [];
		let koord     = [];
		for (let i = 0; i < size; i ++){
			for (let j = 0; j < size; j ++){
				distances.push(getDistance(master_vector[k % master_vector.length], td[getTdIndex(i, j)]));
				koord.push([i, j]);
			}
		}

		let minDistance = Math.min(...distances);
		let minKoord    = koord[distances.indexOf(minDistance)];

		let lamda = k / Math.log(sigma0);
		let sigma = sigma0 * Math.exp( -k / lamda);
		let L     = L0 * Math.exp( -k / lamda);

		for (let i = 0; i < size; i ++){
			for (let j = 0; j < size; j ++){
				let teta  = Math.exp( -getNewralDistance(minKoord, [i, j]) / (2 * Math.pow(sigma, 2)));
				for (let key of names){
					td[getTdIndex(i, j)][key] += teta * L * (master_vector[k % master_vector.length][key] - td[getTdIndex(i, j)][key]);
				}

				td[getTdIndex(i, j)].r += teta * L * (master_vector[k % master_vector.length].r - td[getTdIndex(i, j)].r);
				td[getTdIndex(i, j)].g += teta * L * (master_vector[k % master_vector.length].g - td[getTdIndex(i, j)].g);
				td[getTdIndex(i, j)].b += teta * L * (master_vector[k % master_vector.length].b - td[getTdIndex(i, j)].b); 
			}
		}
	}
}
