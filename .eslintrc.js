module.exports = [{
  rules: {
    // Disable lint rules that need code changes to re-enabled
    'no-var': 'off',
    'no-new': 'off',
    'prefer-const': 'off',

    'sonarjs/cognitive-complexity': 'off',
    camelcase: 'off',
    'no-console': ['warn'],
    'n/no-callback-literal': 'off' // This is not NodeJS code and should not be forced to adhere to NodeJS callback parameter pattern
  }
},
{
  ignores: [
    'dist/**/*',
    'node_modules/**/*',
  ]
}]
