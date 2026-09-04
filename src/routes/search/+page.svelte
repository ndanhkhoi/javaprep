<script lang="ts">
	import { base } from '$app/paths';
	import QuestionListItem from '$lib/components/QuestionListItem.svelte';
	import { questions, topics } from '$lib/data';
	import { searchQuestions } from '$lib/search';
	import { masteryLevel } from '$lib/srs/sm2';
	import { progress } from '$lib/stores/progress.svelte';

	let query = $state('');
	let topic = $state<string | null>(null);
	/** Debounce để mỗi phím gõ không kéo theo một lần render toàn danh sách. */
	let debounced = $state('');
	let timer: ReturnType<typeof setTimeout>;

	$effect(() => {
		const value = query;
		clearTimeout(timer);
		timer = setTimeout(() => (debounced = value), 150);
		return () => clearTimeout(timer);
	});

	const results = $derived(searchQuestions(questions, { query: debounced, topic }));
</script>

<svelte:head><title>Tìm kiếm — JavaPrep</title></svelte:head>

<header class="mb-3">
	<a href="{base}/" class="text-xs text-ink-muted">← Chủ đề</a>
	<h1 class="mt-1 text-lg font-bold">Tìm câu hỏi</h1>
</header>

<label class="mb-3 block">
	<span class="sr-only">Từ khoá tìm kiếm</span>
	<input
		type="search"
		bind:value={query}
		placeholder="Gõ không dấu cũng được — ví dụ: ke thua"
		autocomplete="off"
		class="min-h-11 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm
		       placeholder:text-ink-muted"
	/>
</label>

<div class="mb-3 flex gap-1.5 overflow-x-auto pb-1">
	<button
		type="button"
		class="min-h-9 shrink-0 rounded-full border px-3 text-xs font-medium
		       {topic === null ? 'border-brand bg-brand text-brand-ink' : 'border-border text-ink-muted'}"
		aria-pressed={topic === null}
		onclick={() => (topic = null)}
	>
		Tất cả
	</button>
	{#each topics as t (t.id)}
		<button
			type="button"
			class="min-h-9 shrink-0 rounded-full border px-3 text-xs font-medium
			       {topic === t.id ? 'border-brand bg-brand text-brand-ink' : 'border-border text-ink-muted'}"
			aria-pressed={topic === t.id}
			onclick={() => (topic = topic === t.id ? null : t.id)}
		>
			{t.icon} {t.name}
		</button>
	{/each}
</div>

<p class="mb-1 text-xs text-ink-muted" role="status" aria-live="polite">
	{results.length} kết quả
</p>

{#if results.length === 0}
	<p class="py-8 text-center text-sm text-ink-muted">
		Không tìm thấy câu nào. Thử từ khoá ngắn hơn.
	</p>
{:else}
	<ul aria-label="Kết quả tìm kiếm">
		{#each results as question (question.id)}
			<li>
				<QuestionListItem {question} level={masteryLevel(progress.cards[question.id])} />
			</li>
		{/each}
	</ul>
{/if}
