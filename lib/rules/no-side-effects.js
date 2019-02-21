/**
 * Determines whether source of any specified identifier in `importNames` was an ES Import from one
 * of the specified `packageNames`
 *
 * @param {Array<string>} importNames - Names of identifiers corresponding to possible import
 * @param {Array<string>} packageNames - Names of packages which identifier could be imported from
 * @return {boolean}
 */
function isImportedFromPackage (scope, importNames, packageNames) {
  const definitions = scope.references.filter(ref => importNames.includes(ref.identifier.name))
    .map(ref => ref.resolved.defs)
    .reduce((acc, val) => acc.concat(val), []); // flatten
  return definitions.some(def => def.parent && def.parent.source && packageNames.includes(def.parent.source.value));
}

/**
 * Recursively determines whether the specified object properties (or descendant properties of
 * nested objects) reference an identifier as a value.
 *
 * @param {Array<Property>} properties - properties of an ObjectExpression node
 * @return {boolean}
 */
function propertiesContainIdentifier (properties) {
  if (!properties.length) {
    return false;
  }
  if (properties.some(property =>
    // simple key/value property case
    (property.value && property.value.type === 'Identifier') ||

    // ExperimentalSpreadProperty case
    (property.argument && property.argument.type === 'Identifier')
  )) {
    return true;
  }
  return properties
    .filter(property => property.value.type === 'ObjectExpression')
    .some(prop => propertiesContainIdentifier(prop.value.properties));
}

/**
 * Determines whether the specified node is an identifier or an object referencing one as a value
 * @param {Node} node - Node to test
 * @return {boolean}
 */
function containsIdentifier (node) {
  if (node.type === 'Identifier') {
    return true;
  }
  if (node.type === 'ObjectExpression') {
    return propertiesContainIdentifier(node.properties);
  }
  return false;
}

const DEFAULT_OPTIONS = {
  /** Names of function calls to validate for possible side effects */
  functionNames: ['merge'],

  /** Names of packages from which functions must be imported in order to be validated */
  packageNames: ['lodash', 'lodash/merge']
};

module.exports = {
  meta: {
    docs: {
      description: 'Disallow side effects in use of Lodash.merge and similar functions',
      category: 'Possible Errors',
      recommended: true,
      url: ''
    },
    schema: [
      {
        'type': 'object',
        'properties': {
          'functionNames': {
            'type': 'array',
            'minItems': 1,
            'items': {
              'type': 'string'
            }
          },
          'packageNames': {
            'type': 'array',
            'minItems': 1,
            'items': {
              'type': 'string'
            }
          }
        },
        'additionalProperties': false
      }
    ]
  },
  create (context) {
    const options = Object.assign({}, DEFAULT_OPTIONS, context.options[0] || {});

    return {
      CallExpression (node) {
        const functionNames = options.functionNames.concat();
        let functionName = node.callee.name;

        if (node.callee.object && node.callee.property && functionNames.includes(node.callee.property.name)) {
          // This looks like a default import
          functionNames.push(node.callee.object.name);
          functionName = node.callee.property.name;
        } else if (!functionNames.includes(node.callee.name) || !node.arguments.length) {
          return;
        }

        const scope = context.getScope();

        if (isImportedFromPackage(scope, functionNames, options.packageNames) && containsIdentifier(node.arguments[0])) {
          context.report(node.arguments[0],
            `This use of '${functionName}()' could cause unexpected side effects. Insert an empty object as first argument.`
          );
        }
      }

    };
  }
};
