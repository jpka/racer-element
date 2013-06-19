function observeChildModelProperty(self, key) {
  Object.defineProperty(self.child.model, key, {
    set: function(value) {
      if (this.turbo) {
        self.set(key, value);
      }
      self._childModel[key] = value;
    },
    get: function() {
      return self._childModel[key];
    }
  });
}

module.exports = {
  ready: function() {
    if (this.firstElementChild) {
      this.child = this.firstElementChild;
    }
    this._childModel = {};
  },
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
    var container = this.$.container;

    while (container.firstElementChild) {
      container.removeChild(container.firstElementChild);
    }
    this.$.container.appendChild(element);

    this.update();
  },
  get child() {
    return this.$.container.firstElementChild;
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

    if (!this.turbo) this.child.addEventListener("save", this.save.bind(this));

    this.listen();

    if (model.get(this.at)) {
      this.trigger("model:load");
    } else {
      model.subscribe(function() {
        self.trigger("model:load");
      });
    }
  },
  get model() {
    return this._model;
  },
  del: function(path) {
    if (this.at) path = this.at + "." + path;
    this._model.del(path);
  },
  set: function(key, value) {
    this._model.set(this.at ? this.at + "." + key : key, value);
  },
  listen: function() {
    var self = this;
    this._model.on("all", "**", function(path, ev, data, oldData) {
      var args = [ev, path, data, oldData];

      if (self.at && self.at !== "") {
        if (path.indexOf(self.at) === -1) return;
        if (path === self.at) {
          args.splice(1, 1);
        } else {
          args[1] = args[1].replace(self.at + ".", "");
        }
      }
      self.trigger.apply(self, args);
    });
  },
  update: function(data) {
    var data,
    self = this,
    key;
    if (!this.child || !this.child.model || !this._model) return;
    data = data || this._model.get();

    for (key in data) {
      if (!this._childModel[key]) {
        observeChildModelProperty(self, key);
      }
      this._childModel[key] = data[key];
    }
  },
  save: function() {
    var key;
    for (key in this._childModel) {
      this.set(key, this._childModel[key]);
    }
  },
  onModelLoad: function() {
    this.update();
  },
  onChange: function(name, value) {
    if (!this.child) return;
    this._childModel[name] = value;
  }
};
