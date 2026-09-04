<script lang="ts">
	import { renderMarkdown } from '$lib/markdown';

	let { source }: { source: string } = $props();

	const html = $derived(renderMarkdown(source));
</script>

<div class="prose-body text-[15px] leading-relaxed">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- đã đi qua DOMPurify -->
	{@html html}
</div>

<style>
	/* Tự viết thay vì thêm plugin typography — chỉ cần vài quy tắc cho nội dung tự soạn. */
	.prose-body :global(p) {
		margin-block: 0.75rem;
	}
	.prose-body :global(h2),
	.prose-body :global(h3),
	.prose-body :global(h4) {
		margin-block: 1.25rem 0.5rem;
		font-weight: 600;
		line-height: 1.3;
	}
	.prose-body :global(h2) {
		font-size: 1.05rem;
	}
	.prose-body :global(h3),
	.prose-body :global(h4) {
		font-size: 0.98rem;
	}
	.prose-body :global(ul),
	.prose-body :global(ol) {
		margin-block: 0.75rem;
		padding-inline-start: 1.35rem;
	}
	.prose-body :global(ul) {
		list-style: disc;
	}
	.prose-body :global(ol) {
		list-style: decimal;
	}
	.prose-body :global(li) {
		margin-block: 0.35rem;
	}
	.prose-body :global(code) {
		background: var(--color-surface-3);
		border-radius: 0.3rem;
		padding: 0.1rem 0.32rem;
		font-family: var(--font-mono);
		font-size: 0.87em;
		overflow-wrap: anywhere;
	}
	.prose-body :global(pre) {
		background: var(--color-surface-3);
		border-radius: 0.6rem;
		padding: 0.75rem;
		overflow-x: auto;
		margin-block: 0.75rem;
	}
	.prose-body :global(pre code) {
		background: none;
		padding: 0;
	}
	.prose-body :global(blockquote) {
		border-inline-start: 3px solid var(--color-border);
		padding-inline-start: 0.75rem;
		color: var(--color-ink-muted);
		margin-block: 0.75rem;
	}
	/* Bảng là chỗ duy nhất ngoài code block được phép cuộn ngang. */
	.prose-body :global(table) {
		display: block;
		width: 100%;
		overflow-x: auto;
		border-collapse: collapse;
		margin-block: 0.75rem;
		font-size: 0.9em;
	}
	.prose-body :global(th),
	.prose-body :global(td) {
		border: 1px solid var(--color-border);
		padding: 0.35rem 0.55rem;
		text-align: start;
		white-space: nowrap;
	}
	.prose-body :global(th) {
		background: var(--color-surface-2);
		font-weight: 600;
	}
	.prose-body :global(a) {
		color: var(--color-brand);
		text-decoration: underline;
	}
	.prose-body :global(hr) {
		border: 0;
		border-top: 1px solid var(--color-border);
		margin-block: 1rem;
	}
</style>
