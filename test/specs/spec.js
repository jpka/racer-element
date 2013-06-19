describe("racer-element", function() {
  var element,
  child,
  modelData,
  Model,
  doc;

  before(function() { 
    doc = fixtures.window().document;
  });

  beforeEach(function(done) {
    var fn = function() {
      this.removeEventListener("model:load", fn);
      done();
    };
    Model = fixtures.window().Model;
    modelData = {
      text: "text"
    };
    element = fixtures.window().document.createElement("racer-element");
    fixtures.window().document.body.appendChild(element);
    element.at = "a.b";
    child = fixtures.window().document.createElement("element-with-model");
    element.child = child;
    element.addEventListener("model:load", fn);
    element.racer = {
      ready: function(cb) {
        cb(new Model(modelData));
      }
    };
  });

  it("should have a shorthand for getting the child", function() {
    expect(doc.querySelector("#element").child).to.exist;
  });

  it("should have a shorthand for setting the child", function() {
    expect(element.child).to.deep.equal(child);
  });

  it("should have set the model and the model's data from the global racer element", function() {
    expect(element.model).to.exist;
    expect(element.child.model.text).to.equal(modelData.text);
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
      expect(element.child.model.a).to.equal(2);
      done();
    });
    element.model = new Model({a: 2});
  });

  it("should signal model load event even if a populated racer model is attached", function(done) {
    var model = new Model(modelData);

    model.subscribe(function() {
      element.on("model:load", function() {
        done();
      });
      element.model = model;
    });
  });

  it("should update the child's model when the racer model changes", function() {
    element.model.emit("a.b.text", "change", "otherText");
    expect(element.child.model.text).to.equal("otherText");
  });

  it("watches the child model for changes and sets the racer model accordingly", function(done) {
    element.child.model.text = "otherText";
    setTimeout(function() {
      expect(element.model.setWasCalledWith).to.deep.equal(["a.b.text", "otherText"]);
      done();
    }, 1900);
  });

  it("can delete a member", function() {
    element.del("c");
    expect(element.model.delWasCalledWith).to.deep.equal(["a.b.c"]);
  });

  it("does not replicate data among several instances", function(done) {
    var element2 = fixtures.window().document.createElement("racer-element");
    fixtures.window().document.body.appendChild(element2);
    element2.child = fixtures.window().document.createElement("element-with-model");
    element2.on("model:load", function() {
      expect(element.child.model.text).to.equal(modelData.text);
      done();
    });
    element2.model = new Model({text: "text2"});
  });
});
