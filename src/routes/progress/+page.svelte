<script lang="ts">
	import { base } from '$app/paths';
	import ForecastBars from '$lib/components/charts/ForecastBars.svelte';
	import StackedBar from '$lib/components/charts/StackedBar.svelte';
	import StatTile from '$lib/components/StatTile.svelte';
	import { questionById, questions, topics } from '$lib/data';
	import { forecast } from '$lib/stats/forecast';
	import { masteryByTopic, masteryOf } from '$lib/stats/mastery';
	import { longestStreak, streak } from '$lib/stats/streak';
	import { progress } from '$lib/stores/progress.svelte';

	const overall = $derived(masteryOf(questions, progress.cards));
	const byTopic = $derived(masteryByTopic(questions, progress.cards));
	const rows = $derived(
		topics.map((topic) => ({
			topic,
			mastery: byTopic[topic.id] ?? { new: 0, learning: 0, mature: 0, total: 0 }
		}))
	);
	const days = $derived(forecast(progress.cards, progress.today));
	const currentStreak = $derived(streak(progress.studyLog, progress.today));
	const bestStreak = $derived(longestStreak(progress.studyLog));

	const quizTotals = $derived(
		Object.values(progress.quiz).reduce(
			(acc, s) => ({ seen: acc.seen + s.seen, correct: acc.correct + s.correct }),
			{ seen: 0, correct: 0 }
		)
	);
	const quizAccuracy = $derived(
		quizTotals.seen === 0 ? null : Math.round((quizTotals.correct / quizTotals.seen) * 100)
	);

	/** Câu hay sai nhất — chỗ đáng dành thời gian ôn lại nhất. */
	const weakest = $derived(
		Object.entries(progress.quiz)
			.filter(([, s]) => s.seen >= 2 && s.correct / s.seen < 0.6)
			.sort((a, b) => a[1].correct / a[1].seen - b[1].correct / b[1].seen)
			.slice(0, 5)
			.map(([id, s]) => ({ question: questionById(id), stat: s }))
			.filter((x) => x.question !== undefined)
	);
</script>

<svelte:head><title>Tiến độ — JavaPrep</title></svelte:head>

<header class="mb-4">
	<h1 class="text-lg font-bold">Tiến độ</h1>
</header>

<div class="mb-5 grid grid-cols-2 gap-2">
	<StatTile
		label="Đến hạn hôm nay"
		value={progress.dueCount}
		tone={progress.dueCount > 0 ? 'warn' : 'ok'}
	/>
	<StatTile
		label="Chuỗi ngày"
		value={currentStreak}
		hint="kỷ lục {bestStreak} ngày"
		tone="brand"
	/>
	<StatTile label="Đã thuộc" value="{overall.mature}/{overall.total}" tone="ok" />
	<StatTile
		label="Độ chính xác quiz"
		value={quizAccuracy === null ? '—' : `${quizAccuracy}%`}
		hint="{quizTotals.seen} lượt trả lời"
	/>
</div>

<section class="mb-6">
	<h2 class="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
		Mức thành thạo theo chủ đề
	</h2>
	<StackedBar {rows} />
</section>

<section class="mb-6">
	<h2 class="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
		Lịch ôn 14 ngày tới
	</h2>
	<ForecastBars {days} />
	<p class="mt-1 text-[11px] text-ink-muted">Thẻ quá hạn được gộp vào cột hôm nay.</p>
</section>

{#if weakest.length > 0}
	<section class="mb-6">
		<h2 class="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">
			Câu hay sai nhất
		</h2>
		<ul class="space-y-1.5">
			{#each weakest as item (item.question?.id)}
				<li>
					<a
						href="{base}/q/{item.question?.id}"
						class="flex items-start gap-2 rounded-xl border border-border bg-surface-2 p-2.5"
					>
						<span class="flex-1 text-xs leading-snug">{item.question?.question}</span>
						<span class="shrink-0 text-[11px] tabular-nums text-bad">
							{item.stat.correct}/{item.stat.seen}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<a
	href="{base}/settings"
	class="flex min-h-12 items-center justify-center rounded-xl border border-border text-sm font-semibold"
>
	Cài đặt &amp; sao lưu
</a>
