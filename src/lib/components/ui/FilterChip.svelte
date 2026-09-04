<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		active,
		onToggle,
		children
	}: { active: boolean; onToggle: () => void; children: Snippet } = $props();
</script>

<button
	type="button"
	class="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-xs
	       font-semibold transition-[background-color,border-color,color,box-shadow]
	       duration-[var(--dur-fast)] active:scale-[0.97]
	       {active
		? 'border-brand bg-brand text-brand-ink shadow-glow'
		: 'border-border bg-surface-2 text-ink-muted hover:border-border-strong hover:text-ink'}"
	aria-pressed={active}
	onclick={onToggle}
>
	{@render children()}
</button>
