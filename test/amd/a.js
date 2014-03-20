define(function (require) {
  var b = require('./b'),
      c = require('./c');

  console.log(b, c);
});

// define(['./b', './c'], function (b, c) {
//   console.log(b, c);
// });