Task = function(name,priority,duedate,projectname,done) {
    this.name = name;
    this.priority = priority;
    this.duedate = duedate;
    this.projectname = projectname;
    this.done = done;
}

TaskWCheckbox = function(task,project) {
    _this = this;
	this.name = task.name;
	this.priority = task.priority;
	this.duedate = task.duedate;
	this.project = project;
	this.done = task.done;
    this.cb = document.createElement("input");
    this.cb.type = "checkbox";
    this.cb.task = _this;
}

Project = function(name,tasks,hidden) {
    this.name = name;
    this.tasks = tasks;
    this.hidden = hidden;
}

ProjectWButton = function(proj) {
    _this = this;
    this.name = proj.name;
    this.tasks = proj.tasks;
    this.hidden = proj.hidden;

    this.hidebtn = document.createElement("button");
    this.hidebtn.className = "showhide"
    if (this.hidden) {
        this.hidebtn.innerHTML = " + ";
    }
    else {
        this.hidebtn.innerHTML = " - ";
    }
    this.hidebtn.proj = _this;

    this.delbtn = document.createElement("button");
    this.delbtn.innerHTML = " X ";
    this.delbtn.className = "del";
    this.delbtn.proj = _this;
}

/**
 * The Model. Model stores items and notifies
 * observers about changes.
 */
function ListModel(items,projs) {
    this._projs = projs;
    this.itemAdded = new MVCEvent(this);
    this.projAdded = new MVCEvent(this);
    this.projDeleted = new MVCEvent(this);
    this.projShowHide = new MVCEvent(this);
}

ListModel.prototype = {
    addItem : function (item) {
        this._projs[item.project.name].tasks.push(item);
        item.project.hidden = false;
        this.itemAdded.notify({ item : item });
    },

    addProj : function (proj) {
        this._projs[proj.name] = proj;
        this.projAdded.notify({ proj : proj });
    },

    delProj : function (proj) {
        delete this._projs[proj.name];
        this.projDeleted.notify({ proj : proj });
    },

    check : function(item) {
        item.done = true;
    },

    uncheck : function(item) {
        item.done = false;
    },

    saveList : function() {
        var res = {};

        for (var proj in this._projs) {
            if (this._projs.hasOwnProperty(proj)){
                var newtasks = [];
                for (var i in this._projs[proj].tasks) {
                    var task = this._projs[proj].tasks[i]
                    if (! task.done) {
                        newtasks.push(new Task(task.name,task.priority,task.duedate,task.project.name,task.done));
                    }
                }
                if (newtasks.length !== 0) {
                    res[this._projs[proj].name] = new Project(this._projs[proj].name,newtasks,false);
                }
            }
        }
        localStorage.setItem("todoDatabase",JSON.stringify(res));
    },

    loadList : function() {
        var projlst = JSON.parse(localStorage.getItem("todoDatabase"));
        for (proj in projlst) {
            var tasklst = [];
            this._projs[projlst[proj].name] = new ProjectWButton(new Project(projlst[proj].name,tasklst,false));
            for (var i in projlst[proj].tasks) {
                var task = projlst[proj].tasks[i];
                tasklst.push(new TaskWCheckbox(task,this._projs[projlst[proj].name]));
            }
        }

    },
    showhide : function(proj) {
        if (proj.hidden) {
            proj.hidden = false;
        }
        else {
            proj.hidden = true;
        }
        this.projShowHide.notify({ proj : proj });
    }
};


function MVCEvent(sender) {
    this._sender = sender;
    this._listeners = [];
}

MVCEvent.prototype = {
    attach : function (listener) {
        this._listeners.push(listener);
    },
    notify : function (args) {
        var index;

        for (index = 0; index < this._listeners.length; index += 1) {
            this._listeners[index](this._sender, args);
        }
    }
};

/**
 * The View. View presents the model and provides
 * the UI events. The controller is attached to these
 * events to handle the user interraction.
 */
function ListView(model, elements) {
    this._model = model;
    this._elements = elements;

    this.taskButtonClicked = new MVCEvent(this);
    this.projButtonClicked = new MVCEvent(this);
    this.delButtonClicked = new MVCEvent(this);
    this.itemChecked = new MVCEvent(this);
    this.itemUnchecked = new MVCEvent(this);
    this.windowOnload = new MVCEvent(this);
    this.windowOnunload = new MVCEvent(this);
    this.projShowHide = new MVCEvent(this);

    var _this = this;

    // attach model listeners
    this._model.itemAdded.attach(function () {
        _this.rebuildList();
    });

    this._model.projAdded.attach(function () {
        _this.rebuildList();
    });

    this._model.projDeleted.attach(function () {
        _this.rebuildList();
    });

    this._model.projShowHide.attach(function () {
        _this.rebuildList();
    });

    // attach listeners to HTML controls

    this._elements.taskButton.onclick = function () {
        _this.taskButtonClicked.notify();
    };

    this._elements.projButton.onclick = function () {
        _this.projButtonClicked.notify();
    };

    this._elements.list.onclick = function (e) {
        if (e.target.className === "showhide") {
            _this.projShowHide.notify({ item : e.target });
        }
        else {
            if (e.target.className === "del") {
            _this.delButtonClicked.notify({ item : e.target.proj });
            }
        }
    };

    this._elements.list.onchange = function(e) {
        if (e.target.checked) {
            _this.itemChecked.notify({ item : e.target.task });
        }
        else {
            _this.itemUnchecked.notify({ item : e.target.task });
        }
        _this.rebuildList();
    };

    this._elements.window.onload = function() {
        _this.windowOnload.notify();
    };

    this._elements.window.onunload = function() {
        //_this.windowOnunload.notify();
    };

}

