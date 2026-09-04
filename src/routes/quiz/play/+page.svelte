<script lang="ts">
	import { base } from '$app/paths';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import InlineMarkdown from '$lib/components/InlineMarkdown.svelte';
	import QuizOption from '$lib/components/QuizOption.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Celebrate from '$lib/components/ui/Celebrate.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import RingProgress from '$lib/components/ui/RingProgress.svelte';
	import { questions } from '$lib/data';
	import { selectQuizQuestions } from '$lib/quiz/select';
	import { shuffleOptions, type ShuffledQuestion } from '$lib/quiz/shuffle';
	import { progress } from '$lib/stores/progress.svelte';

	const topic = $derived(page.url.searchParams.get('topic'));
	const requested = $derived(Number(page.url.searchParams.get('count')) || 10);

	let deck = $state<ShuffledQuestion[]>([]);
	let index = $state(0);
	let selected = $state<number | null>(null);
	let correctCount = $state(0);
	let wrong = $state<ShuffledQuestion[]>([]);
	let started = $state(false);

	$effect(() => {
		if (started) return;
		deck = selectQuizQuestions({
			questions,
			stats: progress.quiz,
			count: requested,
			topicFilter: topic
		}).map((q) => shuffleOptions(q));
		started = true;
	});

	const current = $derived(deck[index]);
	const locked = $derived(selected !== null);
	const finished = $derived(started && deck.length > 0 && index >= deck.length);
	const percent = $derived(deck.length === 0 ? 0 : Math.round((correctCount / deck.length) * 100));
	const isRight = $derived(current !== undefined && selected === current.correct);

	const verdict = $derived.by(() => {
		if (percent >= 80) return { emoji: '🏆', title: 'Rất tốt', tone: 'text-ok' };
		if (percent >= 50) return { emoji: '👍', title: 'Tạm được', tone: 'text-warn' };
		return { emoji: '📚', title: 'Cần ôn thêm', tone: 'text-bad' };
	});

	// Rời giữa phiên làm mất kết quả đang có -> hỏi lại. QuizStat từng câu đã được ghi
	// ngay sau mỗi lần trả lời nên phần dữ liệu quan trọng thì không mất.
	beforeNavigate(({ cancel, to }) => {
		if (finished || !started || index === 0) return;
		if (to?.url.pathname.includes('/quiz/play')) return;
		if (!confirm('Thoát quiz? Kết quả phiên này sẽ không được lưu.')) cancel();
	});

	function choose(option: number): void {
		if (locked || !current) return;
		selected = option;

		const wasCorrect = option === current.correct;
		if (wasCorrect) correctCount += 1;
		else wrong = [...wrong, current];

		progress.recordQuizAnswer(current.question.id, wasCorrect);
	}

	function next(): void {
		selected = null;
		index += 1;
	}

	function onKeydown(event: KeyboardEvent): void {
		if (!current || event.metaKey || event.ctrlKey) return;
		if (locked && (event.key === 'Enter' || event.key === ' ')) {
			event.preventDefault();
			next();
			return;
		}
		const option = ['1', '2', '3', '4'].indexOf(event.key);
		if (option >= 0) {
			event.preventDefault();
			choose(option);
		}
	}
</script>

<svelte:head><title>Quiz — JavaPrep</title></svelte:head>
<svelte:window onkeydown={onKeydown} />

<div
	class="mx-auto flex max-w-xl flex-col lg:min-h-[calc(100dvh-12rem)] lg:justify-center"
