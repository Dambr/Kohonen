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
let size = parameters.size;

new Promise(function(response, reject){
	connection.query("TRUNCATE TABLE test", function(err, res){
		if (err) throw err;
		response();
	});
})
.then(
	() => {
		main();
	}
)
.then(
	() => {
		for (let i = 0; i < td.length; i ++){
			connection.query("INSERT INTO test VALUES(" + td[i].id + "," + td[i].t + "," + td[i].s + "," + td[i].p + "," + td[i].a + "," + td[i].r + "," + td[i].g + "," + td[i].b + ")", function(err, res){
				if (err) throw err;
				console.log('Записано', 100 * (i + 1) / Math.pow(size, 2), '%');
			});
		}
	}
)
.then(
	() => {
		connection.end();
	}
)


function main(){
	// Размер сетки и кол-во итераций обучения
	let countOfIterations = parameters.countOfIterations;

	class Variant{
		constructor(min, max){
			this.min = min;
			this.max = max;
		}
	}

	function randomInt(min, max) {
		let rand = min + Math.random() * (max + 1 - min);
		return Math.floor(rand);
	}
	function getTdIndex(i, j){
		return size * i + j;
	}
	function getDistance(vector1, vector2){
		let distance = 0;
		distance += Math.pow((vector1.t - vector2.t), 2);
		distance += Math.pow((vector1.s - vector2.s), 2);
		distance += Math.pow((vector1.p - vector2.p), 2);
		distance += Math.pow((vector1.a - vector2.a), 2);
		return distance;
	}
	function getNewralDistance(koord1, koord2){
		let distance = 0;
		distance += Math.pow((koord1[0] - koord2[0]), 2);
		distance += Math.pow((koord1[1] - koord2[1]), 2);
		return distance;
	}


	let t = parameters.temperature;
	let s = parameters.speed;
	let p = parameters.pressure;
	let a = parameters.accelerometer;
	// Начальные константы, влияюще на скорость и величину обучения
	let sigma0 = size / 2;
	let L0     = parameters.L0;



	// Шаг 1
	// Создаем поле и инициализируем его
	// Глобальная переменная td
	td = [];
	for (let i = 0; i < size; i ++){
		// let tr = document.createElement('tr');
		for (let j = 0; j < size; j ++){
			td.push({
				// element: document.createElement('td'),
				id: getTdIndex(i, j),
				t: randomInt(t.min, t.max),		// Температура (С)
				s: randomInt(s.min, s.max),		// Скорость (м/с)
				p: randomInt(p.min, p.max),		// Давление (мбар), норма = 986
				a: randomInt(a.min, a.max),		// Перегрузка (g)
				r: 255,		// Доля красного
				g: 255,		// Доля зеленого
				b: 255		// Доля синего
			});
		}
	}
	let master_vector = require('./master_vector');

	// Обучение сети

	for (let k = 1; k < countOfIterations; k ++){

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

		let lamda = (k) / Math.log(sigma0);
		let sigma = sigma0 * Math.exp( -(k) / lamda);
		let L     = L0 * Math.exp( -(k) / lamda);

		for (let i = 0; i < size; i ++){
			for (let j = 0; j < size; j ++){
				let teta  = Math.exp( -getNewralDistance(minKoord, [i, j]) / (2 * Math.pow(sigma, 2)));
				td[getTdIndex(i, j)].t += teta * L * (master_vector[k % master_vector.length].t - td[getTdIndex(i, j)].t);
				td[getTdIndex(i, j)].s += teta * L * (master_vector[k % master_vector.length].s - td[getTdIndex(i, j)].s);
				td[getTdIndex(i, j)].p += teta * L * (master_vector[k % master_vector.length].p - td[getTdIndex(i, j)].p);
				td[getTdIndex(i, j)].a += teta * L * (master_vector[k % master_vector.length].a - td[getTdIndex(i, j)].a);
				
				td[getTdIndex(i, j)].r += teta * L * (master_vector[k % master_vector.length].r - td[getTdIndex(i, j)].r);
				td[getTdIndex(i, j)].g += teta * L * (master_vector[k % master_vector.length].g - td[getTdIndex(i, j)].g);
				td[getTdIndex(i, j)].b += teta * L * (master_vector[k % master_vector.length].b - td[getTdIndex(i, j)].b); 
			}
		}
	}
}