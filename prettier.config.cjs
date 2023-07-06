/** @type {import("prettier").Config} */
const config = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'none',
  semi: true,
  quoteProps: 'as-needed',
  arrowParens: 'avoid',
  overrides: [
    {
      files: '*.ts',
      options: { parser: 'typescript' }
    }
  ]
};

module.exports = config;
