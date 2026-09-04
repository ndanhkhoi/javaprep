<script lang="ts">
	import { base } from '$app/paths';
	import ForecastChart from '$lib/components/charts/ForecastChart.svelte';
	import MasteryBars from '$lib/components/charts/MasteryBars.svelte';
	import StreakHeatmap from '$lib/components/charts/StreakHeatmap.svelte';
	import InlineMarkdown from '$lib/components/InlineMarkdown.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import RingProgress from '$lib/components/ui/RingProgress.svelte';
	import StatTile from '$lib/components/ui/StatTile.svelte';
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
	const masteryPercent = $derived(
		overall.total === 0 ? 0 : Math.round((overall.mature / overall.total) * 100)
	);

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

<PageHeader
	eyebrow="Dashboard"
	title="Tiến độ"
	description="Toàn bộ số liệu tính từ dữ liệu trên thiết bị này. Không có gì được gửi đi đâu."
/>

<!-- Bento: mỗi ô trả lời một câu hỏi riêng, kích thước ô theo mức quan trọng. -->
<div class="grid gap-4 lg:grid-cols-3">
	<section
		class="aurora-mesh surface-panel flex flex-wrap items-center gap-6 rounded-2xl p-5 sm:p-6
		       lg:col-span-2"
		aria-labelledby="mastery-heading"
	>
		<RingProgress
			value={overall.mature}
			max={overall.total}
			size={132}
			thickness={12}
			boxClass="size-24 shrink-0 sm:size-33"
			label="Mức thành thạo toàn bộ bộ câu hỏi"
		>
			<span class="flex flex-col items-center gap-0.5">
				<span class="text-xl font-extrabold tabular-nums sm:text-3xl">{masteryPercent}%</span>
				<span class="text-2xs font-medium text-ink-muted">đã thuộc</span>
			</span>
		</RingProgress>

		<div class="min-w-0 flex-1">
			<h2 id="mastery-heading" class="text-heading font-bold">
				{overall.mature} trên {overall.total} câu đã thuộc
			</h2>
			<p class="mt-1.5 text-sm leading-relaxed text-ink-muted">
				"Đã thuộc" nghĩa là thẻ đã đạt khoảng ôn từ 21 ngày trở lên — quy ước mature card của
				Anki.
			</p>
			<dl class="mt-4 grid grid-cols-3 gap-3 text-center">
				<div class="rounded-lg bg-surface-2 p-2">
					<dt class="text-2xs text-ink-muted">Đã thuộc</dt>
					<dd class="text-base font-bold tabular-nums text-ok">{overall.mature}</dd>
				</div>
				<div class="rounded-lg bg-surface-2 p-2">
					<dt class="text-2xs text-ink-muted">Đang học</dt>
					<dd class="text-base font-bold tabular-nums text-warn">{overall.learning}</dd>
				</div>
				<div class="rounded-lg bg-surface-2 p-2">
					<dt class="text-2xs text-ink-muted">Chưa học</dt>
					<dd class="text-base font-bold tabular-nums text-ink-muted">{overall.new}</dd>
				</div>
			</dl>
		</div>
	</section>

	<div class="grid grid-cols-2 gap-3 lg:gap-4 lg:content-start">
		<StatTile
			label="Đến hạn hôm nay"
			value={progress.dueCount}
			icon="clock"
			tone={progress.dueCount > 0 ? 'warn' : 'ok'}
			hint={progress.dueCount > 0 ? 'cần ôn' : 'sạch lịch'}
		/>
		<StatTile
			label="Chuỗi ngày"
			value={currentStreak}
			icon="flame"
			tone={currentStreak > 0 ? 'warn' : 'default'}
			hint="kỷ lục {bestStreak} ngày"
		/>
		<StatTile
			label="Chính xác quiz"
			value={quizAccuracy === null ? '—' : `${quizAccuracy}%`}
			icon="target"
			tone="brand"
			hint="{quizTotals.seen} lượt trả lời"
		/>
		<StatTile
			label="Ngày đã ôn"
			value={progress.studyLog.length}
			icon="check"
			tone="ok"
			hint="tổng cộng"
		/>
	</div>
</div>

<div class="mt-4 grid gap-4 lg:grid-cols-2">
	<section class="surface-card rounded-2xl p-5" aria-labelledby="forecast-heading">
		<h2 id="forecast-heading" class="mb-1 text-sm font-bold">Lịch ôn 14 ngày tới</h2>
		<p class="mb-4 text-2xs text-ink-muted">Thẻ quá hạn được gộp vào cột hôm nay.</p>
		<ForecastChart {days} />
	</section>

	<section class="surface-card rounded-2xl p-5" aria-labelledby="heatmap-heading">
		<h2 id="heatmap-heading" class="mb-1 text-sm font-bold">Nhịp học</h2>
		<p class="mb-4 text-2xs text-ink-muted">
			Mỗi ô là một ngày. Ô xanh là ngày bạn đã ôn ít nhất một thẻ.
		</p>
		<StreakHeatmap studyLog={progress.studyLog} today={progress.today} />
	</section>
</div>

<section class="surface-card mt-4 rounded-2xl p-5" aria-labelledby="topics-heading">
	<h2 id="topics-heading" class="mb-4 text-sm font-bold">Mức thành thạo theo chủ đề</h2>
	<MasteryBars {rows} />
</section>

{#if weakest.length > 0}
	<section class="mt-4" aria-labelledby="weakest-heading">
		<h2 id="weakest-heading" class="eyebrow mb-2.5 flex items-center gap-2 text-ink-muted">
			<Icon name="target" size={13} />
			Câu hay sai nhất
		</h2>
		<ul class="grid gap-2.5 sm:grid-cols-2">
			{#each weakest as item (item.question?.id)}
				<li>
					<a
						href="{base}/q/{item.question?.id}"
						class="surface-card group flex items-center gap-3 rounded-xl p-3.5
						       transition-[border-color,transform] duration-[var(--dur-fast)]
						       hover:-translate-y-px hover:border-bad/50"
					>
						<InlineMarkdown
							source={item.question?.question ?? ''}
							class="min-w-0 flex-1 text-xs font-medium leading-snug"
						/>
						<span
							class="shrink-0 rounded-full bg-bad-soft px-2 py-1 text-2xs font-bold tabular-nums
							       text-bad"
						>
							{item.stat.correct}/{item.stat.seen}
						</span>
					</a>
				</li>
			{/each}
		</ul>
	</section>
{/if}

<div class="mt-6 flex flex-col gap-2.5 sm:flex-row">
	<Button href="{base}/study" size="lg" class="flex-1">
		<Icon name="cards" size={18} strokeWidth={2} />
		Ôn thẻ ngay
	</Button>
	<Button href="{base}/settings" variant="secondary" size="lg" class="flex-1">
		<Icon name="settings" size={18} />
		Cài đặt &amp; sao lưu
	</Button>
</div>
