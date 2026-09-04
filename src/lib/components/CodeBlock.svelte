<script lang="ts">
	let { code, language = 'java' }: { code: string; language?: string } = $props();

	let highlighted = $state<string | null>(null);
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout>;

	// highlight.js chỉ được tải khi thực sự có code block trên màn hình, và chỉ 3 ngôn ngữ
	// cần dùng — bản đầy đủ nặng ~300KB, bản này khoảng 15KB gzip.
	$effect(() => {
		let cancelled = false;
		const source = code;

		(async () => {
			try {
				const [{ default: hljs }, java, xml, properties] = await Promise.all([
					import('highlight.js/lib/core'),
					import('highlight.js/lib/languages/java'),
					import('highlight.js/lib/languages/xml'),
					import('highlight.js/lib/languages/properties')
				]);
				hljs.registerLanguage('java', java.default);
				hljs.registerLanguage('xml', xml.default);
				hljs.registerLanguage('properties', properties.default);

				const result = hljs.highlight(source, {
					language: hljs.getLanguage(language) ? language : 'java',
					ignoreIllegals: true
				});
				if (!cancelled) highlighted = result.value;
			} catch {
				// Không tải được thì hiện code thô — vẫn đọc được, chỉ mất màu.
			}
		})();

		return () => {
			cancelled = true;
		};
	});

	async function copy(): Promise<void> {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 1800);
		} catch {
			/* clipboard bị chặn (không phải HTTPS, hoặc user từ chối) */
		}
	}
</script>

<div class="relative">
	<button
		type="button"
		class="absolute right-2 top-2 min-h-8 rounded-md border border-border bg-surface-2 px-2
		       text-[11px] font-medium text-ink-muted hover:text-ink"
		onclick={copy}
	>
		{copied ? 'Đã chép' : 'Chép'}
	</button>
	<pre
		class="hljs overflow-x-auto rounded-xl bg-surface-3 p-3 pt-10 text-[13px] leading-relaxed"><code
			class="font-mono">{#if highlighted}<!--
				-->{@html highlighted}<!--
			-->{:else}{code}{/if}</code></pre>
</div>

<style>
	/* Bảng màu tối giản, đủ tương phản ở cả hai theme mà không cần tải stylesheet của hljs. */
	:global(.hljs-keyword),
	:global(.hljs-built_in),
	:global(.hljs-literal) {
		color: oklch(55% 0.18 300);
	}
	:global(.dark .hljs-keyword),
	:global(.dark .hljs-built_in),
	:global(.dark .hljs-literal) {
		color: oklch(80% 0.15 300);
	}
	:global(.hljs-string),
	:global(.hljs-attr) {
		color: oklch(48% 0.14 150);
	}
	:global(.dark .hljs-string),
	:global(.dark .hljs-attr) {
		color: oklch(78% 0.14 150);
	}
	:global(.hljs-comment) {
		color: var(--color-ink-muted);
		font-style: italic;
	}
	:global(.hljs-number),
	:global(.hljs-meta) {
		color: oklch(52% 0.16 40);
	}
	:global(.dark .hljs-number),
	:global(.dark .hljs-meta) {
		color: oklch(80% 0.13 55);
	}
	:global(.hljs-title),
	:global(.hljs-type) {
		color: oklch(50% 0.15 250);
	}
	:global(.dark .hljs-title),
	:global(.dark .hljs-type) {
		color: oklch(80% 0.12 250);
	}
</style>
