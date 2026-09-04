<script lang="ts">
	import { base } from '$app/paths';
	import ProgressBar from './ProgressBar.svelte';
	import type { MasteryBreakdown } from '$lib/stats/mastery';
	import type { Topic } from '$lib/types';

	let { topic, mastery }: { topic: Topic; mastery: MasteryBreakdown } = $props();

	const studied = $derived(mastery.learning + mastery.mature);
</script>

<a
	href="{base}/topic/{topic.id}"
	class="flex flex-col gap-2 rounded-xl border border-border bg-surface-2 p-3 transition-colors
	       hover:border-brand focus-visible:border-brand"
>
	<div class="flex items-start gap-2">
		<span class="text-xl leading-none" aria-hidden="true">{topic.icon}</span>
		<h2 class="flex-1 text-sm font-semibold leading-snug">{topic.name}</h2>
	</div>
	<p class="line-clamp-2 text-[11px] leading-snug text-ink-muted">{topic.blurb}</p>
	<div class="mt-auto space-y-1">
		<ProgressBar
			value={mastery.mature}
			max={mastery.total}
			label="{topic.name}: {mastery.mature} trên {mastery.total} câu đã thuộc"
		/>
		<p class="text-[11px] tabular-nums text-ink-muted">
			{studied}/{mastery.total} đã học · {mastery.mature} thuộc
		</p>
	</div>
</a>
