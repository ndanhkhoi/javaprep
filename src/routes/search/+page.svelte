<script lang="ts">
	import { base } from '$app/paths';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import QuestionListItem from '$lib/components/QuestionListItem.svelte';
	import TopicFilter from '$lib/components/TopicFilter.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import { questions } from '$lib/data';
	import { searchQuestions } from '$lib/search';
	import { masteryLevel } from '$lib/srs/sm2';
	import { progress } from '$lib/stores/progress.svelte';

	let query = $state(page.url.searchParams.get('q') ?? '');
	let topic = $state<string | null>(page.url.searchParams.get('topic'));
	/** Debounce để mỗi phím gõ không kéo theo một lần render toàn danh sách. */
	let debounced = $state(page.url.searchParams.get('q') ?? '');
	let timer: ReturnType<typeof setTimeout>;
	let input = $state<HTMLInputElement | null>(null);

	$effect(() => {
		const value = query;
		clearTimeout(timer);
		timer = setTimeout(() => (debounced = value), 150);
		return () => clearTimeout(timer);
	});

	// Từ khoá và bộ lọc nằm trong URL: chia sẻ được một lần tìm, và quay lại từ trang
	// câu hỏi thì kết quả cũ còn nguyên thay vì phải gõ lại.
	$effect(() => {
		const url = new URL(page.url);
		if (debounced) url.searchParams.set('q', debounced);
		else url.searchParams.delete('q');
		if (topic) url.searchParams.set('topic', topic);
		else url.searchParams.delete('topic');
		if (url.href !== page.url.href) replaceState(url, page.state);
	});

	// Mở trang là gõ được ngay — đây là trang chỉ có một việc để làm. Chỉ tự focus khi
	// có con trỏ chuột: trên điện thoại việc này bật bàn phím ảo và ăn mất nửa màn hình
	// trước khi người dùng kịp quyết định muốn gõ hay muốn lọc theo chủ đề.
	$effect(() => {
		if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) input?.focus();
	});

	const results = $derived(searchQuestions(questions, { query: debounced, topic }));
</script>

<svelte:head><title>Tìm kiếm — JavaPrep</title></svelte:head>

<div class="mx-auto max-w-4xl">
	<PageHeader title="Tìm câu hỏi" backHref="{base}/" backLabel="Chủ đề" />

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
			autocapitalize="off"
			spellcheck="false"
			enterkeyhint="search"
			class="surface-card min-h-13 w-full rounded-xl ps-11 pe-12 text-sm font-medium
			       placeholder:font-normal placeholder:text-ink-subtle
			       [&::-webkit-search-cancel-button]:hidden"
		/>
		{#if query}
			<button
				type="button"
				class="absolute inset-y-0 end-1.5 my-auto grid size-11 place-items-center rounded-lg
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

	<div class="mb-4">
		<TopicFilter value={topic} onSelect={(next) => (topic = next)} label="Lọc kết quả theo chủ đề" />
	</div>

	<p
		class="mb-2.5 text-2xs font-semibold tabular-nums text-ink-muted"
		role="status"
		aria-live="polite"
	>
		{results.length} kết quả
	</p>

	{#if results.length === 0}
		<div class="surface-card rounded-xl py-14 text-center">
			<span
				class="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-surface-3 text-ink-muted"
			>
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
