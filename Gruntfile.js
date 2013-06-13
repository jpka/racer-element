module.exports = function(grunt) {
  grunt.initConfig({
    replace: {
      build: {
        options: {
          variables: {
            "script": "<%= grunt.file.read('browserified.js') %>"
          }
        },
        files: [
          {src: ["component.html"], dest: "./index.html"}
        ]
      }
    },
    watch: {
      build: {
        files: ["proto.js", "component.html"],
        tasks: ["build"]
      }
    }
  });
  grunt.loadNpmTasks("grunt-replace");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("karma", function() {
    require("child_process").spawn("node_modules/.bin/karma", ["start"], {stdio: "inherit"});
  });

  grunt.registerTask("browserify", function() {
    var done = this.async(),
    b = require("browserify")();
    b.require("./proto.js", {expose: "proto"});
    var opts = {};

    b.bundle(opts, function(err, js) {
      if (err) throw err;
      require("fs").writeFileSync("browserified.js", js);
      done();
    });
  });

  grunt.registerTask("build", ["browserify", "replace:build"]);
  grunt.registerTask("test", ["build", "karma", "watch:build"]);
}
