<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import Flashcard from '$lib/components/Flashcard.svelte';
	import GradeButtons from '$lib/components/GradeButtons.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Celebrate from '$lib/components/ui/Celebrate.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { questions } from '$lib/data';
	import { buildSession } from '$lib/srs/queue';
	import { progress } from '$lib/stores/progress.svelte';
	import type { Grade, Question } from '$lib/types';

	const topic = $derived(page.url.searchParams.get('topic'));

	// Hàng đợi dựng đúng một lần khi vào phiên. Nếu để nó phái sinh từ `progress.cards`
	// thì mỗi lần chấm sẽ dựng lại hàng đợi và thẻ vừa chấm biến mất giữa chừng.
	let queue = $state<Question[]>([]);
	let revealed = $state(false);
	let graded = $state(0);
	let recalled = $state(0);
	let relearned = $state(0);
	let started = $state(false);
	let initialSize = $state(0);

	$effect(() => {
		if (started) return;
		queue = buildSession({
			questions,
			cards: progress.cards,
			today: progress.today,
			dailyNewLimit: progress.settings.dailyNewLimit,
			topicFilter: topic
		});
		initialSize = queue.length;
		started = true;
	});

	const current = $derived(queue[0]);
	const finished = $derived(started && queue.length === 0);
	const done = $derived(Math.max(0, initialSize - queue.length));
	const accuracy = $derived(graded === 0 ? 0 : Math.round((recalled / graded) * 100));
	const nextDue = $derived(
		Object.values(progress.cards)
			.map((c) => c.due)
			.filter((d) => d > progress.today)
			.sort()[0]
	);
	const nextDueCount = $derived(
		nextDue ? Object.values(progress.cards).filter((c) => c.due === nextDue).length : 0
	);

	function grade(value: Grade): void {
		const question = current;
		if (!question) return;

		progress.gradeCard(question.id, value);
		graded += 1;
		if (value >= 3) {
			recalled += 1;
			queue = queue.slice(1);
		} else {
			// Chấm "Quên" -> học lại ngay trong phiên, không chỉ đẩy sang mai.
			relearned += 1;
			queue = [...queue.slice(1), question];
		}
		revealed = false;
	}

	function onKeydown(event: KeyboardEvent): void {
		if (event.target instanceof HTMLInputElement || event.metaKey || event.ctrlKey) return;
		if (!current) return;

		if (!revealed && (event.key === ' ' || event.key === 'Enter')) {
			event.preventDefault();
			revealed = true;
			return;
		}
		if (!revealed) return;

		const map: Record<string, Grade> = { '1': 0, '2': 3, '3': 4, '4': 5 };
		const value = map[event.key];
		if (value !== undefined) {
			event.preventDefault();
			grade(value);
		}
	}
</script>

<svelte:head><title>Phiên ôn — JavaPrep</title></svelte:head>
<svelte:window onkeydown={onKeydown} />

<div
	class="mx-auto flex max-w-xl flex-col lg:min-h-[calc(100dvh-12rem)] lg:justify-center"
>
	{#if finished}
		<section class="relative pt-4 text-center">
			<Celebrate />

			<span
				class="animate-pop aurora-mesh mx-auto grid size-20 place-items-center rounded-3xl border
				       border-brand-line text-3xl shadow-2"
				aria-hidden="true"
			>
				🎉
			</span>
			<h1 class="mt-4 text-title font-extrabold">Xong phiên ôn</h1>
			<p class="mt-1.5 text-sm text-ink-muted">
				{graded} lượt chấm · {accuracy}% nhớ được ngay
			</p>

			<dl class="mt-6 grid grid-cols-3 gap-2.5 text-center">
				<div class="surface-card rounded-xl p-3">
					<dt class="text-2xs font-semibold uppercase tracking-wider text-ink-muted">Lượt chấm</dt>
					<dd class="mt-1 text-2xl font-extrabold tabular-nums">{graded}</dd>
				</div>
				<div class="surface-card rounded-xl p-3">
					<dt class="text-2xs font-semibold uppercase tracking-wider text-ink-muted">Nhớ được</dt>
					<dd class="mt-1 text-2xl font-extrabold tabular-nums text-ok">{recalled}</dd>
				</div>
				<div class="surface-card rounded-xl p-3">
					<dt class="text-2xs font-semibold uppercase tracking-wider text-ink-muted">Học lại</dt>
					<dd class="mt-1 text-2xl font-extrabold tabular-nums text-warn">{relearned}</dd>
				</div>
			</dl>

			{#if nextDue}
				<p
					class="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-2
					       px-3.5 py-2 text-xs text-ink-muted"
				>
					<Icon name="clock" size={14} />
					Đến hạn tiếp theo: <strong class="font-bold text-ink">{nextDueCount} thẻ</strong>
					vào {nextDue}
				</p>
			{/if}

			<div class="mt-7 flex flex-col gap-2.5">
				<Button href="{base}/study" size="lg" full>
					<Icon name="cards" size={18} strokeWidth={2} />
					Ôn tiếp
				</Button>
				<Button href="{base}/progress" variant="secondary" size="lg" full>
					<Icon name="chart" size={18} />
					Xem tiến độ
				</Button>
			</div>
		</section>
	{:else if current}
		<h1 class="sr-only">Phiên ôn thẻ</h1>
		<div class="mb-4 flex items-center gap-3">
			<a
				href="{base}/study"
				class="flex min-h-9 items-center gap-1 rounded-lg pe-2 text-xs font-medium text-ink-muted
				       transition-colors hover:text-ink"
				aria-label="Kết thúc phiên ôn"
			>
				<Icon name="chevronLeft" size={14} />
				Kết thúc
			</a>
			<div class="flex-1">
				<ProgressBar
					value={done}
					max={Math.max(1, initialSize)}
					label="Tiến độ phiên ôn"
					height="0.375rem"
				/>
			</div>
			<span class="shrink-0 text-xs font-semibold tabular-nums text-ink-muted">
				{done}/{initialSize}
			</span>
		</div>

		<Flashcard question={current} {revealed} onReveal={() => (revealed = true)} />

		<!-- Chỗ của bộ nút chấm được giữ sẵn ngay cả khi chưa lật, để thẻ không nhảy lên
		     xuống mỗi lần lật. -->
		<div class="mt-4 min-h-[4.5rem]">
			{#if revealed}
				<div class="animate-rise">
					<GradeButtons card={progress.cardFor(current.id)} onGrade={grade} />
				</div>
			{/if}
		</div>
	{:else}
		<p class="py-16 text-center text-sm text-ink-muted">Đang chuẩn bị phiên ôn…</p>
	{/if}
</div>
