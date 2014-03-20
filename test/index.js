var getDependencies = require('../');

getDependencies('./amd/b.js', function (deps) {
  if (deps) console.log(deps);
});