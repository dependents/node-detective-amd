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
module.exports.getDependencies = function (node) {
  var type = this.getDefineType(node);

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
  var args = node['arguments'];

  // TODO: Should we also make sure the second element is an array?
  return args && args[0].type === 'Literal';
}

function isDependencyForm(node) {
  var args = node['arguments'];

  return args && args[0].type === 'ArrayExpression';
}

function isFactoryForm(node) {
  var args = node['arguments'];

  return args && args[0].type === 'FunctionExpression';
}

function isNoDependencyForm(node) {
  var args = node['arguments'];

  return args && args[0].type === 'ObjectExpression';
}

//////////////////
// Dependency Helpers
//////////////////

function getNamedFormDeps(node) {
  return getElementValues(node['arguments'][1]);
}

function getDependencyFormDeps(node) {
  return getElementValues(node['arguments'][0]);
}

function getFactoryFormDeps(node) {
  // Use logic from node-detective to find require calls
  // TODO: Use walker.traverse with a custom callback looking for require calls within this node
  return [];

}


function getElementValues(nodeArguments) {
  var elements = nodeArguments.elements || [];

  return elements.map(function (el) {
    // TODO: Maybe use escodegen to eval expressions
    return el.value;
  });
}

