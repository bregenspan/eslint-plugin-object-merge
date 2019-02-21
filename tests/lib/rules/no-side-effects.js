'use strict';

const rule = require('../../../lib/rules/no-side-effects');
const RuleTester = require('eslint').RuleTester;

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  }
});

const DEFAULT_ERROR_MESSAGE = `This use of 'merge()' could cause unexpected side effects. Insert an empty object as first argument.`;

const ruleTester = new RuleTester();

ruleTester.run('no-side-effects', rule, {

  valid: [
    `
      import { merge } from 'lodash';
      merge({}, { 'firstName': 'Pooh' }, { 'lastName': 'Bear' });
    `,
    `
      import { merge } from 'lodash/merge';
      merge({}, { 'firstName': 'Pooh' }, { 'lastName': 'Bear' });
    `,
    `
      import { merge } from 'lodash';
      merge({ 'wearsPants': false }, { 'firstName': 'Pooh' }, { 'lastName': 'Bear' });
    `,
    `
      const merge = function someCustomMergeFunction() {};
      merge(target, source);
    `,
    `
      import lodash from 'lodash';
      lodash.merge({}, { 'firstName': 'Pooh' }, { 'lastName': 'Bear' });
    `,
    `
      import _ from 'lodash';
      _.merge({}, { 'firstName': 'Pooh' }, { 'lastName': 'Bear' });
    `
  ],

  invalid: [
    {
      code: `
        import { merge } from 'lodash';
        merge(target, { 'firstName': 'Pooh' }, { 'lastName': 'Bear' });
      `,
      errors: [{
        message: DEFAULT_ERROR_MESSAGE,
        type: 'Identifier'
      }]
    },
    {
      code: `
        import { merge } from 'lodash/merge';
        merge({ bear: identifier }, { bear: { 'firstName': 'Pooh' }});
      `,
      errors: [{
        message: DEFAULT_ERROR_MESSAGE,
        type: 'ObjectExpression'
      }]
    },
    {
      code: `
        import { assign } from 'someOtherLibrary';
        assign({ bear: identifier }, { bear: { 'firstName': 'Pooh' }});
      `,
      options: [{ functionNames: [ 'assign' ], packageNames: ['someOtherLibrary'] }],
      errors: [{
        message: `This use of 'assign()' could cause unexpected side effects. Insert an empty object as first argument.`,
        type: 'ObjectExpression'
      }]
    },
    {
      code: `
        import _ from 'lodash';
        _.merge({ bear: identifier }, { bear: { 'firstName': 'Pooh' }});
      `,
      errors: [{
        message: DEFAULT_ERROR_MESSAGE,
        type: 'ObjectExpression'
      }]
    },
    {
      code: `
        import lodash from 'lodash';
        lodash.merge({ bear: identifier }, { bear: { 'firstName': 'Pooh' }});
      `,
      errors: [{
        message: DEFAULT_ERROR_MESSAGE,
        type: 'ObjectExpression'
      }]
    }
  ]
});
