<script lang="ts">
	import { base } from '$app/paths';
	import { page } from '$app/state';
	import Flashcard from '$lib/components/Flashcard.svelte';
	import GradeButtons from '$lib/components/GradeButtons.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
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

{#if finished}
	<section class="pt-6 text-center">
		<p class="text-4xl" aria-hidden="true">🎉</p>
		<h1 class="mt-2 text-lg font-bold">Xong phiên ôn</h1>
		<dl class="mx-auto mt-4 grid max-w-xs grid-cols-3 gap-2 text-center">
			<div class="rounded-xl border border-border bg-surface-2 p-2">
				<dt class="text-[11px] text-ink-muted">Lượt chấm</dt>
				<dd class="text-xl font-bold tabular-nums">{graded}</dd>
			</div>
			<div class="rounded-xl border border-border bg-surface-2 p-2">
				<dt class="text-[11px] text-ink-muted">Nhớ được</dt>
				<dd class="text-xl font-bold tabular-nums text-ok">{recalled}</dd>
			</div>
			<div class="rounded-xl border border-border bg-surface-2 p-2">
				<dt class="text-[11px] text-ink-muted">Học lại</dt>
				<dd class="text-xl font-bold tabular-nums text-warn">{relearned}</dd>
			</div>
		</dl>
		{#if nextDue}
			<p class="mt-4 text-sm text-ink-muted">
				Đến hạn tiếp theo: <strong>{nextDueCount} thẻ</strong> vào {nextDue}
			</p>
		{/if}
		<div class="mt-6 flex flex-col gap-2">
			<a
				href="{base}/study"
				class="flex min-h-12 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-ink"
			>
				Ôn tiếp
			</a>
			<a
				href="{base}/progress"
				class="flex min-h-12 items-center justify-center rounded-xl border border-border text-sm font-semibold"
			>
				Xem tiến độ
			</a>
		</div>
	</section>
{:else if current}
	<div class="mb-3 flex items-center gap-3">
		<a href="{base}/study" class="text-xs text-ink-muted" aria-label="Kết thúc phiên">← Kết thúc</a>
		<div class="flex-1">
			<ProgressBar
				value={Math.max(0, initialSize - queue.length)}
				max={Math.max(1, initialSize)}
				label="Tiến độ phiên ôn"
			/>
		</div>
		<span class="text-xs tabular-nums text-ink-muted">{queue.length} còn lại</span>
	</div>

	<Flashcard question={current} {revealed} onReveal={() => (revealed = true)} />

	{#if revealed}
		<div class="mt-4">
			<GradeButtons card={progress.cardFor(current.id)} onGrade={grade} />
		</div>
	{/if}
{:else}
	<p class="py-10 text-center text-sm text-ink-muted">Đang chuẩn bị phiên ôn…</p>
{/if}
