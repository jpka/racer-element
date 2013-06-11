describe("racer-element", function() {
  var element,
  child,
  modelData = {
    text: "text"
  },
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
        cb();
      },
      trigger: function(name, args) {
        this.events[name].apply(this, args);
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
    element = doc.createElement("racer-element");
    child = doc.createElement("element-with-model");
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
    element.addEventListener("subscribed", function() {
      expect(child.model).to.deep.equal(modelData);
      done();
    });
    element.model = model;
  });

  it("should update the child's model when the racer model changes", function(done) {
    var model = new Model();
    element.addEventListener("subscribed", function() {
      model.trigger("change", ["text", "otherText"]);
      expect(child.model.text).to.equal("otherText");
      done();
    });
    element.model = model;
  });
});
