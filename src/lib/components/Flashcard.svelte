<script lang="ts">
	import { base } from '$app/paths';
	import DifficultyBadge from '$lib/components/DifficultyBadge.svelte';
	import MarkdownBody from '$lib/components/MarkdownBody.svelte';
	import type { Question } from '$lib/types';

	let {
		question,
		revealed,
		onReveal
	}: { question: Question; revealed: boolean; onReveal: () => void } = $props();
</script>

<div class="rounded-2xl border border-border bg-surface-2 p-4">
	<div class="mb-2 flex items-center gap-2">
		<DifficultyBadge difficulty={question.difficulty} />
	</div>
	<p class="text-base font-semibold leading-snug">{question.question}</p>

	{#if revealed}
		<div class="mt-4 border-t border-border pt-3">
			<h3 class="mb-1 text-[11px] font-semibold uppercase tracking-wide text-brand">Đáp án</h3>
			<MarkdownBody source={question.answerShort} />
			<a
				href="{base}/q/{question.id}"
				class="mt-2 inline-block text-xs font-medium text-brand underline"
			>
				Xem giải thích đầy đủ →
			</a>
		</div>
	{:else}
		<button
			type="button"
			class="mt-5 min-h-12 w-full rounded-xl bg-brand text-sm font-semibold text-brand-ink"
			onclick={onReveal}
		>
			Hiện đáp án
		</button>
		<p class="mt-2 text-center text-[11px] text-ink-muted">Hoặc nhấn phím cách</p>
	{/if}
</div>
