define([
  './a'
], function(a) {
  'use strict';

  // Dynamic require with compute code
  require([a.dependency('inner')], function(b) {

  });
});
