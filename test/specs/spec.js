describe("racer-element", function() {
  var element,
  child,
  modelData,
  model = {
    events: {},
    get: function() {
      return modelData;
    },
    on: function(name, path, cb) {
      this.events[name] = cb;
    },
    trigger: function(name) {
      this.events[name]();
    }
  };

  beforeEach(function() {
    element = fixtures.window().document.createElement("jpka-racer-element");
    child = fixtures.window().document.createElement("element-with-model");
    modelData = {
      text: "text"
    };
  });

  it("should be able to set the element", function() {
    element.child = child;
    expect(element.webkitShadowRoot.querySelector("#child")).to.exist.and.to.deep.equal(child);
  });

  it("should update the child's model when a racer model is attached", function() {
    element.child = child;
    element.model = model;
    expect(child.model).to.deep.equal(modelData);
  });

  it("should update the child's model when the racer model changes", function() {
    element.child = child;
    element.model = model;
    modelData.text = "otherText";
    model.trigger("change");
    expect(child.model).to.deep.equal(modelData);
  });
});
