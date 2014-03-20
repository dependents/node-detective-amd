var Walker = require('node-source-walk'),
    escodegen = require('escodegen');

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

// define('name', [deps], func)
function isNamedForm(node) {
  var args = node['arguments'];

  // TODO: Should we also make sure the second element is an array?
  return args && args[0].type === 'Literal';
}

// define([deps], func)
function isDependencyForm(node) {
  var args = node['arguments'];

  return args && args[0].type === 'ArrayExpression';
}

// define(func(require))
function isFactoryForm(node) {
  var args = node['arguments'],
      firstParamNode = args.length && args[0].params ? args[0].params[0] : null;

  // Node should have a function whose first param is 'require'
  return args && args[0].type === 'FunctionExpression' &&
        firstParamNode && firstParamNode.type === 'Identifier' && firstParamNode.name === 'require';
}

// define({})
function isNoDependencyForm(node) {
  var args = node['arguments'];

  return args && args[0].type === 'ObjectExpression';
}

//////////////////
// Dependency Helpers
//////////////////

function getNamedFormDeps(node) {
  var args = node['arguments'] || [];

  return getElementValues(args[1]);
}

function getDependencyFormDeps(node) {
  var args = node['arguments'] || [];

  return getElementValues(args[0]);
}

function getFactoryFormDeps(node) {
  // Use logic from node-detective to find require calls
  var walker = new Walker(),
      dependencies = [];

  walker.traverse(node, function (innerNode) {
    // Look for require function calls
    if (isRequire(innerNode)) {
      // Store the name of the required entity
      if (innerNode['arguments'].length) {
        dependencies.push(getEvaluatedValue(innerNode['arguments'][0]));
      }
    }
  });

  return dependencies;
}

// Whether or not the node represents a require function call
function isRequire(node) {
  var c = node.callee;

  return c &&
        node.type  === 'CallExpression' &&
        c.type     === 'Identifier' &&
        c.name     === 'require';
}

// Returns the literal values from the passed array
function getElementValues(nodeArguments) {
  var elements = nodeArguments.elements || [];

  return elements.map(function (el) {
    // TODO: Maybe use escodegen to eval expressions
    return getEvaluatedValue(el);
  });
}

// For literal nodes, returns the value
// For expression nodes, returns a string representation of the expression
function getEvaluatedValue(node) {
  if (node.type === 'Literal') return node.value;

  return escodegen.generate(node);
}
