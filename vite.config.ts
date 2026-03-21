/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), legacy({targets: ['defaults', 'not IE 11']})],
	build: {
		// target: 'es2020',
		minify: false,
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: './src/setupTests.ts',
	},
})
