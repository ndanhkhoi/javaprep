<script lang="ts">
	import Icon from './ui/Icon.svelte';

	let { code, language = 'java' }: { code: string; language?: string } = $props();

	let highlighted = $state<string | null>(null);
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout>;

	const lineCount = $derived(code.split('\n').length);

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

<!-- Thanh tiêu đề riêng thay vì nút nổi đè lên code: nút không còn che dòng đầu, và
     khối code đọc ra như một cửa sổ editor. -->
<figure class="surface-card overflow-hidden rounded-xl">
	<figcaption
		class="flex items-center gap-2 border-b border-border bg-surface-2 px-3 py-2"
	>
		<span class="flex gap-1.5" aria-hidden="true">
			<span class="size-2.5 rounded-full bg-bad-solid/60"></span>
			<span class="size-2.5 rounded-full bg-warn-solid/60"></span>
			<span class="size-2.5 rounded-full bg-ok-solid/60"></span>
		</span>
		<span class="ms-1 font-mono text-2xs font-semibold uppercase tracking-wider text-ink-subtle">
			{language}
		</span>
		<span class="ms-auto font-mono text-2xs tabular-nums text-ink-subtle">
			{lineCount} dòng
		</span>
		<button
			type="button"
			class="flex min-h-8 items-center gap-1.5 rounded-md border border-border bg-elevated px-2
			       text-2xs font-semibold transition-colors duration-[var(--dur-fast)]
			       {copied ? 'text-ok' : 'text-ink-muted hover:text-ink'}"
			onclick={copy}
		>
			<Icon name={copied ? 'check' : 'copy'} size={13} strokeWidth={2.2} />
			{copied ? 'Đã chép' : 'Chép'}
		</button>
	</figcaption>

	<pre
		class="hljs overflow-x-auto bg-surface-3/60 p-4 text-[0.8125rem] leading-relaxed"><code
			class="font-mono">{#if highlighted}<!--
				-->{@html highlighted}<!--
			-->{:else}{code}{/if}</code></pre>
</figure>

<style>
	/* Bảng màu tối giản, đủ tương phản ở cả hai theme mà không cần tải stylesheet của hljs. */
	:global(.hljs-keyword),
	:global(.hljs-built_in),
	:global(.hljs-literal) {
		color: oklch(50% 0.19 300);
	}
	:global(.dark .hljs-keyword),
	:global(.dark .hljs-built_in),
	:global(.dark .hljs-literal) {
		color: oklch(80% 0.15 300);
	}
	:global(.hljs-string),
	:global(.hljs-attr) {
		color: oklch(45% 0.15 152);
	}
	:global(.dark .hljs-string),
	:global(.dark .hljs-attr) {
		color: oklch(80% 0.14 152);
	}
	:global(.hljs-comment) {
		color: var(--color-ink-subtle);
		font-style: italic;
	}
	:global(.hljs-number),
	:global(.hljs-meta) {
		color: oklch(48% 0.17 40);
	}
	:global(.dark .hljs-number),
	:global(.dark .hljs-meta) {
		color: oklch(82% 0.13 55);
	}
	:global(.hljs-title),
	:global(.hljs-type) {
		color: oklch(48% 0.16 250);
	}
	:global(.dark .hljs-title),
	:global(.dark .hljs-type) {
		color: oklch(82% 0.12 250);
	}
</style>
