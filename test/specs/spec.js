describe("racer-element", function() {
  var element,
  child,
  modelData,
  Model = function(modelData) {
    return {
      events: {},
      get: function() {
        return modelData;
      },
      on: function(name, path, cb) {
        this.events[name] = cb;
      },
      subscribe: function(cb) {
        setTimeout(cb, 500);
      },
      emit: function() {
        this.events["all"].apply(this, arguments);
      },
      at: function() {
        this.atWasCalled = true;
        return this;
      },
      set: function() {
        this.setWasCalledWith = arguments;
      }
    };
  },
  doc;

  before(function() { 
    var win = fixtures.window();
    doc = win.document;
  });

  beforeEach(function(done) {
    modelData = {
      text: "text"
    };
    element = doc.createElement("racer-element");
    child = doc.createElement("element-with-model");
    element.child = child;
    element.racer = {
      ready: function(cb) {
        cb(new Model(modelData));
      }
    };
    var fn = function() {
      this.removeEventListener("subscribe", fn);
      done();
    };
    element.addEventListener("subscribe", fn);
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

  it("should set the data from a setted model to the child's model", function(done) {
    element = doc.createElement("racer-element");
    element.child = doc.createElement("element-with-model");
    element.addEventListener("subscribe", function() {
      expect(element.child.model).to.deep.equal({a:2});
      done();
    });
    element.model = new Model({a: 2});
  });

  it("should subscribe to and update the child's model when a racer model is attached", function(done) {
    var model = new Model(modelData);
    element.addEventListener("subscribe", function() {
      expect(child.model).to.deep.equal(modelData);
      done();
    });
    element.model = model;
  });

  it("should update the child's model when the racer model changes", function(done) {
    var model = new Model(modelData);
    element.addEventListener("subscribe", function() {
      model.emit("text", "change", "otherText");
      expect(child.model.text).to.equal("otherText");
      done();
    });
    element.model = model;
  });

  it("should call at on itself if at argument is given", function() {
    var model = new Model(modelData);
    element.at = "at";
    element.model = model
    expect(model.atWasCalled).to.be.true;
  });

  it("watches the child model for changes and sets the racer model accordingly", function() {
    element.child.model.text = "otherText";
    expect(element.model.setWasCalledWith).to.deep.equal(["text", "otherText"]);
  });
});
