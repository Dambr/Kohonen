
let text = JSON.parse(document.getElementById("text").textContent);
let size = Number(document.getElementById("size").textContent);
let parameters = JSON.parse(document.getElementById("parameters").textContent);

function getTdIndex(i, j){
	return size * i + j;
}
function getColor(r, g, b){
	return 'rgb(' + r + ',' + g + ',' + b + ')';
}
function drawTdColor(i, j, color){
	document.getElementsByTagName('td')[getTdIndex(i, j)].style.backgroundColor = color;
}
function getDistance(vector1, vector2){
	let distance = 0;
	for (let key of names){
		distance += Math.pow((vector1[key] - vector2[key]), 2);
	}
	return distance;
}

function getColorLength(color){
	let len = 0;
	for (let i = 0; i < color.length; i ++){
		len += Math.pow(color[i], 2);
	}
	return Math.sqrt(len);
}

function getColorDeg(color1, color2){
	let deg = 0;
	for (let i = 0; i < color1.length; i ++){
		deg += (color1[i] * color2[i]) / (getColorLength(color1) * getColorLength(color2));
	}
	return deg;
}

function getColorDistance(color1, color2){
	let distance = 0;
	for (let i = 0; i < color1.length; i ++){
		distance += Math.pow((color1[i] - color2[i]), 2);
	}
	return Math.sqrt(distance);
}

function isEqualVectors(vector1, vector2){
	let len = Math.max(vector1.length, vector2.length);
	let sorted1 = vector1.slice().sort();
	let sorted2 = vector2.slice().sort();
	for (let i = 0; i < len; i ++){
		if (sorted1[i] !== sorted2[i]){
			return false;
		}
	}
	return true;
}

function getColorVector(color){
	let colorVector = color.replace('rgb(', '').replace(')', '').split(', ');
	for (let i = 0; i < colorVector.length; i ++){
		colorVector[i] = Number(colorVector[i]);
	}
	return colorVector;
}

function likeMasterVector(color){
	let colorVector = getColorVector(color);
	if (isEqualVectors(colorVector, [255, 255, 255])){
		return 'Неопределено';
	}
	let table = document.getElementById('master_vector');
	let tr = table.getElementsByTagName('tr');
	let master_color = [];
	for (let i = 0; i < tr.length; i ++){
		master_color.push(getColorVector(document.getElementById('master_vector').getElementsByTagName('tr')[i].getElementsByTagName('td')[1].style.backgroundColor));
	}
	let distances = [];
	for (let i = 0; i < tr.length; i ++){
		distances.push(getColorDeg(colorVector, master_color[i]));
	}
	let minDistance = Math.max(...distances);
	let minIndex    = distances.indexOf(minDistance);

	console.log(color, distances);

	return document.getElementById('master_vector').getElementsByTagName('tr')[minIndex].getElementsByTagName('td')[0].textContent;
}

function projection(vector){
	for (let i = 0; i < td.length; i ++){
		document.getElementsByTagName('td')[i].style.borderColor = 'black';
	}
	let distances = [];
	let koord     = [];
	for (let i = 0; i < size; i ++){
		for (let j = 0; j < size; j ++){
			distances.push(getDistance(vector, td[getTdIndex(i, j)]));
			koord.push([i, j]);
		}
	}
	let minDistance = Math.min(...distances);
	let minKoord    = koord[distances.indexOf(minDistance)];
	document.getElementsByTagName('td')[getTdIndex(...minKoord)].style.borderColor = 'white';

	let problem = likeMasterVector(document.getElementsByTagName('td')[getTdIndex(...minKoord)].style.backgroundColor);

	let solution = JSON.parse(document.getElementById('solution').textContent);
	
	if (problem != 'Неопределено'){
		let index = solution.problem.indexOf(problem);
		let values = [];
		for (let i = 0; i < solution.solution.length; i ++){
			values.push(solution.solution[i].value);
		}
		let array = [];
		for (let i = 0; i < solution.solution.length; i ++){
			array.push(values[i][index]);
		}
		solution = 'Решение: ' + solution.solution[array.indexOf(Math.max(...array))].name;
	}
	else{
		solution = '';
	}
	document.getElementById('output').getElementsByTagName('label')[0].textContent = 'Проблема: ' + problem;
	document.getElementById('output').getElementsByTagName('label')[1].textContent = solution;
}

// Создаем поле и инициализируем его
let names = [];
for (let i = 0; i < parameters.parameters.length; i ++){
	names.push(parameters.parameters[i].name);
}
let td = [];
for (let i = 0; i < size; i ++){
	let tr = document.createElement('tr');
	for (let j = 0; j < size; j ++){
		let _td = {};
		_td.id = getTdIndex(i, j);
		for (let key = 0; key < parameters.parameters.length; key ++){
			_td[parameters.parameters[key].name] = 0;
		}
		_td.r = 255;
		_td.g = 255;
		_td.b = 255;
		_td.element = document.createElement('td');
		td.push(_td);
		tr.appendChild(td[td.length - 1].element);
	}
	document.getElementById('table').appendChild(tr);
}

for (let i = 0; i < size; i ++){
	for (let j = 0; j < size; j ++){
		let title = [];
		for (let key of names){
			td[text[getTdIndex(i, j)].id][key] = text[getTdIndex(i, j)][key];
			title.push(key + ": " + text[getTdIndex(i, j)][key]);
		}
		td[text[getTdIndex(i, j)].id].r = text[getTdIndex(i, j)].r;
		td[text[getTdIndex(i, j)].id].g = text[getTdIndex(i, j)].g;
		td[text[getTdIndex(i, j)].id].b = text[getTdIndex(i, j)].b;

		document.getElementsByTagName('td')[text[getTdIndex(i, j)].id].title = title.join("\n");
	}
}

// Покраска поля
for (let i = 0; i < size; i ++){
	for (let j = 0; j < size; j ++){
		drawTdColor(i, j, getColor(td[getTdIndex(i, j)].r, td[getTdIndex(i, j)].g, td[getTdIndex(i, j)].b));
	}
}
