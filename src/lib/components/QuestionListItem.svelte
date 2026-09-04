<script lang="ts">
	import { base } from '$app/paths';
	import InlineMarkdown from './InlineMarkdown.svelte';
	import DifficultyBadge from './DifficultyBadge.svelte';
	import Icon from './ui/Icon.svelte';
	import { topicById } from '$lib/data';
	import { accentStyle } from '$lib/theme/topic-accent';
	import type { MasteryLevel } from '$lib/srs/sm2';
	import type { Question } from '$lib/types';

	let {
		question,
		level,
		/** Bật ở trang tìm kiếm, nơi kết quả trộn nhiều chủ đề. */
		showTopic = false
	}: { question: Question; level: MasteryLevel; showTopic?: boolean } = $props();

	const DOT: Record<MasteryLevel, { class: string; label: string }> = {
		new: { class: 'bg-surface-4', label: 'Chưa học' },
		learning: { class: 'bg-warn-solid', label: 'Đang học' },
		mature: { class: 'bg-ok-solid', label: 'Đã thuộc' }
	};

	const topic = $derived(showTopic ? topicById(question.topic) : undefined);
</script>

<a
	href="{base}/q/{question.id}"
	class="accent surface-card group flex items-center gap-3 rounded-xl p-3
	       transition-[border-color,box-shadow,transform] duration-[var(--dur-fast)]
	       hover:-translate-y-px hover:border-[var(--accent-line)] hover:shadow-2"
	style={accentStyle(question.topic)}
>
	<span
		class="size-2 shrink-0 rounded-full {DOT[level].class}"
		title={DOT[level].label}
		aria-hidden="true"
	></span>
	<span class="sr-only">{DOT[level].label}.</span>

	<span class="min-w-0 flex-1">
		{#if topic}
			<span class="mb-0.5 block truncate text-2xs font-semibold text-[var(--accent)]">
				{topic.icon} {topic.name}
			</span>
		{/if}
		<InlineMarkdown source={question.question} class="block text-sm font-medium leading-snug" />
	</span>

	<DifficultyBadge difficulty={question.difficulty} size="sm" />
	<Icon
		name="chevronRight"
		size={16}
		class="text-ink-subtle transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5"
	/>
</a>
