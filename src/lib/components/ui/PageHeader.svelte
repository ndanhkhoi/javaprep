<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	let {
		title,
		eyebrow,
		description,
		backHref,
		backLabel = 'Quay lại',
		actions
	}: {
		title: string;
		eyebrow?: string;
		description?: string;
		backHref?: string;
		backLabel?: string;
		actions?: Snippet;
	} = $props();
</script>

<header class="mb-5">
	{#if backHref}
		<a
			href={backHref}
			class="mb-2 inline-flex min-h-8 items-center gap-1 text-xs font-medium text-ink-muted
			       transition-colors hover:text-ink"
		>
			<Icon name="chevronLeft" size={14} />
			{backLabel}
		</a>
	{/if}

	<div class="flex items-end justify-between gap-4">
		<div class="min-w-0">
			{#if eyebrow}
				<p class="mb-1 text-2xs font-bold uppercase tracking-[0.14em] text-brand">
					{eyebrow}
				</p>
			{/if}
			<h1 class="text-title font-extrabold">{title}</h1>
			{#if description}
				<p class="mt-1.5 max-w-prose text-sm text-ink-muted">{description}</p>
			{/if}
		</div>
		{#if actions}
			<div class="shrink-0">{@render actions()}</div>
		{/if}
	</div>
</header>
