module.exports = function(grunt) {
  grunt.initConfig({
    replace: {
      build: {
        options: {
          variables: {
            "script": "<%= grunt.file.read('script.js') %>"
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

  grunt.registerTask("build", ["replace"]);
  grunt.registerTask("test", ["build", "karma", "watch:build"]);
}
