<script lang="ts">
	import { base } from '$app/paths';
	import QuestionListItem from '$lib/components/QuestionListItem.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FilterChip from '$lib/components/ui/FilterChip.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { masteryLevel, type MasteryLevel } from '$lib/srs/sm2';
	import { masteryOf } from '$lib/stats/mastery';
	import { progress } from '$lib/stores/progress.svelte';
	import { accentStyle } from '$lib/theme/topic-accent';
	import { topicIcon } from '$lib/theme/topic-icon';
	import type { Difficulty } from '$lib/types';

	let { data } = $props();

	let difficulty = $state<Difficulty | null>(null);
	let status = $state<MasteryLevel | null>(null);

	const DIFFICULTIES: { value: Difficulty; label: string }[] = [
		{ value: 'easy', label: 'Dễ' },
		{ value: 'medium', label: 'Vừa' },
		{ value: 'hard', label: 'Khó' }
	];
	const STATUSES: { value: MasteryLevel; label: string }[] = [
		{ value: 'new', label: 'Chưa học' },
		{ value: 'learning', label: 'Đang học' },
		{ value: 'mature', label: 'Đã thuộc' }
	];

	const mastery = $derived(masteryOf(data.questions, progress.cards));

	const rows = $derived(
		data.questions
			.map((question) => ({ question, level: masteryLevel(progress.cards[question.id]) }))
			.filter((r) => !difficulty || r.question.difficulty === difficulty)
			.filter((r) => !status || r.level === status)
	);

	const hasFilter = $derived(difficulty !== null || status !== null);

	function clearFilters(): void {
		difficulty = null;
		status = null;
	}
</script>

<svelte:head>
	<title>{data.topic.name} — JavaPrep</title>
</svelte:head>

<div class="accent mx-auto max-w-4xl" style={accentStyle(data.topic.id)}>
	<a
		href="{base}/"
		class="mb-2 -ms-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-xs font-medium
		       text-ink-muted transition-colors hover:text-ink"
	>
		<Icon name="chevronLeft" size={14} />
		Chủ đề
	</a>

	<!-- Đầu trang mang hue của chủ đề: người dùng biết mình đang ở đâu trong 11 chủ đề
	     mà không cần đọc lại tiêu đề. -->
	<header class="surface-panel relative mb-5 overflow-hidden rounded-2xl p-5 sm:p-6">
		<span
			class="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full
			       bg-[var(--accent)] opacity-[0.13] blur-3xl"
			aria-hidden="true"
		></span>

		<div class="flex items-start gap-4">
			<span
				class="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--accent-soft)]
				       text-[var(--accent)]"
				aria-hidden="true"
			>
				<Icon name={topicIcon(data.topic.id)} size={26} strokeWidth={1.8} />
			</span>
			<div class="min-w-0 flex-1">
				<h1 class="text-title font-extrabold">{data.topic.name}</h1>
				<p class="mt-1.5 text-sm leading-relaxed text-ink-muted">{data.topic.blurb}</p>
			</div>
		</div>

		<div class="mt-5 space-y-2">
			<ProgressBar
				tone="accent"
				value={mastery.mature}
				max={mastery.total}
				label="{data.topic.name}: {mastery.mature} trên {mastery.total} câu đã thuộc"
			/>
			<p class="flex flex-wrap gap-x-3 text-2xs tabular-nums text-ink-muted">
				<span>{mastery.total} câu</span>
				<span class="text-ok">{mastery.mature} đã thuộc</span>
				<span class="text-warn">{mastery.learning} đang học</span>
				<span>{mastery.new} chưa học</span>
			</p>
		</div>
	</header>

	<section class="mb-4">
		<div class="mb-2.5 flex items-baseline justify-between gap-3">
			<h2 id="filter-heading" class="eyebrow flex items-center gap-1.5 text-ink-muted">
				<Icon name="filter" size={13} />
				Lọc
			</h2>
			{#if hasFilter}
				<button
					type="button"
					class="-me-2 min-h-11 rounded-lg px-2 text-2xs font-semibold text-brand hover:underline"
					onclick={clearFilters}
				>
					Bỏ lọc
				</button>
			{/if}
		</div>

		<div class="flex flex-wrap items-center gap-2" role="group" aria-labelledby="filter-heading">
			{#each DIFFICULTIES as d (d.value)}
				<FilterChip
					active={difficulty === d.value}
					onToggle={() => (difficulty = difficulty === d.value ? null : d.value)}
				>
					{d.label}
				</FilterChip>
			{/each}
			<span class="mx-1 h-6 w-px bg-border" aria-hidden="true"></span>
			{#each STATUSES as s (s.value)}
				<FilterChip
					active={status === s.value}
					onToggle={() => (status = status === s.value ? null : s.value)}
				>
					{s.label}
				</FilterChip>
			{/each}
		</div>
	</section>

	{#if rows.length === 0}
		<div class="surface-card rounded-xl py-12 text-center">
			<p class="text-sm font-medium">Không có câu nào khớp bộ lọc.</p>
			<button
				type="button"
				class="mt-1 min-h-11 px-3 text-xs font-semibold text-brand hover:underline"
				onclick={clearFilters}
			>
				Bỏ lọc để xem tất cả
			</button>
		</div>
	{:else}
		<ul class="space-y-2" aria-label="Danh sách câu hỏi">
			{#each rows as row (row.question.id)}
				<li><QuestionListItem question={row.question} level={row.level} /></li>
			{/each}
		</ul>
	{/if}

	<div class="mt-6 flex flex-col gap-2.5 sm:flex-row">
		<Button href="{base}/study?topic={data.topic.id}" size="lg" class="flex-1">
			<Icon name="cards" size={18} strokeWidth={2} />
			Ôn chủ đề này
		</Button>
		<Button
			href="{base}/quiz/play?count=10&topic={data.topic.id}"
			variant="secondary"
			size="lg"
			class="flex-1"
		>
			<Icon name="quiz" size={18} />
			Quiz 10 câu
		</Button>
	</div>
</div>