>
	{#if finished}
		<section class="relative pt-4">
			{#if percent >= 50}
				<Celebrate />
			{/if}

			<div class="flex flex-col items-center text-center">
				<RingProgress
					value={correctCount}
					max={deck.length}
					size={148}
					thickness={13}
					boxClass="size-28 sm:size-37"
					stroke={percent >= 80
						? 'var(--color-ok-solid)'
						: percent >= 50
							? 'var(--color-warn-solid)'
							: 'var(--color-bad-solid)'}
					label="Tỷ lệ trả lời đúng"
				>
					<span class="flex flex-col items-center gap-1">
						<span class="text-2xl font-extrabold tabular-nums sm:text-3xl">{percent}%</span>
						<span class="text-2xs font-medium tabular-nums text-ink-muted">
							{correctCount}/{deck.length} câu
						</span>
					</span>
				</RingProgress>

				<h1 class="mt-5 text-title font-extrabold">
					<span aria-hidden="true">{verdict.emoji}</span>
					{verdict.title}
				</h1>
				<p class="mt-1 text-sm text-ink-muted">
					{#if wrong.length === 0}
						Không sai câu nào. Đây là lúc chuyển sang ôn thẻ để nhớ lâu.
					{:else}
						{wrong.length} câu cần xem lại — nó sẽ quay lại sớm trong lượt quiz sau.
					{/if}
				</p>
			</div>

			{#if wrong.length > 0}
				<h2 class="mb-2.5 mt-7 text-2xs font-bold uppercase tracking-[0.13em] text-ink-muted">
					Câu cần xem lại
				</h2>
				<ul class="space-y-2.5">
					{#each wrong as item (item.question.id)}
						<li class="surface-card rounded-xl p-4">
							<InlineMarkdown
								source={item.question.question}
								class="block text-sm font-semibold leading-snug"
							/>
							<p class="mt-2 flex items-start gap-2 text-xs leading-snug text-ok">
								<Icon name="check" size={14} strokeWidth={2.6} class="mt-px" />
								<InlineMarkdown source={item.options[item.correct]} />
							</p>
							<a
								href="{base}/q/{item.question.id}"
								class="mt-2.5 inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold
								       text-brand"
							>
								Xem giải thích
								<Icon name="arrowRight" size={14} strokeWidth={2} />
							</a>
						</li>
					{/each}
				</ul>
			{/if}

			<div class="mt-7 flex flex-col gap-2.5">
				<Button href="{base}/quiz" size="lg" full>
					<Icon name="refresh" size={18} strokeWidth={2} />
					Chơi lại
				</Button>
				<Button href="{base}/study" variant="secondary" size="lg" full>
					<Icon name="cards" size={18} />
					Chuyển sang ôn thẻ
				</Button>
			</div>
		</section>
	{:else if current}
		<div class="mb-4 flex items-center gap-3">
			<a
				href="{base}/quiz"
				class="flex min-h-9 items-center gap-1 pe-2 text-xs font-medium text-ink-muted
				       transition-colors hover:text-ink"
			>
				<Icon name="chevronLeft" size={14} />
				Thoát
			</a>
			<div class="flex-1">
				<ProgressBar value={index} max={deck.length} label="Tiến độ quiz" height="0.375rem" />
			</div>
			<span class="shrink-0 text-xs font-semibold tabular-nums text-ink-muted">
				{index + 1}/{deck.length}
			</span>
			<span
				class="shrink-0 rounded-full bg-ok-soft px-2 py-0.5 text-2xs font-bold tabular-nums text-ok"
			>
				{correctCount} đúng
			</span>
		</div>

		<h1 class="surface-panel mb-4 rounded-2xl p-5 text-heading font-bold leading-snug">
			<InlineMarkdown source={current.question.question} />
		</h1>

		<div class="space-y-2.5">
			{#each current.options as option, i (option)}
				<QuizOption
					text={option}
					index={i}
					selected={selected === i}
					correct={i === current.correct}
					{locked}
					onSelect={() => choose(i)}
				/>
			{/each}
		</div>

		{#if locked}
			<div
				class="animate-rise mt-4 rounded-xl border p-4
				       {isRight ? 'border-ok/40 bg-ok-soft' : 'border-bad/40 bg-bad-soft'}"
				role="status"
				aria-live="polite"
			>
				<p class="flex items-center gap-2 text-xs font-bold {isRight ? 'text-ok' : 'text-bad'}">
					<Icon name={isRight ? 'check' : 'x'} size={15} strokeWidth={2.6} />
					{isRight ? 'Chính xác' : 'Chưa đúng'}
				</p>
				<InlineMarkdown
					source={current.question.quiz.explanation}
					class="mt-2 block text-sm leading-relaxed"
				/>
				<a
					href="{base}/q/{current.question.id}"
					class="mt-2.5 inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold text-brand"
				>
					Xem giải thích đầy đủ
					<Icon name="arrowRight" size={14} strokeWidth={2} />
				</a>
			</div>

			<Button size="lg" full class="mt-3" onclick={next}>
				{index + 1 === deck.length ? 'Xem kết quả' : 'Câu tiếp'}
				<Icon name="arrowRight" size={17} strokeWidth={2} />
			</Button>
		{:else}
			<p
				class="mt-4 flex items-center justify-center gap-1.5 text-2xs text-ink-subtle max-sm:hidden"
			>
				<Icon name="keyboard" size={13} />
				Phím tắt: 1–4 để chọn
			</p>
		{/if}
	{:else}
		<p class="py-16 text-center text-sm text-ink-muted">
			Không có câu hỏi nào trong phạm vi này.
		</p>
	{/if}
</div>
