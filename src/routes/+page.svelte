<script lang="ts">
	import { base } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import RingProgress from '$lib/components/ui/RingProgress.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import StatTile from '$lib/components/ui/StatTile.svelte';
	import TopicCard from '$lib/components/TopicCard.svelte';
	import { questions, topics } from '$lib/data';
	import { formatIsoDate } from '$lib/srs/date';
	import { buildSession } from '$lib/srs/queue';
	import { masteryByTopic, masteryOf } from '$lib/stats/mastery';
	import { longestStreak, streak } from '$lib/stats/streak';
	import { progress } from '$lib/stores/progress.svelte';

	const byTopic = $derived(masteryByTopic(questions, progress.cards));
	const overall = $derived(masteryOf(questions, progress.cards));
	const currentStreak = $derived(streak(progress.studyLog, progress.today));
	const bestStreak = $derived(longestStreak(progress.studyLog));
	const dueCount = $derived(progress.dueCount);

	/** Đúng hàng đợi mà trang ôn thẻ sẽ dựng — nhờ vậy CTA không hứa số thẻ không có. */
	const sessionSize = $derived(
		buildSession({
			questions,
			cards: progress.cards,
			today: progress.today,
			dailyNewLimit: progress.settings.dailyNewLimit,
			topicFilter: null
		}).length
	);
	const newInSession = $derived(Math.max(0, sessionSize - dueCount));

	const masteryPercent = $derived(
		overall.total === 0 ? 0 : Math.round((overall.mature / overall.total) * 100)
	);

	const greeting = $derived.by(() => {
		const hour = new Date().getHours();
		if (hour < 5) return 'Đêm khuya rồi';
		if (hour < 11) return 'Chào buổi sáng';
		if (hour < 14) return 'Chào buổi trưa';
		if (hour < 18) return 'Chào buổi chiều';
		return 'Chào buổi tối';
	});

	/** Không kèm thứ: "CHÀO BUỔI TỐI · THỨ BẢY, 5 THÁNG 9" tràn sang dòng thứ hai ngay
	    trên màn 375px, mà thứ thì đã có ở heatmap nhịp học. */
	const dateLabel = $derived(formatIsoDate(progress.today));

	/** Ba trạng thái của hero, mỗi trạng thái có đúng một hành động chính. */
	const hero = $derived.by(() => {
		if (dueCount > 0) {
			return {
				headline: `${dueCount} thẻ đến hạn`,
				sub:
					newInSession > 0
						? `Cộng thêm ${newInSession} thẻ mới trong phiên hôm nay.`
						: 'Ôn xong là lịch của hôm nay sạch.',
				cta: { label: `Ôn ${dueCount} thẻ`, href: `${base}/study/session`, icon: 'cards' as const }
			};
		}
		if (sessionSize > 0) {
			return {
				headline: 'Không còn thẻ đến hạn',
				sub: `Còn ${sessionSize} thẻ mới sẵn sàng nếu bạn muốn học thêm.`,
				cta: { label: `Học ${sessionSize} thẻ mới`, href: `${base}/study/session`, icon: 'bolt' as const }
			};
		}
		return {
			headline: 'Hôm nay bạn học xong rồi',
			sub: 'Muốn giữ nhịp thì thử một lượt quiz — nó không ảnh hưởng tới lịch ôn.',
			cta: { label: 'Làm quiz nhanh', href: `${base}/quiz`, icon: 'quiz' as const }
		};
	});
</script>

<svelte:head>
	<title>JavaPrep — Ôn phỏng vấn Java &amp; Spring Boot</title>
</svelte:head>

