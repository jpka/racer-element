Polymer("racer-element", {
  query: {},
  at: null,

  trigger: function() {
    var name = arguments[0],
    data = [].slice.call(arguments, 1),
    fname,
    on;

    fname = name.split(":").map(function(word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join("");

    if (on = this["on" + fname]) {
      on.apply(this, data);
    }
    this.fire(name, data);
  },
  on: function(type, cb) {
    this.addEventListener(type, function(e) {
      cb.apply({}, e.detail);
    });
  },
  set child(element) {
    while (this.firstElementChild) {
      this.removeChild(this.firstElementChild);
    }
    this.appendChild(element);

    this.update();
  },
  get child() {
    return this.firstElementChild;
  },
  set racer(racer) {
    var self = this;
    racer.ready(function(model) {
      self.model = model;
    });
  },
  set model(model) {
    var self = this;
    this._model = model;

    if (!this.child) {
      this.child = document.createElement(this.childType || "div");
      if (!this.child.model) this.child.model = {};
    }

    if (model.get(this.at)) {
      this.trigger("model:load");
    } else {
      model.subscribe(this.at, function() {
        self.trigger("model:load");
      });
    }
  },
  get model() {
    return this._model;
  },
  resolve: function(path) {
    var resolved = [];
    if (this.at) resolved.push(this.at);
    if (path) resolved.push(path);
    return resolved.length > 0 ? resolved.join(".") : null;
  },
  del: function(path) {
    this._model.pass({local: true}).del(this.resolve(path));
  },
  set: function(key, value) {
    this._model.pass({local: true}).set(this.resolve(key), value);
  },
  get: function(key) {
    return this._model.get(this.resolve(key));
  },
  onChildSave: function() {
    this.save();
  },
  onChildDelete: function() {
    this.del();
  },
  listen: function(model) {
    var self = this;

    if (!this.turbo) {
      this.child.addEventListener("save", function(e) {
        e.stopPropagation();
        self.onChildSave();
        self.fire("save");
      });
    }
    this.child.addEventListener("delete", function(e) {
      e.stopPropagation();
      self.onChildDelete();
      self.fire("delete");
    });

    if (!model) model = this._model;

    model.on("all", "**", function(path, ev, data, oldData, passed) {
      self.trigger.call(self, ev, path, data, oldData);
    });
  },
  update: function(data) {
    var data,
    self = this,
    key;
    if (!this.child || !this.child.model || !this._model) return;
    data = data || this._model.get();

    for (key in data) {
      this.child.model[key] = data[key];
    }
  },
  save: function() {
    var key, value;
    for (key in this.child.model) {
      value = this.child.model[key];
      if (this.get(key) !== value) {
        this.set(key, value);
      }
    }
  },
  reset: function() {
    this.child.model = this._model.get(this.at);
  },
  onModelLoad: function() {
    this.listen();
    this.update();
  },
  onChange: function(name, value) {
    if (!this.child) return;
    this.child.model[name] = value;
  }
});
