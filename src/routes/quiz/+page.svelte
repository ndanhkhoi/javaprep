<script lang="ts">
	import { base } from '$app/paths';
	import { questions, topics } from '$lib/data';

	let topic = $state<string | null>(null);
	let count = $state(10);

	const counts = [10, 20, 0];
	const available = $derived(
		topic ? questions.filter((q) => q.topic === topic).length : questions.length
	);
	const effective = $derived(count === 0 ? available : Math.min(count, available));
	const href = $derived(
		`${base}/quiz/play?count=${effective}${topic ? `&topic=${topic}` : ''}`
	);
</script>

<svelte:head><title>Quiz — JavaPrep</title></svelte:head>

<header class="mb-4">
	<h1 class="text-lg font-bold">Quiz trắc nghiệm</h1>
	<p class="text-sm text-ink-muted">
		4 lựa chọn, phản hồi ngay. Quiz đo nhận diện — không ảnh hưởng tới lịch ôn thẻ.
	</p>
</header>

<h2 class="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Phạm vi</h2>
<div class="mb-4 flex flex-wrap gap-1.5">
	<button
		type="button"
		class="min-h-9 rounded-full border px-3 text-xs font-medium
		       {topic === null ? 'border-brand bg-brand text-brand-ink' : 'border-border text-ink-muted'}"
		aria-pressed={topic === null}
		onclick={() => (topic = null)}
	>
		Tất cả
	</button>
	{#each topics as t (t.id)}
		<button
			type="button"
			class="min-h-9 rounded-full border px-3 text-xs font-medium
			       {topic === t.id ? 'border-brand bg-brand text-brand-ink' : 'border-border text-ink-muted'}"
			aria-pressed={topic === t.id}
			onclick={() => (topic = topic === t.id ? null : t.id)}
		>
			{t.icon} {t.name}
		</button>
	{/each}
</div>

<h2 class="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Số câu</h2>
<div class="mb-5 flex gap-1.5">
	{#each counts as c (c)}
		<button
			type="button"
			class="min-h-11 flex-1 rounded-xl border text-sm font-medium
			       {count === c ? 'border-brand bg-brand text-brand-ink' : 'border-border text-ink-muted'}"
			aria-pressed={count === c}
			onclick={() => (count = c)}
		>
			{c === 0 ? `Tất cả (${available})` : c}
		</button>
	{/each}
</div>

<a
	href={href}
	class="flex min-h-12 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-ink"
>
	Bắt đầu {effective} câu
</a>

<p class="mt-4 text-center text-xs text-ink-muted">
	Câu bạn hay trả lời sai sẽ được ưu tiên xuất hiện lại.
</p>
