module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: {
    project: './tsconfig.eslint.json'
  },
  ignorePatterns: [
    'node_modules',
    'dist'
  ]
}
