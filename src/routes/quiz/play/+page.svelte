<script lang="ts">
	import { base } from '$app/paths';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import QuizOption from '$lib/components/QuizOption.svelte';
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

		const isCorrect = option === current.correct;
		if (isCorrect) correctCount += 1;
		else wrong = [...wrong, current];

		progress.recordQuizAnswer(current.question.id, isCorrect);
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

{#if finished}
	<section class="pt-6 text-center">
		<p class="text-4xl" aria-hidden="true">{percent >= 80 ? '🏆' : percent >= 50 ? '👍' : '📚'}</p>
		<h1 class="mt-2 text-lg font-bold">
			{correctCount}/{deck.length} câu đúng
		</h1>
		<p class="text-sm text-ink-muted tabular-nums">{percent}%</p>

		{#if wrong.length > 0}
			<h2 class="mb-2 mt-6 text-start text-xs font-semibold uppercase tracking-wide text-ink-muted">
				{wrong.length} câu cần xem lại
			</h2>
			<ul class="space-y-2 text-start">
				{#each wrong as item (item.question.id)}
					<li class="rounded-xl border border-border bg-surface-2 p-3">
						<p class="text-sm font-medium leading-snug">{item.question.question}</p>
						<p class="mt-1 text-xs text-ok">
							Đúng: {item.options[item.correct]}
						</p>
						<a
							href="{base}/q/{item.question.id}"
							class="mt-1 inline-block text-xs font-medium text-brand underline"
						>
							Xem giải thích →
						</a>
					</li>
				{/each}
			</ul>
		{/if}

		<div class="mt-6 flex flex-col gap-2">
			<a
				href="{base}/quiz"
				class="flex min-h-12 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-ink"
			>
				Chơi lại
			</a>
			<a
				href="{base}/study"
				class="flex min-h-12 items-center justify-center rounded-xl border border-border text-sm font-semibold"
			>
				Chuyển sang ôn thẻ
			</a>
		</div>
	</section>
{:else if current}
	<div class="mb-3 flex items-center gap-3">
		<a href="{base}/quiz" class="text-xs text-ink-muted">← Thoát</a>
		<div class="flex-1"><ProgressBar value={index} max={deck.length} label="Tiến độ quiz" /></div>
		<span class="text-xs tabular-nums text-ink-muted">
			{index + 1}/{deck.length} · {correctCount} đúng
		</span>
	</div>

	<h1 class="mb-4 text-base font-semibold leading-snug">{current.question.question}</h1>

	<div class="space-y-2">
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
		<div class="mt-4 rounded-xl border border-border bg-surface-2 p-3" role="status" aria-live="polite">
			<p class="text-xs font-semibold {selected === current.correct ? 'text-ok' : 'text-bad'}">
				{selected === current.correct ? '✓ Chính xác' : '✗ Chưa đúng'}
			</p>
			<p class="mt-1 text-sm leading-snug">{current.question.quiz.explanation}</p>
			<a
				href="{base}/q/{current.question.id}"
				class="mt-2 inline-block text-xs font-medium text-brand underline"
			>
				Xem giải thích đầy đủ →
			</a>
		</div>
		<button
			type="button"
			class="mt-3 min-h-12 w-full rounded-xl bg-brand text-sm font-semibold text-brand-ink"
			onclick={next}
		>
			{index + 1 === deck.length ? 'Xem kết quả' : 'Câu tiếp'}
		</button>
	{:else}
		<p class="mt-3 text-center text-[11px] text-ink-muted">Phím tắt: 1–4 để chọn</p>
	{/if}
{:else}
	<p class="py-10 text-center text-sm text-ink-muted">Không có câu hỏi nào trong phạm vi này.</p>
{/if}
