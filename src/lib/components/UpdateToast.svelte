<script lang="ts">
	import Icon from './ui/Icon.svelte';
	import Button from './ui/Button.svelte';

	let { onReload }: { onReload: () => void } = $props();
</script>

<div
	class="animate-pop surface-panel fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-md items-center
	       gap-3 rounded-xl p-3 lg:bottom-6"
	role="status"
	aria-live="polite"
>
	<span class="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
		<Icon name="refresh" size={18} strokeWidth={2} />
	</span>
	<p class="flex-1 text-sm font-medium leading-snug">Đã có phiên bản mới của JavaPrep.</p>
	<Button size="sm" onclick={onReload}>Tải lại</Button>
</div>