<div class="grid gap-4 lg:grid-cols-3">
	<!-- Hero: một khối duy nhất trả lời "giờ tôi nên làm gì" -->
	<section
		class="aurora-mesh animate-rise surface-panel relative flex flex-col overflow-hidden
		       rounded-2xl p-5 sm:p-7 lg:col-span-2"
		aria-labelledby="hero-headline"
	>
		<div class="flex flex-1 flex-col">
			<div class="flex items-start justify-between gap-4 sm:gap-6">
				<div class="min-w-0 flex-1">
					<p class="eyebrow text-brand">{greeting} · {dateLabel}</p>
					<h1 id="hero-headline" class="mt-2 text-display font-extrabold">
						{hero.headline}
					</h1>
					<p class="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{hero.sub}</p>
				</div>

				<RingProgress
					value={overall.mature}
					max={overall.total}
					size={124}
					thickness={11}
					boxClass="size-20 shrink-0 sm:size-31"
					label="Mức thành thạo toàn bộ bộ câu hỏi"
				>
					<span class="flex flex-col items-center gap-0.5">
						<span class="text-base font-extrabold tabular-nums sm:text-2xl">
							{masteryPercent}%
						</span>
						<span class="hidden text-2xs font-medium text-ink-muted sm:block">đã thuộc</span>
					</span>
				</RingProgress>
			</div>

			<div class="mt-5 flex flex-wrap gap-2">
				<Button href={hero.cta.href} size="lg" class="flex-1 sm:flex-none">
					<Icon name={hero.cta.icon} size={18} strokeWidth={2} />
					{hero.cta.label}
				</Button>
				<Button href="{base}/quiz" variant="secondary" size="lg">
					<Icon name="quiz" size={18} />
					Quiz
				</Button>
			</div>
		</div>

		<!-- Dải chân hero: lấp đúng phần chiều cao mà cột thống kê bên cạnh tạo ra, và
		     lấp bằng thông tin thật thay vì khoảng trắng. -->
		<dl
			class="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-4 text-2xs
			       text-ink-muted"
		>
			<div class="flex items-center gap-1.5">
				<dt>Phiên hôm nay</dt>
				<dd class="font-bold tabular-nums text-ink">{sessionSize} thẻ</dd>
			</div>
			<div class="flex items-center gap-1.5">
				<dt>Thẻ mới</dt>
				<dd class="font-bold tabular-nums text-ink">{newInSession}</dd>
			</div>
			<div class="flex items-center gap-1.5">
				<dt>Giới hạn mỗi ngày</dt>
				<dd class="font-bold tabular-nums text-ink">{progress.settings.dailyNewLimit}</dd>
			</div>
			<a
				href="{base}/settings"
				class="-my-2 ms-auto inline-flex min-h-11 items-center gap-1 font-semibold text-brand
				       hover:underline"
			>
				Đổi giới hạn
				<Icon name="arrowRight" size={12} strokeWidth={2.2} />
			</a>
		</dl>
	</section>

	<div class="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-4">
		<StatTile
			label="Đến hạn"
			value={dueCount}
			icon="clock"
			tone={dueCount > 0 ? 'warn' : 'ok'}
			hint={dueCount > 0 ? 'cần ôn hôm nay' : 'sạch lịch'}
		/>
		<StatTile
			label="Đã thuộc"
			value={overall.mature}
			icon="target"
			tone="brand"
			hint="trên {overall.total} câu"
		/>
		<StatTile
			label="Chuỗi ngày"
			value={currentStreak}
			icon="flame"
			tone={currentStreak > 0 ? 'warn' : 'default'}
			hint={bestStreak > 0 ? `kỷ lục ${bestStreak}` : 'chưa bắt đầu'}
		/>
	</div>
</div>

<section class="mt-8" aria-labelledby="topics-heading">
	<div class="mb-2.5 flex items-baseline justify-between gap-3">
		<h2 id="topics-heading" class="eyebrow text-ink-muted">Chủ đề</h2>
		<p class="text-2xs tabular-nums text-ink-subtle">
			{topics.length} chủ đề · {questions.length} câu
		</p>
	</div>

	<ul class="stagger grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
		{#each topics as topic, i (topic.id)}
			<li class="flex" style="--i: {i}">
				<TopicCard
					{topic}
					mastery={byTopic[topic.id] ?? { new: 0, learning: 0, mature: 0, total: 0 }}
				/>
			</li>
		{/each}
	</ul>
</section>

<section class="mt-8">
	<SectionHeading title="Lối tắt" />
	<div class="grid gap-3 sm:grid-cols-3">
		<a
			href="{base}/search"
			class="surface-card group flex items-center gap-3 rounded-xl p-4 transition-colors
			       hover:border-border-strong"
		>
			<span class="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
				<Icon name="search" size={18} />
			</span>
			<span class="min-w-0 flex-1">
				<span class="block text-sm font-semibold">Tìm câu hỏi</span>
				<span class="block text-2xs text-ink-muted">Gõ không dấu cũng được</span>
			</span>
			<Icon name="arrowRight" size={16} class="text-ink-subtle transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5" />
		</a>
		<a
			href="{base}/progress"
			class="surface-card group flex items-center gap-3 rounded-xl p-4 transition-colors
			       hover:border-border-strong"
		>
			<span class="grid size-9 shrink-0 place-items-center rounded-lg bg-ok-soft text-ok">
				<Icon name="chart" size={18} />
			</span>
			<span class="min-w-0 flex-1">
				<span class="block text-sm font-semibold">Tiến độ</span>
				<span class="block text-2xs text-ink-muted">Lịch ôn &amp; điểm yếu</span>
			</span>
			<Icon name="arrowRight" size={16} class="text-ink-subtle transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5" />
		</a>
		<a
			href="{base}/settings"
			class="surface-card group flex items-center gap-3 rounded-xl p-4 transition-colors
			       hover:border-border-strong"
		>
			<span class="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-3 text-ink-muted">
				<Icon name="settings" size={18} />
			</span>
			<span class="min-w-0 flex-1">
				<span class="block text-sm font-semibold">Cài đặt</span>
				<span class="block text-2xs text-ink-muted">Giao diện &amp; sao lưu</span>
			</span>
			<Icon name="arrowRight" size={16} class="text-ink-subtle transition-transform duration-[var(--dur-fast)] group-hover:translate-x-0.5" />
		</a>
	</div>
</section>
