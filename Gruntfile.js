var cp = require("child_process");

module.exports = function(grunt) {
  grunt.initConfig({
    replace: {
      build: {
        options: {
          variables: {
            "script": "<%= grunt.script %>"
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
    cp.spawn("node_modules/.bin/karma", ["start"], {stdio: "inherit"});
  });

  grunt.registerTask("uglifyjs", function() {
    var done = this.async();
    cp.exec("node_modules/.bin/uglifyjs script.js -c -m", function(err, stdout) {
      grunt.script = stdout;
      done();
    });
  });

  grunt.registerTask("build", ["uglifyjs", "replace"]);
  grunt.registerTask("test", ["build", "karma", "watch:build"]);
}
