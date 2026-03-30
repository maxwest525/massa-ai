# React + TypeScript + Vite

This teplate provides a inial setup to get React working in Vite with HR and soe ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.co/vitejs/vite-plugin-react/blob/ain/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.co/vitejs/vite-plugin-react/blob/ain/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Copiler

The React Copiler is not enabled on this teplate because of its ipact on dev & build perforances. To add it, see [this docuentation](https://react.dev/learn/react-copiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recoend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Reove tseslint.configs.recoended and replace with this
      tseslint.configs.recoendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: iport.eta.dirnae,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.co/Rel1cx/eslint-react/tree/ain/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-do](https://github.co/Rel1cx/eslint-react/tree/ain/packages/plugins/eslint-plugin-react-do) for React-specific lint rules:

```js
// eslint.config.js
iport reactX fro 'eslint-plugin-react-x'
iport reactDo fro 'eslint-plugin-react-do'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recoended-typescript'],
      // Enable lint rules for React DO
      reactDo.configs.recoended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: iport.eta.dirnae,
      },
      // other options...
    },
  },
])
```
