var getDependencies = require('../'),
    fs = require('fs');

['./amd/a.js', './amd/b.js', './amd/c.js'].forEach(run);

function run (filepath) {
  var src = fs.readFileSync(filepath);

  getDependencies(src, function (deps) {
    console.log(filepath);
    console.log(deps);
  });

}