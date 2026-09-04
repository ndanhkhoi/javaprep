<script lang="ts">
	import { base } from '$app/paths';
	import { questions, topics } from '$lib/data';
	import { buildSession, countDue } from '$lib/srs/queue';
	import { progress } from '$lib/stores/progress.svelte';

	let topic = $state<string | null>(null);

	const dueTotal = $derived(progress.dueCount);
	const session = $derived(
		buildSession({
			questions,
			cards: progress.cards,
			today: progress.today,
			dailyNewLimit: progress.settings.dailyNewLimit,
			topicFilter: topic
		})
	);
	const dueInScope = $derived(
		topic
			? countDue(
					progress.cards,
					questions.filter((q) => q.topic === topic),
					progress.today
				)
			: dueTotal
	);
	const newInScope = $derived(session.length - dueInScope);
	const href = $derived(topic ? `${base}/study/session?topic=${topic}` : `${base}/study/session`);
</script>

<svelte:head><title>Ôn thẻ — JavaPrep</title></svelte:head>

<header class="mb-4">
	<h1 class="text-lg font-bold">Ôn thẻ</h1>
	<p class="text-sm text-ink-muted">Lật thẻ, tự chấm, lịch ôn tự điều chỉnh theo SM-2.</p>
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

<div class="mb-4 rounded-xl border border-border bg-surface-2 p-3 text-sm" role="status">
	{#if session.length === 0}
		<p class="font-medium">Hôm nay không còn thẻ nào trong phạm vi này 🎉</p>
		<p class="mt-1 text-xs text-ink-muted">
			Tăng giới hạn thẻ mới mỗi ngày trong
			<a href="{base}/settings" class="underline">Cài đặt</a> nếu muốn học thêm.
		</p>
	{:else}
		<p class="font-medium tabular-nums">{session.length} thẻ trong phiên này</p>
		<p class="mt-1 text-xs text-ink-muted tabular-nums">
			{dueInScope} thẻ đến hạn · {newInScope} thẻ mới
		</p>
	{/if}
</div>

{#if session.length > 0}
	<a
		href={href}
		class="flex min-h-12 items-center justify-center rounded-xl bg-brand text-sm font-semibold
		       text-brand-ink"
	>
		Bắt đầu ôn
	</a>
{/if}
