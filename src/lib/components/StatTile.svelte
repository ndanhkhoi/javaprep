<script lang="ts">
	let {
		label,
		value,
		hint,
		tone = 'default'
	}: {
		label: string;
		value: string | number;
		hint?: string;
		tone?: 'default' | 'brand' | 'ok' | 'warn';
	} = $props();

	const toneClass = $derived(
		{ default: 'text-ink', brand: 'text-brand', ok: 'text-ok', warn: 'text-warn' }[tone]
	);
</script>

<div class="rounded-xl border border-border bg-surface-2 p-3">
	<p class="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</p>
	<p class="mt-1 text-2xl font-bold tabular-nums {toneClass}">{value}</p>
	{#if hint}
		<p class="mt-0.5 text-[11px] text-ink-muted">{hint}</p>
	{/if}
</div>
