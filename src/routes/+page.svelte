<script lang="ts">
	import { base } from '$app/paths';
	import { questions, topics } from '$lib/data';
	import { masteryByTopic, masteryOf } from '$lib/stats/mastery';
	import { streak } from '$lib/stats/streak';
	import { progress } from '$lib/stores/progress.svelte';
	import TopicCard from '$lib/components/TopicCard.svelte';
	import StatTile from '$lib/components/StatTile.svelte';

	const byTopic = $derived(masteryByTopic(questions, progress.cards));
	const overall = $derived(masteryOf(questions, progress.cards));
	const currentStreak = $derived(streak(progress.studyLog, progress.today));
	const dueCount = $derived(progress.dueCount);
</script>

<svelte:head>
	<title>JavaPrep — Ôn phỏng vấn Java & Spring Boot</title>
</svelte:head>

<header class="mb-4">
	<h1 class="text-xl font-bold">JavaPrep</h1>
	<p class="text-sm text-ink-muted">100 câu phỏng vấn Java &amp; Spring Boot theo chủ đề</p>
</header>

<a
	href="{base}/search"
	class="mb-4 flex min-h-11 w-full items-center gap-2 rounded-xl border border-border
	       bg-surface-2 px-3 text-sm text-ink-muted"
>
	<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
		<circle cx="11" cy="11" r="7" />
		<path d="m20 20-3.5-3.5" stroke-linecap="round" />
	</svg>
	Tìm câu hỏi…
</a>

<div class="mb-4 grid grid-cols-3 gap-2">
	<StatTile label="Đến hạn" value={dueCount} tone={dueCount > 0 ? 'warn' : 'ok'} />
	<StatTile label="Đã thuộc" value="{overall.mature}/{overall.total}" tone="brand" />
	<StatTile label="Chuỗi ngày" value={currentStreak} hint={currentStreak > 0 ? 'ngày liên tiếp' : 'chưa bắt đầu'} />
</div>

{#if dueCount > 0}
	<a
		href="{base}/study"
		class="mb-5 flex min-h-12 items-center justify-center rounded-xl bg-brand px-4
		       text-sm font-semibold text-brand-ink"
	>
		Ôn {dueCount} thẻ đến hạn
	</a>
{/if}

<h2 class="mb-2 text-sm font-semibold text-ink-muted">Chủ đề</h2>
<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
	{#each topics as topic (topic.id)}
		<TopicCard {topic} mastery={byTopic[topic.id] ?? { new: 0, learning: 0, mature: 0, total: 0 }} />
	{/each}
</div>

<p class="mt-6 text-center text-xs text-ink-muted">
	<a href="{base}/settings" class="underline">Cài đặt &amp; sao lưu</a>
</p>
