<script lang="ts">
	import Icon from './Icon.svelte';
	import type { IconName } from './icons';

	let {
		label,
		value,
		hint,
		icon,
		tone = 'default'
	}: {
		label: string;
		value: string | number;
		hint?: string;
		icon?: IconName;
		tone?: 'default' | 'brand' | 'ok' | 'warn' | 'bad';
	} = $props();

	const TONES = {
		default: { text: 'text-ink', chip: 'bg-surface-3 text-ink-muted' },
		brand: { text: 'text-brand', chip: 'bg-brand-soft text-brand' },
		ok: { text: 'text-ok', chip: 'bg-ok-soft text-ok' },
		warn: { text: 'text-warn', chip: 'bg-warn-soft text-warn' },
		bad: { text: 'text-bad', chip: 'bg-bad-soft text-bad' }
	} as const;
</script>

<div class="surface-card flex flex-col gap-2 rounded-xl p-3.5">
	<div class="flex items-center justify-between gap-2">
		<p
			class="text-[0.625rem] font-semibold uppercase tracking-[0.05em] text-ink-muted
			       sm:text-2xs sm:tracking-[0.09em]"
		>
			{label}
		</p>
		{#if icon}
			<span
				class="hidden size-6 shrink-0 place-items-center rounded-md sm:grid {TONES[tone].chip}"
			>
				<Icon name={icon} size={14} strokeWidth={2} />
			</span>
		{/if}
	</div>
	<p class="text-2xl font-extrabold leading-none tabular-nums sm:text-[1.6rem] {TONES[tone].text}">
		{value}
	</p>
	{#if hint}
		<p class="text-2xs text-ink-subtle">{hint}</p>
	{/if}
</div>
