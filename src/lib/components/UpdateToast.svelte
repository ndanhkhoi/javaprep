<script lang="ts">
	let { onReload }: { onReload: () => void } = $props();
</script>

<div
	class="fixed inset-x-3 bottom-20 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl
	       border border-border bg-surface-2 p-3 shadow-lg"
	role="status"
	aria-live="polite"
>
	<p class="flex-1 text-sm">Đã có phiên bản mới của JavaPrep.</p>
	<button
		type="button"
		class="min-h-11 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-ink"
		onclick={onReload}
	>
		Tải lại
	</button>
</div>
