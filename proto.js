var watch = require("watchjs").watch;

module.exports = {
  ready: function() {
    if (this.firstElementChild) {
      this.child = this.firstElementChild;
    }
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
    this.dispatchEvent(new Event(name, {detail: data}));
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
    if (this.at) {
      model = model.at(this.at);
    }
    this._model = model;

    this.listen();

    model.subscribe(function() {
      self.trigger("subscribe");
    });
  },
  get model() {
    return this._model;
  },
  listen: function() {
    var self = this;
    this._model.on("all", "**", function(path, ev, data, oldData) {
      self.trigger(ev, path, data, oldData);
    });
  },
  watchChildModel: function() {
    var self = this;

    Object.keys(self.child.model).forEach(function(key) {
      watch(self.child.model, key, function(name, action, newValue) {
        if (!self._model) return;
        self._model.set(key, newValue);
      });
    });
  },
  update: function(data) {
    if (!this.child || !this.child.model || (!data && !this._model)) return;
    this.child.model = data || this._model.get();
    this.watchChildModel();
  },
  onSubscribe: function() {
    this.update();
  },
  onChange: function(name, value) {
    if (!this.child || !this.child.model) return;
    this.child.model[name] = value;
  }
};
