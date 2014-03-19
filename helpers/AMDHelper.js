// Returns the type of module syntax used if the node
// adheres to one of the following syntaxes, or null if it's an unsupported form
//    define('name', [deps], func)    'named'
//    define([deps], func)            'deps'
//    define(func(require))           'factory'
//    define({})                      'nodeps'
module.exports.getDefineType = function (node) {
  if (isNamedForm(node))        return 'named';
  if (isDependencyForm(node))   return 'deps';
  if (isFactoryForm(node))      return 'factory';
  if (isNoDependencyForm(node)) return 'nodeps';

  return null;
};

// @returns {string[]|[]} A list of file dependencies or an empty list if there are no dependencies
module.exports.getDependenciesFromType = function (node, type) {
  // Note: No need to handle nodeps since there won't
  // be any dependencies
  switch(type) {
    case 'named':
      return getNamedFormDeps(node);
    case 'deps':
      return getDependencyFormDeps(node);
    case 'factory':
      return getFactoryFormDeps(node);
  }

  return [];
};

// Whether or not the node represents an AMD define() call
module.exports.isDefine = function (node) {
  var c = node.callee;

  return c &&
    node.type === 'CallExpression' &&
    c.type    === 'Identifier' &&
    c.name    === 'define';
};

//////////////////
// Form Helpers
//////////////////

function isNamedForm(node) {
  return false;
}

function isDependencyForm(node) {
  return false;
}

function isFactoryForm(node) {
  return false;
}

function isNoDependencyForm(node) {
  return false;
}

//////////////////
// Dependency Helpers
//////////////////

function getNamedFormDeps(node) {
  return [];
}


function getDependencyFormDeps(node) {
  return [];

}

function getFactoryFormDeps(node) {
  // Use logic from node-detective to find require calls
  // TODO: Use walker.traverse with a custom callback looking for require calls within this node
  return [];

}


