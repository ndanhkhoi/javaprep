<script lang="ts">
	import { base } from '$app/paths';
	import DifficultyBadge from './DifficultyBadge.svelte';
	import type { MasteryLevel } from '$lib/srs/sm2';
	import type { Question } from '$lib/types';

	let { question, level }: { question: Question; level: MasteryLevel } = $props();

	const dot: Record<MasteryLevel, { class: string; label: string }> = {
		new: { class: 'bg-surface-3', label: 'Chưa học' },
		learning: { class: 'bg-warn', label: 'Đang học' },
		mature: { class: 'bg-ok', label: 'Đã thuộc' }
	};
</script>

<a
	href="{base}/q/{question.id}"
	class="flex items-start gap-3 border-b border-border px-1 py-3 last:border-b-0
	       hover:bg-surface-2 focus-visible:bg-surface-2"
>
	<span
		class="mt-1.5 h-2 w-2 shrink-0 rounded-full {dot[level].class}"
		title={dot[level].label}
		aria-hidden="true"
	></span>
	<span class="sr-only">{dot[level].label}.</span>
	<span class="flex-1 text-sm leading-snug">{question.question}</span>
	<DifficultyBadge difficulty={question.difficulty} />
</a>
