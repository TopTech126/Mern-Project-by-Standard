module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
    'prettier',
    'plugin:security-node/recommended',
    'plugin:import/recommended',
    'plugin:sonarjs/recommended',
    'plugin:unicorn/recommended',
  ],
  parserOptions: {
    ecmaVersion: 13,
  },
  rules: {},
  root: true,
};
