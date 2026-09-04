<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		active,
		onToggle,
		children
	}: { active: boolean; onToggle: () => void; children: Snippet } = $props();
</script>

<!-- 44px ở màn hình cảm ứng (ngưỡng vùng chạm tối thiểu), gọn lại còn 40px từ `sm`
     nơi con trỏ chuột không cần nhiều dung sai. -->
<button
	type="button"
	class="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs
	       font-semibold transition-[background-color,border-color,color,box-shadow]
	       duration-[var(--dur-fast)] active:scale-[0.97] sm:min-h-10
	       {active
		? 'border-brand bg-brand text-brand-ink shadow-glow'
		: 'border-border bg-surface-2 text-ink-muted hover:border-border-strong hover:text-ink'}"
	aria-pressed={active}
	onclick={onToggle}
>
	{@render children()}
</button>
