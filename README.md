# eslint-plugin-object-merge

Rules to enforce side effect-free use of Lodash.merge() and similar object merge methods

## Limitations

Currently only validates the case where `merge()` is imported via an ES6 import like so:

 * `import { merge } from 'lodash';`
 * `import { merge } from 'lodash/merge';`
 * `import lodash from 'lodash'; /*...*/ lodash.merge(); // Default import`

Unsupported cases:

 * `const merge = require('lodash/merge'); // CommonJS`

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-object-merge`:

```
$ npm install eslint-plugin-object-merge --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-object-merge` globally.

## Usage

Add `object-merge` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "object-merge"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "object-merge/rule-name": 2
    }
}
```

## Supported Rules

### `no-side-effects`
**Detect possibly unsafe use of Lodash.merge (or similar functions) that mutate their first object argument**

Lodash's merge() function, like the native Object.assign(), mutates that first argument passed to it. This is often undesired
behavior as it can cause unexpected mutations to objects that are used outside the immediate scope. This rule can be used to
catch potentially unsafe cases where the first argument will be mutated.

(See tests for full list of valid/invalid cases.)

```json
{
    "rules": {
        "object-merge/no-side-effects": [2, {
          // Names of function calls to validate for possible side effects (optional, default shown below)
          "functionNames": ["merge"],

          // Names of packages from which functions must be imported in order to be validated (optional, default shown below)
          "packageNames": ["lodash", "lodash/merge"]
        }]
    }
}
```
