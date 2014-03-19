var Walker = require('node-source-walk'),
    fs   = require('fs'),
    amdh = require('./helpers/AMDHelper');

// Assumes filepath is a javascript file with AMD module syntax
// If you need to determine if it's in AMD syntax
module.exports = function (filepath, cb) {
  if (! filepath) throw new Error('filepath not given');

  fs.readFile(filepath, function (err, data) {
    cb(getDependencies(data.toString()));
  });
};

function getDependencies(src) {
  var dependencies = [],
      walker = new Walker();

  walker.walk(src, function (node) {
    var deps;

    if (! amdh.isDefine(node)) return;

    console.log(node);

    deps = amdh.getDependencies(node);

    console.log('Deps: ', deps);

    // Get the literal (or evaluated expression) dependencies
    // Push to a list of dependencies
    if (deps.length) dependencies = dependencies.concat(deps);
  });

  return dependencies;
}