ListView.prototype = {
    show : function () {
        this.rebuildList();
    },

    rebuildList : function () {

        var list, projs, projSelect, i, j;

        list = this._elements.list;
        list.innerHTML = "";

        projs = this._model._projs;

        projSelect = this._elements.projSelect;
        projSelect.innerHTML = "";

        if (Object.getOwnPropertyNames(projs).length === 0) {
            this._elements.newtask.style.visibility = 'hidden';
        }
        else {
            this._elements.newtask.style.visibility = 'visible';
        }

        for (i in projs) {
            if (projs.hasOwnProperty(i)) {
                var newproj = document.createElement("li");
                newproj.appendChild(projs[i].delbtn);
                newproj.appendChild(projs[i].hidebtn);
                newproj.appendChild(document.createTextNode("Project: "));
                newproj.appendChild(document.createTextNode(projs[i].name));

                var newoption = document.createElement("option");
                newoption.appendChild(document.createTextNode(projs[i].name));
                projSelect.appendChild(newoption);

                var projtasks = document.createElement("ul");
                newproj.appendChild(projtasks);


                for (j in projs[i].tasks) {

                    var newitem = document.createElement("li");
                    newitem.appendChild(projs[i].tasks[j].cb);
                    newitem.appendChild(document.createTextNode(projs[i].tasks[j].name));
                    newitem.appendChild(document.createTextNode(" - Due: "));
                    newitem.appendChild(document.createTextNode(projs[i].tasks[j].duedate));
                    newitem.className = projs[i].tasks[j].priority;

                    if (projs[i].tasks[j].done) {
                        newitem.classList.add("done");
                    }
                    else {
                        newitem.classList.remove("done");
                    }

                    if (projs[i].hidden) {
                        newitem.style.display = "none";
                        projs[i].hidebtn.innerHTML = " + ";
                    }
                    else {
                        newitem.style.display = "block"
                        projs[i].hidebtn.innerHTML = " - ";
                    }

                    projtasks.appendChild(newitem);
                }
                list.appendChild(newproj);
            }
        }

        this._elements.inputProj.value = "";
        this._elements.inputTask.value = "";

        this._model.saveList();
    }
};

/**
 * The Controller. Controller responds to user actions and
 * invokes changes on the model.
 */
function ListController(model, view) {
    this._model = model;
    this._view = view;

    var _this = this;

    this._view.taskButtonClicked.attach(function () {
        _this.addItem();
    });

    this._view.projButtonClicked.attach(function () {
        _this.addProj();
    });

    this._view.delButtonClicked.attach(function (sender, args) {
        _this.delProj(args.item);
    });

    this._view.itemChecked.attach(function (sender, args) {
        _this.checkItem(args.item);
    });

    this._view.itemUnchecked.attach(function (sender, args) {
        _this.uncheckItem(args.item);
    });

    this._view.windowOnload.attach(function () {
        _this.loadList();
        _this._view.show();
    });

    this._view.windowOnunload.attach(function () {
        _this.saveList();
    });

    this._view.projShowHide.attach(function (sender, args) {
        _this.showhide(args.item.proj);
    });
}

ListController.prototype = {
    addItem : function () {
    	
        var item = this._view._elements.inputTask.value;
        var priority = this._view._elements.priority.value;
        var duedate = this._view._elements.duedate.value;
        var project = this._model._projs[this._view._elements.projSelect.value];
        if (item) {
            this._model.addItem(new TaskWCheckbox(new Task(item,priority,duedate,project.name,false),project));
        }
    },
    addProj : function () {
        
        var proj = this._view._elements.inputProj.value;
        if (proj && ! this._model._projs.hasOwnProperty(proj)) {
            this._model.addProj(new ProjectWButton(new Project(proj,[],false)));
        }
    },

    delProj : function (proj) {
        this._model.delProj(proj);
    },

    checkItem : function(item) {

        this._model.check(item);
    },

    uncheckItem : function(item) {
        this._model.uncheck(item);
    },

    loadList : function() {
        this._model.loadList();
    },

    saveList : function() {
        this._model.saveList();
    },

    showhide : function(proj) {
        this._model.showhide(proj);
    }
};
