import tseslint from 'typescript-eslint';

export default [
  // Global ignores (applied to all configs)
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/.cursor/**',
      '**/.vscode/**',
      '**/.repo-odoo/**',
      '**/coverage/**',
      '**/drizzle/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/tsconfig*.json',
      '**/*.md',
      '**/*.mdc'
    ]
  },
  // TypeScript/JavaScript lint rules
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    rules: {
      // Minimal canonical rules (can expand later)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off', // Allow any for now
      'no-console': 'off' // Allow console in Node packages
    }
  }
];
