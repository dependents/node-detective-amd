'use strict';

const Walker = require('node-source-walk');
const types = require('ast-module-types');
const escodegen = require('escodegen');
const getModuleType = require('get-amd-module-type');

/**
 * @param  {string|Object} src - the string content or pre-parsed AST of an AMD module
 * @param  {boolean} [options.skipLazyLoaded] - whether or not to omit inner (non-REM) required dependencies
 * @returns {string[]} list of dependencies referenced in the given file
 */
module.exports = function(src, options = {}) {
  if (src === undefined) throw new Error('src not given');
  if (src === '') return [];

  const walker = new Walker();
  const dependencies = [];

  walker.walk(src, node => {
    const isTopLevel = types.isTopLevelRequire(node);
    const isRequire = types.isRequire(node);

    if (!isTopLevel && !types.isDefineAMD(node) && !isRequire) {
      return;
    }

    const type = getModuleType.fromAST(node);

    if (!isTopLevel && isRequire && type !== 'rem' && options.skipLazyLoaded) {
      return;
    }

    dependencies.push(...getDependencies(node, type, options));
  });

  // Avoid duplicates
  return [...new Set(dependencies)];
};

/**
 * @param   {Object} node - AST node
 * @param   {string} type - sniffed AMD module type
 * @param   {Object} options - detective configuration
 * @returns {string[]} list of dependencies, or an empty array if the type is unsupported
 */
function getDependencies(node, type, options) {
  // Note: No need to handle nodeps since there won't be any dependencies
  switch (type) {
    case 'named': {
      const args = node.arguments || [];
      return [
        ...getElementValues(args[1]),
        ...(options.skipLazyLoaded ? [] : getLazyLoadedDeps(node))
      ];
    }

    case 'deps':
    case 'driver': {
      const args = node.arguments || [];
      return [
        ...getElementValues(args[0]),
        ...(options.skipLazyLoaded ? [] : getLazyLoadedDeps(node))
      ];
    }

    case 'factory':
    case 'rem': {
      // REM inner requires aren't really "lazy loaded", but the form is the same
      return getLazyLoadedDeps(node);
    }

    default:
      // nothing
  }

  return [];
}

/**
 * Collects require() calls within an already-matched AMD node (factory, REM,
 * or dynamic require). Handles both require('x') and require(['x']) forms.
 *
 * @param  {Object} node - AST node to traverse
 * @returns {string[]} list of statically-determinable required dependencies
 */
function getLazyLoadedDeps(node) {
  // Use logic from node-detective to find require calls
  const walker = new Walker();
  const dependencies = [];

  walker.traverse(node, innerNode => {
    if (types.isRequire(innerNode)) {
      const requireArgs = innerNode.arguments;

      if (requireArgs.length === 0) return;

      // Either require('x') or require(['x'])
      const deps = requireArgs[0];

      if (deps.type === 'ArrayExpression') {
        dependencies.push(...getElementValues(deps));
      } else {
        const value = getEvaluatedValue(deps);
        if (value) dependencies.push(value);
      }
    }
  });

  return dependencies;
}

/**
 * @param {Object} nodeArguments - an ArrayExpression node
 * @returns {string[]} the statically-determinable string values of the array elements
 */
function getElementValues(nodeArguments) {
  const elements = nodeArguments.elements || [];

  return elements.map(element => getEvaluatedValue(element)).filter(Boolean);
}

/**
 * @param {Object} node - AST node
 * @returns {string} the string value of the node, or '' if it cannot be statically determined
 */
function getEvaluatedValue(node) {
  if (node.type === 'Literal' || node.type === 'StringLiteral') return node.value;
  if (node.type === 'CallExpression') return '';

  return escodegen.generate(node);
}
