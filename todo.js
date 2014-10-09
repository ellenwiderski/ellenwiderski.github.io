window.onload = localLoad;

function addnew() {
	var newitem = document.getElementById('new');
	var list = document.getElementById('list');
	var item = document.createElement("li");
	var cb = document.createElement("input");
	cb.type = "checkbox";
	
	item.className = "notdone";
	item.appendChild(cb);
	item.appendChild(document.createTextNode(newitem.value));
	
	list.appendChild(item);

	cb.onchange = isChecked;

	newitem.value = "";
	
	localSave();
}

function isChecked() {
	if (this.checked) {
		//this.parentNode.style.textDecoration = "line-through";
		this.parentNode.className = "done";
	}
	else {
		//this.parentNode.style.textDecoration = "none";
		this.parentNode.className = "notdone";
	}
	localSave();
}

function localSave() {
	var res = [];
	var items = document.querySelectorAll("#list li");
	for (var i = 0; i < items.length; i++) {
		if (items[i].className !== "done") {
			res.push(items[i].innerText);
		}
	}
	localStorage.setItem("todoDatabase",JSON.stringify(res));
}

function localLoad() {
	var items = JSON.parse(localStorage.getItem("todoDatabase"));
	var newitem = document.getElementById('new');
	for (var i = 0; i < items.length; i++) {
		newitem.value = items[i];
		addnew();
	}
}