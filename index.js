var Walker = require('node-source-walk'),
    amdh = require('./helpers/AMDHelper');

// Assumes src is the source code for a javascript file
// using any form of the AMD module syntax
module.exports = function (src) {
  if (! src) throw new Error('src not given');

  return getDependencies(src);
};

function getDependencies(src) {
  var dependencies = [],
      walker = new Walker();

  walker.walk(src, function (node) {
    var deps;

    if (! amdh.isDefine(node)) return;

    deps = amdh.getDependencies(node);

    // Get the literal (or evaluated expression) dependencies
    // Push to a list of dependencies
    if (deps.length) dependencies = dependencies.concat(deps);
  });

  return dependencies;
}

