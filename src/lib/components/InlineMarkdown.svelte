<script lang="ts">
	import { renderInlineMarkdown } from '$lib/markdown';

	/**
	 * Bọc chữ có markdown inline. Render ra `<span>` để nhúng được vào bất cứ đâu —
	 * tiêu đề, nút, item danh sách — mà không thêm phần tử block.
	 */
	let { source, class: extra = '' }: { source: string; class?: string } = $props();

	const html = $derived(renderInlineMarkdown(source));
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -- đã đi qua DOMPurify -->
<span class="prose-inline {extra}">{@html html}</span>
