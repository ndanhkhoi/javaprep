<script lang="ts">
	import { base } from '$app/paths';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import DifficultyBadge from '$lib/components/DifficultyBadge.svelte';
	import MarkdownBody from '$lib/components/MarkdownBody.svelte';
	import { formatInterval } from '$lib/srs/date';
	import { masteryLevel } from '$lib/srs/sm2';
	import { progress } from '$lib/stores/progress.svelte';

	let { data } = $props();

	const card = $derived(progress.cards[data.question.id]);
	const level = $derived(masteryLevel(card));
	const statusLabel = $derived(
		{ new: 'Chưa học', learning: 'Đang học', mature: 'Đã thuộc' }[level]
	);
</script>

<svelte:head>
	<title>{data.question.question} — JavaPrep</title>
</svelte:head>

<article>
	<header class="mb-3">
		{#if data.topic}
			<a href="{base}/topic/{data.topic.id}" class="text-xs text-ink-muted">← {data.topic.name}</a>
		{/if}
		<div class="mt-2 flex items-center gap-2">
			<DifficultyBadge difficulty={data.question.difficulty} />
			<span class="text-[11px] text-ink-muted">{statusLabel}</span>
			{#if card && card.due}
				<span class="text-[11px] text-ink-muted">· ôn lại sau {formatInterval(card.interval)}</span>
			{/if}
		</div>
		<h1 class="mt-2 text-lg font-bold leading-snug">{data.question.question}</h1>
	</header>

	<section class="mb-4 rounded-xl border border-brand/40 bg-brand/5 p-3" aria-label="Đáp án ngắn">
		<h2 class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand">Đáp án ngắn</h2>
		<MarkdownBody source={data.question.answerShort} />
	</section>

	{#if data.question.code}
		<section class="mb-4" aria-label="Ví dụ mã nguồn">
			<CodeBlock code={data.question.code} />
		</section>
	{/if}

	<section class="mb-4" aria-label="Giải thích đầy đủ">
		<h2 class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
			Giải thích đầy đủ
		</h2>
		<MarkdownBody source={data.question.answerLong} />
	</section>

	<ul class="mb-6 flex flex-wrap gap-1.5" aria-label="Từ khoá">
		{#each data.question.tags as tag (tag)}
			<li class="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] text-ink-muted">#{tag}</li>
		{/each}
	</ul>

	<nav class="flex gap-2 border-t border-border pt-3 text-xs" aria-label="Câu trước và câu sau">
		{#if data.prev}
			<a href="{base}/q/{data.prev.id}" class="flex-1 rounded-lg border border-border p-2 leading-snug">
				<span class="block text-ink-muted">← Câu trước</span>
				<span class="line-clamp-2">{data.prev.question}</span>
			</a>
		{:else}
			<span class="flex-1"></span>
		{/if}
		{#if data.next}
			<a
				href="{base}/q/{data.next.id}"
				class="flex-1 rounded-lg border border-border p-2 text-end leading-snug"
			>
				<span class="block text-ink-muted">Câu sau →</span>
				<span class="line-clamp-2">{data.next.question}</span>
			</a>
		{:else}
			<span class="flex-1"></span>
		{/if}
	</nav>
</article>
