describe("racer-element", function() {
  var element,
  child,
  modelData,
  Model = function(modelData) {
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
      }
    };
  },
  doc;

  before(function() { 
    doc = fixtures.window().document;
  });

  beforeEach(function(done) {
    modelData = {
      text: "text"
    };
    element = doc.createElement("racer-element");
    element.at = "a.b";
    child = doc.createElement("element-with-model");
    element.child = child;
    element.racer = {
      ready: function(cb) {
        cb(new Model(modelData));
      }
    };
    var fn = function() {
      this.removeEventListener("model:load", fn);
      done();
    };
    element.addEventListener("model:load", fn);
  });

  it("should have a shorthand for getting the child", function() {
    expect(doc.querySelector("#element").child).to.exist;
  });

  it("should have a shorthand for setting the child", function() {
    expect(element.child).to.deep.equal(child);
  });

  it("should have set the model and the model's data from the global racer element", function() {
    expect(element.model).to.exist;
    expect(element.child.model).to.deep.equal(modelData);
  });

  describe("event listening", function() {
    var data = "data";

    it("should listen to events destined to it and resolve them accordingly if path is defined", function(done) {
      var model = new Model({});
      element.at = "a.b";
      element.model = model;

      element.on("change", function(d) {
        expect(d).to.equal(data);
        done();
      });
      model.emit("a.b", "change", data);
    });

    it("should listen to events destined to childs and provide the path resolved from it's own", function(done) {
      var model = new Model({});
      element.at = "a.b";
      element.model = model;

      element.on("change", function(path, d) {
        expect(path).to.equal(path);
        expect(d).to.equal(data);
        done();
      });
      model.emit("a.b.c", "change", data);
    });
  });

  it("should set the data from a setted model to the child's model", function(done) {
    element = doc.createElement("racer-element");
    element.child = doc.createElement("element-with-model");
    element.addEventListener("model:load", function() {
      expect(element.child.model).to.deep.equal({a:2});
      done();
    });
    element.model = new Model({a: 2});
  });

  it("should subscribe to and update the child's model when a racer model is attached", function(done) {
    var model = new Model(modelData);

    element.addEventListener("model:load", function() {
      expect(child.model).to.deep.equal(modelData);
      done();
    });
    element.model = model;
  });

  it("should signal model load event even if a populated racer model is attached", function(done) {
    var model = new Model(modelData);

    model.subscribe(function() {
      element.on("model:load", function() {
        expect(child.model).to.deep.equal(modelData);
        done();
      });
      element.model = model;
    });
  });

  it("should update the child's model when the racer model changes", function(done) {
    var model = new Model(modelData);
    element.addEventListener("model:load", function() {
      element.at = "a.b";
      model.emit("a.b.text", "change", "otherText");
      expect(child.model.text).to.equal("otherText");
      done();
    });
    element.model = model;
  });

  it("watches the child model for changes and sets the racer model accordingly", function() {
    element.child.model.text = "otherText";
    expect(element.model.setWasCalledWith).to.deep.equal(["a.b.text", "otherText"]);
  });

});
