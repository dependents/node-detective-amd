var getDependencies = require('../'),
    fs = require('fs');

['./amd/a.js', './amd/b.js', './amd/c.js'].forEach(run);

function run (filepath) {
  var src = fs.readFileSync(filepath);
  var deps = getDependencies(src);

  switch(filepath) {
    case './amd/a.js':
      console.log(deps.length === 2);
      console.log(deps[0] === './b');
      console.log(deps[1] === './c');
      break;
    case './amd/b.js':
      console.log(deps.length === 0);
      break;
    case './amd/c.js':
      console.log(deps.length === 0);
      break;
  }
}