var watch = require("watchjs").watch;

module.exports = {
  ready: function() {
    var racer = (this.parentNode && this.parentNode.racer) || window.racer;

    if (racer) {
      this.racer = racer;
    };
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
  set racer(racer) {
    var self = this;
    racer.ready(function(model) {
      self.model = model;
    });
  },
  set child(element) {
    var self = this;

    while (this.firstElementChild) {
      this.removeChild(this.firstElementChild);
    }
    this.appendChild(element);

    if (element.model) {
      if (this._model) {
        this.update();
      }
      Object.keys(element.model).forEach(function(key) {
        watch(element.model, key, function(name, action, newValue) {
          if (!self._model) return;
          self._model.set(key, newValue);
        });
      });
    }
  },
  get child() {
    return this.firstElementChild;
  },
  set model(model) {
    var self = this;
    if (this.at) {
      model = model.at(this.at);
    }
    this._model = model;

    model.on("all", "**", function(path, ev, data, oldData) {
      self.trigger(ev, path, data, oldData);
    });
    model.subscribe(function() {
      self.trigger("subscribe");
    });
  },
  get model() {
    return this._model;
  },
  update: function(data) {
    this.child.model = data || this._model.get();
  },
  onSubscribe: function() {
    if (this.child && this.child.model) {
      this.update();
    }
  },
  onChange: function(name, value) {
    if (!this.child || !this.child.model) return;
    this.child.model[name] = value;
  }
};
