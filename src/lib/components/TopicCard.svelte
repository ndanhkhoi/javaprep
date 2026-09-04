<script lang="ts">
	import { base } from '$app/paths';
	import ProgressBar from './ProgressBar.svelte';
	import Icon from './ui/Icon.svelte';
	import { accentStyle } from '$lib/theme/topic-accent';
	import type { MasteryBreakdown } from '$lib/stats/mastery';
	import type { Topic } from '$lib/types';

	let { topic, mastery }: { topic: Topic; mastery: MasteryBreakdown } = $props();

	const studied = $derived(mastery.learning + mastery.mature);
	const percent = $derived(
		mastery.total === 0 ? 0 : Math.round((mastery.mature / mastery.total) * 100)
	);
</script>

<a
	href="{base}/topic/{topic.id}"
	class="accent surface-card group relative flex h-full w-full flex-col gap-3 overflow-hidden rounded-xl p-4
	       transition-[border-color,box-shadow,transform] duration-[var(--dur)]
	       ease-[var(--ease-out-quart)] hover:-translate-y-0.5
	       hover:border-[var(--accent-line)] hover:shadow-2"
	style={accentStyle(topic.id)}
>
	<!-- Vệt sáng theo hue của chủ đề: đủ để phân biệt 11 thẻ, không đủ để làm nền chữ tụt tương phản. -->
	<span
		class="pointer-events-none absolute -right-10 -top-12 size-28 rounded-full
		       bg-[var(--accent)] opacity-[0.11] blur-2xl transition-opacity duration-[var(--dur)]
		       group-hover:opacity-20"
		aria-hidden="true"
	></span>

	<div class="flex items-start gap-3">
		<span
			class="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-base
			       leading-none sm:size-10 sm:text-lg"
			aria-hidden="true"
		>
			{topic.icon}
		</span>
		<h3 class="min-w-0 flex-1 text-sm font-bold leading-snug [overflow-wrap:anywhere]">
			{topic.name}
		</h3>
	</div>

	<p class="line-clamp-2 text-2xs leading-relaxed text-ink-muted">{topic.blurb}</p>

	<div class="mt-auto space-y-1.5">
		<ProgressBar
			tone="accent"
			value={mastery.mature}
			max={mastery.total}
			label="{topic.name}: {mastery.mature} trên {mastery.total} câu đã thuộc"
		/>
		<p class="flex items-center gap-1.5 text-2xs tabular-nums text-ink-subtle">
			<Icon name="book" size={12} />
			<span class="min-w-0 flex-1 truncate">{studied}/{mastery.total} đã học</span>
			<span class="shrink-0 font-bold text-[var(--accent)]">{percent}%</span>
		</p>
	</div>
</a>
