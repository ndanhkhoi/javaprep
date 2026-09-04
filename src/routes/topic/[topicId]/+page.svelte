<script lang="ts">
	import { base } from '$app/paths';
	import QuestionListItem from '$lib/components/QuestionListItem.svelte';
	import { masteryLevel, type MasteryLevel } from '$lib/srs/sm2';
	import { progress } from '$lib/stores/progress.svelte';
	import type { Difficulty } from '$lib/types';

	let { data } = $props();

	let difficulty = $state<Difficulty | null>(null);
	let status = $state<MasteryLevel | null>(null);

	const difficulties: { value: Difficulty; label: string }[] = [
		{ value: 'easy', label: 'Dễ' },
		{ value: 'medium', label: 'Vừa' },
		{ value: 'hard', label: 'Khó' }
	];
	const statuses: { value: MasteryLevel; label: string }[] = [
		{ value: 'new', label: 'Chưa học' },
		{ value: 'learning', label: 'Đang học' },
		{ value: 'mature', label: 'Đã thuộc' }
	];

	const rows = $derived(
		data.questions
			.map((question) => ({ question, level: masteryLevel(progress.cards[question.id]) }))
			.filter((r) => !difficulty || r.question.difficulty === difficulty)
			.filter((r) => !status || r.level === status)
	);
</script>

<svelte:head>
	<title>{data.topic.name} — JavaPrep</title>
</svelte:head>

<header class="mb-3">
	<a href="{base}/" class="text-xs text-ink-muted">← Chủ đề</a>
	<h1 class="mt-1 flex items-center gap-2 text-lg font-bold">
		<span aria-hidden="true">{data.topic.icon}</span>
		{data.topic.name}
	</h1>
	<p class="text-xs text-ink-muted">{data.questions.length} câu · {data.topic.blurb}</p>
</header>

<div class="mb-3 flex flex-wrap gap-1.5">
	{#each difficulties as d (d.value)}
		<button
			type="button"
			class="min-h-9 rounded-full border px-3 text-xs font-medium
			       {difficulty === d.value
				? 'border-brand bg-brand text-brand-ink'
				: 'border-border text-ink-muted'}"
			aria-pressed={difficulty === d.value}
			onclick={() => (difficulty = difficulty === d.value ? null : d.value)}
		>
			{d.label}
		</button>
	{/each}
	<span class="w-px self-stretch bg-border" aria-hidden="true"></span>
	{#each statuses as s (s.value)}
		<button
			type="button"
			class="min-h-9 rounded-full border px-3 text-xs font-medium
			       {status === s.value
				? 'border-brand bg-brand text-brand-ink'
				: 'border-border text-ink-muted'}"
			aria-pressed={status === s.value}
			onclick={() => (status = status === s.value ? null : s.value)}
		>
			{s.label}
		</button>
	{/each}
</div>

{#if rows.length === 0}
	<p class="py-8 text-center text-sm text-ink-muted">Không có câu nào khớp bộ lọc.</p>
{:else}
	<ul aria-label="Danh sách câu hỏi">
		{#each rows as row (row.question.id)}
			<li><QuestionListItem question={row.question} level={row.level} /></li>
		{/each}
	</ul>
{/if}

<a
	href="{base}/study?topic={data.topic.id}"
	class="mt-5 flex min-h-12 items-center justify-center rounded-xl border border-brand
	       px-4 text-sm font-semibold text-brand"
>
	Ôn chủ đề này
</a>
