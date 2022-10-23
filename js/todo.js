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
}

function loadTasks() {
	const tasks = getTasks();

	const table = document.getElementById('tasks');
	table.innerHTML = "";
	tasks.forEach(task => {
		table.innerHTML += `
			<tr>
					<th scope="row">${task.id}</th>
					<td>${task.name}</td>
					<td>${task.date}</td>
					<td>
						<button onClick="removeTask(${task.id})"><i class="fa-solid fa-trash"></i></button>
					</td>
				</tr>
		`;
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
	return tasks;
}

function setTasks(tasks) {
	window.localStorage.setItem('tasks', JSON.stringify(tasks));
}

function removeTask(id) {
	const tasks = getTasks();
	const newTasks = tasks.filter(task => task.id !== id);
	setTasks(newTasks);
	loadTasks();
}
