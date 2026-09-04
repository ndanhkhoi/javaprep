<script lang="ts">
	import { base } from '$app/paths';
	import QuestionListItem from '$lib/components/QuestionListItem.svelte';
	import FilterChip from '$lib/components/ui/FilterChip.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { questions, topics } from '$lib/data';
	import { searchQuestions } from '$lib/search';
	import { masteryLevel } from '$lib/srs/sm2';
	import { progress } from '$lib/stores/progress.svelte';

	let query = $state('');
	let topic = $state<string | null>(null);
	/** Debounce để mỗi phím gõ không kéo theo một lần render toàn danh sách. */
	let debounced = $state('');
	let timer: ReturnType<typeof setTimeout>;
	let input = $state<HTMLInputElement | null>(null);

	$effect(() => {
		const value = query;
		clearTimeout(timer);
		timer = setTimeout(() => (debounced = value), 150);
		return () => clearTimeout(timer);
	});

	// Mở trang là gõ được ngay — đây là trang chỉ có một việc để làm.
	$effect(() => {
		input?.focus();
	});

	const results = $derived(searchQuestions(questions, { query: debounced, topic }));
</script>

<svelte:head><title>Tìm kiếm — JavaPrep</title></svelte:head>

<div class="mx-auto max-w-4xl">
	<a
		href="{base}/"
		class="mb-3 inline-flex min-h-8 items-center gap-1 text-xs font-medium text-ink-muted
		       transition-colors hover:text-ink"
	>
		<Icon name="chevronLeft" size={14} />
		Chủ đề
	</a>

	<h1 class="mb-4 text-title font-extrabold">Tìm câu hỏi</h1>

	<label class="relative mb-4 block">
		<span class="sr-only">Từ khoá tìm kiếm</span>
		<span
			class="pointer-events-none absolute inset-y-0 start-3.5 grid place-items-center
			       text-ink-subtle"
			aria-hidden="true"
		>
			<Icon name="search" size={18} />
		</span>
		<input
			bind:this={input}
			type="search"
			bind:value={query}
			placeholder="Gõ không dấu cũng được — ví dụ: ke thua"
			autocomplete="off"
			class="surface-card min-h-13 w-full rounded-xl ps-11 pe-11 text-sm font-medium
			       placeholder:font-normal placeholder:text-ink-subtle"
		/>
		{#if query}
			<button
				type="button"
				class="absolute inset-y-0 end-2 my-auto grid size-8 place-items-center rounded-lg
				       text-ink-muted transition-colors hover:bg-surface-3 hover:text-ink"
				aria-label="Xoá từ khoá"
				onclick={() => {
					query = '';
					input?.focus();
				}}
			>
				<Icon name="x" size={16} strokeWidth={2.2} />
			</button>
		{/if}
	</label>

	<div class="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 md:-mx-8 md:px-8">
		<FilterChip active={topic === null} onToggle={() => (topic = null)}>Tất cả</FilterChip>
		{#each topics as t (t.id)}
			<FilterChip active={topic === t.id} onToggle={() => (topic = topic === t.id ? null : t.id)}>
				<span aria-hidden="true">{t.icon}</span>
				{t.name}
			</FilterChip>
		{/each}
	</div>

	<p class="mb-2.5 text-2xs font-semibold tabular-nums text-ink-muted" role="status" aria-live="polite">
		{results.length} kết quả
	</p>

	{#if results.length === 0}
		<div class="surface-card rounded-xl py-14 text-center">
			<span class="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-surface-3 text-ink-subtle">
				<Icon name="search" size={22} />
			</span>
			<p class="text-sm font-medium">Không tìm thấy câu nào</p>
			<p class="mt-1 text-xs text-ink-muted">Thử từ khoá ngắn hơn hoặc bỏ lọc chủ đề.</p>
		</div>
	{:else}
		<ul class="space-y-2" aria-label="Kết quả tìm kiếm">
			{#each results as question (question.id)}
				<li>
					<QuestionListItem
						{question}
						level={masteryLevel(progress.cards[question.id])}
						showTopic
					/>
				</li>
			{/each}
		</ul>
	{/if}
</div>
