<script lang="ts">
	import { base } from '$app/paths';
	import CodeBlock from '$lib/components/CodeBlock.svelte';
	import DifficultyBadge from '$lib/components/DifficultyBadge.svelte';
	import InlineMarkdown from '$lib/components/InlineMarkdown.svelte';
	import MarkdownBody from '$lib/components/MarkdownBody.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { formatInterval } from '$lib/srs/date';
	import { masteryLevel } from '$lib/srs/sm2';
	import { stripInlineMarkdown } from '$lib/markdown';
	import { progress } from '$lib/stores/progress.svelte';
	import { accentStyle } from '$lib/theme/topic-accent';

	let { data } = $props();

	const card = $derived(progress.cards[data.question.id]);
	const level = $derived(masteryLevel(card));
	const STATUS = {
		new: { label: 'Chưa học', classes: 'bg-surface-3 text-ink-muted' },
		learning: { label: 'Đang học', classes: 'bg-warn-soft text-warn' },
		mature: { label: 'Đã thuộc', classes: 'bg-ok-soft text-ok' }
	} as const;
</script>

<svelte:head>
	<title>{stripInlineMarkdown(data.question.question)} — JavaPrep</title>
</svelte:head>

<article class="accent mx-auto max-w-3xl" style={accentStyle(data.question.topic)}>
	<header class="mb-6">
		{#if data.topic}
			<a
				href="{base}/topic/{data.topic.id}"
				class="mb-3 inline-flex min-h-8 items-center gap-1.5 text-xs font-semibold
				       text-[var(--accent)] transition-opacity hover:opacity-80"
			>
				<Icon name="chevronLeft" size={14} />
				<span aria-hidden="true">{data.topic.icon}</span>
				{data.topic.name}
			</a>
		{/if}

		<h1 class="text-title font-extrabold">
			<InlineMarkdown source={data.question.question} />
		</h1>

		<div class="mt-3 flex flex-wrap items-center gap-2">
			<DifficultyBadge difficulty={data.question.difficulty} />
			<span
				class="rounded-full px-2.5 py-1 text-2xs font-semibold {STATUS[level].classes}"
			>
				{STATUS[level].label}
			</span>
			{#if card && card.due}
				<span
					class="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-2xs
					       font-medium text-ink-muted"
				>
					<Icon name="clock" size={12} />
					ôn lại sau {formatInterval(card.interval)}
				</span>
			{/if}
		</div>
	</header>

	<!-- Đáp án ngắn là thứ người dùng tới đây để đọc, nên nó là khối được nhấn mạnh nhất. -->
	<section
		class="mb-6 rounded-2xl border border-[var(--accent-line)] bg-[var(--accent-soft)] p-4 sm:p-5"
		aria-labelledby="short-answer-heading"
	>
		<h2
			id="short-answer-heading"
			class="mb-1.5 flex items-center gap-1.5 text-2xs font-bold uppercase tracking-[0.13em]
			       text-[var(--accent)]"
		>
			<Icon name="bolt" size={13} strokeWidth={2.2} />
			Đáp án ngắn
		</h2>
		<MarkdownBody source={data.question.answerShort} />
	</section>

	{#if data.detail?.code}
		<section class="mb-6" aria-labelledby="code-heading">
			<h2
				id="code-heading"
				class="mb-2.5 text-2xs font-bold uppercase tracking-[0.13em] text-ink-muted"
			>
				Ví dụ mã nguồn
			</h2>
			<CodeBlock code={data.detail.code} />
		</section>
	{/if}

	{#if data.detail}
		<section class="mb-6" aria-labelledby="long-answer-heading">
			<h2
				id="long-answer-heading"
				class="mb-2.5 text-2xs font-bold uppercase tracking-[0.13em] text-ink-muted"
			>
				Giải thích đầy đủ
			</h2>
			<MarkdownBody source={data.detail.answerLong} />
		</section>
	{/if}

	<ul class="mb-8 flex flex-wrap gap-2" aria-label="Từ khoá">
		{#each data.question.tags as tag (tag)}
			<li
				class="rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-2xs
				       text-ink-muted"
			>
				#{tag}
			</li>
		{/each}
	</ul>

	<nav class="grid gap-2.5 border-t border-border pt-5 sm:grid-cols-2" aria-label="Câu trước và câu sau">
		{#if data.prev}
			<a
				href="{base}/q/{data.prev.id}"
				class="surface-card group flex flex-col gap-1 rounded-xl p-3.5 transition-[border-color,transform]
				       duration-[var(--dur-fast)] hover:-translate-y-px hover:border-border-strong"
			>
				<span class="flex items-center gap-1 text-2xs font-semibold text-ink-muted">
					<Icon name="arrowLeft" size={13} />
					Câu trước
				</span>
				<InlineMarkdown
					source={data.prev.question}
					class="line-clamp-2 block text-xs font-medium leading-snug"
				/>
			</a>
		{:else}
			<span class="hidden sm:block"></span>
		{/if}

		{#if data.next}
			<a
				href="{base}/q/{data.next.id}"
				class="surface-card group flex flex-col items-end gap-1 rounded-xl p-3.5 text-end
				       transition-[border-color,transform] duration-[var(--dur-fast)]
				       hover:-translate-y-px hover:border-border-strong"
			>
				<span class="flex items-center gap-1 text-2xs font-semibold text-ink-muted">
					Câu sau
					<Icon name="arrowRight" size={13} />
				</span>
				<InlineMarkdown
					source={data.next.question}
					class="line-clamp-2 block text-xs font-medium leading-snug"
				/>
			</a>
		{/if}
	</nav>
</article>
