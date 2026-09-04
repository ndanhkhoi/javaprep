<script lang="ts">
	import Icon from './ui/Icon.svelte';
	import Button from './ui/Button.svelte';

	let { onReload, onDismiss }: { onReload: () => void; onDismiss: () => void } = $props();
</script>

<!-- Nổi trên dock ở mobile, ở góc dưới trái từ `lg`. Đóng được: bản mới sẽ tự áp dụng
     ở lần mở app sau, nên đây là lời mời chứ không phải việc bắt buộc làm ngay. -->
<div
	class="animate-pop surface-panel fixed inset-x-3 bottom-24 z-50 mx-auto flex max-w-md items-center
	       gap-3 rounded-xl p-3 lg:bottom-6 lg:left-6 lg:right-auto lg:mx-0"
	role="status"
	aria-live="polite"
>
	<span class="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
		<Icon name="refresh" size={18} strokeWidth={2} />
	</span>
	<p class="min-w-0 flex-1 text-sm font-medium leading-snug">Đã có bản cập nhật.</p>
	<Button size="sm" onclick={onReload}>Tải lại</Button>
	<button
		type="button"
		class="grid size-10 shrink-0 place-items-center rounded-lg text-ink-muted transition-colors
		       hover:bg-surface-3 hover:text-ink"
		aria-label="Để sau"
		onclick={onDismiss}
	>
		<Icon name="x" size={15} strokeWidth={2.2} />
	</button>
</div>
