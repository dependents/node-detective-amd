var getDependencies = require('../');

['./amd/a.js', './amd/b.js', './amd/c.js'].forEach(run);

function run (filepath) {

  getDependencies(filepath, function (deps) {
    console.log(filepath);
    console.log(deps);
  });

}