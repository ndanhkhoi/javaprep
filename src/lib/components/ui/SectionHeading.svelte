<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		hint,
		trailing
	}: { title: string; hint?: string; trailing?: Snippet } = $props();
</script>

<div class="mb-2.5 flex items-baseline justify-between gap-3">
	<h2 class="eyebrow text-ink-muted">{title}</h2>
	{#if trailing}
		{@render trailing()}
	{:else if hint}
		<p class="text-2xs tabular-nums text-ink-muted">{hint}</p>
	{/if}
</div>
