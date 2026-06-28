import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'design-ref']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Design-systeem (letterlijke port van de Claude Design-blauwdruk).
    // Deze modules co-exporteren bewust componenten + helpers/consts uit één
    // bron, dus de react-refresh fast-refresh-regel (puur een HMR-DX-regel)
    // is hier niet van toepassing.
    files: ['src/design/**/*.{js,jsx}'],
    rules: {
      // react-refresh: design-modules co-exporteren bewust componenten + helpers.
      'react-refresh/only-export-components': 'off',
      // Letterlijke port van prototype-code: lege localStorage-guards
      // (try{...}catch(e){}) en de bewust-veilige hoisting in ConfirmHost
      // zijn geen bugs (build draait), dus de stilistische/opinie-regels staan
      // hier uit. Bodies blijven 1:1 met de blauwdruk.
      'no-empty': 'off',
      // De UI-kit kent props die niet elk component gebruikt; lege catch-params
      // idem. Echte ongebruikte lokale variabelen/imports blijven wel fouten.
      'no-unused-vars': ['error', { args: 'none', caughtErrors: 'none' }],
      'react-hooks/immutability': 'off',
      // WidgetsProvider herlaadt z'n layout uit localStorage wanneer moduleId
      // wisselt (setPw in een effect). Dat is het bewuste blauwdruk-gedrag uit
      // 31-widgets, geen bug; deze performance-opinie-regel staat hier dus uit.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
])
