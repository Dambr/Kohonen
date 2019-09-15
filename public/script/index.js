
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
