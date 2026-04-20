define(['./a'], function(a) {
  'use strict';

  // Dynamic require with a scalar computed expression (e.g. a function call).
  // The dependency cannot be statically determined, so it should be omitted.
  require(a.getModuleName());
});
