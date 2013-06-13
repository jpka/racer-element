describe("racer-element", function() {
  var element,
  child,
  modelData,
  Model = function() {
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
    win.racer = {
      ready: function(cb) {
        cb(new Model());
      }
    };
  });

  beforeEach(function() {
    modelData = {
      text: "text"
    };
    element = doc.createElement("racer-element");
    child = doc.createElement("element-with-model");
    child.model = {};
    element.child = child;
    element.path = "some.path";
  });

  it("should have a shorthand for getting the child", function() {
    expect(doc.querySelector("#element").child).to.deep.equal(doc.querySelector("#child"));
  });

  it("should have a shorthand for setting the child", function() {
    expect(element.child).to.deep.equal(child);
  });

  it("should have set the model from the global racer element", function() {
    expect(element.model).to.exist;
  });

  it("should subscribe to and update the child's model when a racer model is attached", function(done) {
    var model = new Model();
    element.addEventListener("subscribe", function() {
      expect(child.model).to.deep.equal(modelData);
      done();
    });
    element.model = model;
  });

  it("should update the child's model when the racer model changes", function(done) {
    var model = new Model();
    element.addEventListener("subscribe", function() {
      model.emit("text", "change", "otherText");
      expect(child.model.text).to.equal("otherText");
      done();
    });
    element.model = model;
  });

  it("should call at on itself if at argument is given", function() {
    var model = new Model();
    element.at = "at";
    element.model = model
    expect(model.atWasCalled).to.be.true;
  });

  it("watches the child model for changes and sets the racer model accordingly", function() {
    element.child.model.text = "otherText";
    expect(element.model.setWasCalledWith).to.deep.equal(["text", "otherText"]);
  });
});
