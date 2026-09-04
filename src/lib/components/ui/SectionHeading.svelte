<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		hint,
		trailing
	}: { title: string; hint?: string; trailing?: Snippet } = $props();
</script>

<div class="mb-2.5 flex items-baseline justify-between gap-3">
	<h2 class="text-2xs font-bold uppercase tracking-[0.13em] text-ink-muted">{title}</h2>
	{#if trailing}
		{@render trailing()}
	{:else if hint}
		<p class="text-2xs text-ink-subtle tabular-nums">{hint}</p>
	{/if}
</div>
