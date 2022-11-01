var filter = '';
var nowEdited = 0;
var firstClick = true;

class Task {
	id;
	name;
	date = '';
	errorMsg = '';

	constructor(id, name, date) {
		this.id = id;
		this.name = name;
		this.date = date;
	}

	validate() {
		if (this.name.length < 3) {
			this.errorMsg = 'Nazwa powinna zawierać co najmniej 3 znaki';
			return false;
		}

		if (this.name.length > 255) {
			this.errorMsg = 'Nazwa nie może mieć więcej niż 255 znaków';
			return false;
		}

		let taskDate = Date.parse(this.date);
		let now = Date.now();
		if (taskDate < now) {
			this.errorMsg = 'Data musi być w przyszłości.';
			return false;
		}

		return true;
	}

	generateHTML() {
		if (this.id === nowEdited) {
			return `
				<tr class="task" id='task-${this.id}'>
					<th scope="row">${this.id}</th>
					<td class="has-input">
						<input type="text" id="task-name" name="task-name" value="${this.name}">
					</td>
					<td class="has-input">
						<input type="datetime-local" id="task-date" name="task-date" value="${this.date}">
					</td>
					<td>
						<button onClick="removeTask(${this.id})"><i class="fa-solid fa-trash"></i></button>
					</td>
				</tr>
			`;
		} else {
			return `
				<tr class="task" id='task-${this.id}' onClick='startEditing(${this.id})'>
					<th scope="row">${this.id}</th>
					<td>${this.name}</td>
					<td>${this.date}</td>
					<td>
						<button onClick="removeTask(${this.id})"><i class="fa-solid fa-trash"></i></button>
					</td>
				</tr>
			`;
		}
	}
}

function loadTasks() {
	const tasks = getTasks();

	const table = document.getElementById('tasks');
	table.innerHTML = "";
	tasks.forEach(task => {
		task = new Task(task.id, task.name, task.date);
		table.innerHTML += task.generateHTML();
	});
}

function addTask() {
	const tasks = getTasks();

	const newId = getLastId(tasks);
	const name = document.getElementById('name');
	const date = document.getElementById('date');
	let task = new Task(newId, name.value, date.value);

	if (task.validate()) {
		tasks.push(task);
		setTasks(tasks);
	} else {
		window.alert(task.errorMsg);
	}

	loadTasks();
}

function getLastId(tasks) {
	if (tasks.length === 0) {
		return 1;
	}
	let lastTask = tasks[tasks.length - 1];
	return lastTask.id + 1;
}

function getTasks() {
	const tasks = JSON.parse(window.localStorage.getItem('tasks'));
	if (tasks === null) {
		return [];
	}

	if (filter === '') {
		return tasks;
	}

	const filteredTasks = tasks.filter(task => task.name.includes(filter));
	const highlightedTasks = filteredTasks.map(task => {
		task.name = highlight(task.name);
		return task;
	});
	return highlightedTasks;
}

function setTasks(tasks) {
	window.localStorage.setItem('tasks', JSON.stringify(tasks));
}

function removeTask(id) {
	const tasks = getTasks();
	const newTasks = tasks.filter(task => task.id !== id);
	setTasks(newTasks);
	nowEdited = 0;
	firstClick = true;
	loadTasks();
}

function search() {
	const searchBar = document.getElementById("search-bar");
	filter = searchBar.value;
	if (filter.length < 3) {
		filter = '';
	}
	loadTasks();
}

function highlight(name) {
	let index = name.indexOf(filter);
	if (index >= 0) {
		return name.substring(0, index) + "<span class='highlight'>" + name.substring(index, index + filter.length) + "</span>" + name.substring(index + filter.length);
	}
}

function getTaskById(id) {
	const tasks = getTasks();
	return tasks.find(task => task.id === id);
}

function startEditing(id) {	
	if (nowEdited === id) {
		return;
	}
	
	if (!firstClick) {
			return;
	}
	
	nowEdited = id;
	
	loadTasks();
}

function handleBodyClick(event) {
	const inputName = document.getElementById("task-name");
	const inputDate = document.getElementById("task-date");
	
	if (inputName === null || inputDate === null) {
		return; //Edit input doesn't exists.
	}
	
	if (nowEdited === 0) {
		return; // Nothing is beeing edited.
	}
	
	if (clickedOnEditForm(event)) {
		return; // Clicked on edit form. Don't to anything.
	}
	
	if (firstClick) {
		firstClick = false;
		return; // This was first click on form. Wait for seccond click.
	}
	
	if (editTask()) {
		nowEdited = 0;
		firstClick = true;
	
		loadTasks();
	}
}

function clickedOnEditForm(event) {
	const inputName = document.getElementById("task-name");
	const inputDate = document.getElementById("task-date");
	
	if((event.target == inputName) || (event.target == inputDate)) {
		return true;
	} else {
		return false;
	}
}

function editTask() {
	const inputName = document.getElementById("task-name");
	const inputDate = document.getElementById("task-date");
	
	const newTask = new Task(nowEdited, inputName.value, inputDate.value);
	if (!newTask.validate()) {
		console.log("Test");
		window.alert(newTask.errorMsg);
		return false;
	}
	
	let tasks = getTasks();
	tasks = tasks.map(task => {
		if (task.id !== nowEdited) {
			return task;
		}
		
		return newTask;
	});
	
	setTasks(tasks);
	return true;
}