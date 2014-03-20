Returns a list of dependencies for a given JavaScript file using
any of the AMD module syntaxes.

*Inspired by substack/node-detective but built for AMD*

### Usage

Let's say we have the following file definitions:

```javascript

// a.js
define(['./b', './c'], function (b, c) {
  console.log(b, c);
});

// b.js
define({
  name: 'foo'
});

// c.js
define(function () {
  return 'bar';
});
```

Here's how you can grab the list of dependencies of a.js

```javascript
var getDependencies = require('node-detective-amd');

getDependencies('a.js', function (deps) {
  console.log(deps); // prints ['./b', './c']
});
```

### Notes

**Supports the 4 forms of AMD syntax:**

* "named": `define('name', [deps], func)`
* "dependency list": `define([deps], func)`
* "factory": `define(func(require))`
* "no dependencies": `define({})`

**Expression-based requires**

If there's a require call that doesn't have a string literal but an expression,
a string (escodegen-generated) representation will be returned.

For example, if a.js was of the "factory" form and contained a dynamic module name:

```javascript
// a.js

define(function (require) {
  // Assume str is some variable that gets set to a string dynamically
  // var str = ...

  var b = require('./' + str),
      c = require('./c');

  console.log(b, c);
});
```

The dependency list will be: `[ '\'./\' + str', './c' ]`

* Even though that string representation isn't incredibly useful, it's
still added to the list to represent/count that dependency