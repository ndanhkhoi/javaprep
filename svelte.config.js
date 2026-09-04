import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ strict: true }),
		// GitHub Pages serves the app from /<repo>. BASE_PATH is set by CI.
		paths: { base: process.env.BASE_PATH ?? '' },
		serviceWorker: { register: false }
	}
};

export default config;
