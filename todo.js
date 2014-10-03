function addnew() {
	var newitem = document.getElementById('new');
	var list = document.getElementById('list');
	var item = document.createElement("li");
	var checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	
	item.appendChild(checkbox);
	item.appendChild(document.createTextNode(newitem.value));
	
	list.appendChild(item);

	checkbox.onchange = function() {
		var item = this.parentNode;
		if (this.checked) {
			item.style.textDecoration = "line-through";
		}
		else {
			item.style.textDecoration = "none";
		}

	}

	newitem.value = "";
}