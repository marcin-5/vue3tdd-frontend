import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'

export default [
  {files: ['**/*.{js,mjs,cjs,vue}']},
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        it: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
      },
    },
    rules: {
      indent: ['error', 2],
    },
  },
  pluginJs.configs.recommended,
  ...pluginVue.configs['flat/essential'],
]
