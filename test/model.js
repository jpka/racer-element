window.Model = function(modelData) {
  return {
    events: {},
    get: function() {
      return this.data;
    },
    on: function(name, path, cb) {
      this.events[name] = cb;
    },
    subscribe: function(cb) {
      var self = this;
      setTimeout(function() {
        self.data = modelData;
        cb();
      }, 500);
    },
    emit: function() {
      this.events["all"].apply(this, arguments);
    },
    set: function() {
      this.setWasCalledWith = arguments;
    },
    del: function() {
      this.delWasCalledWith = arguments;
    }
  };
};
