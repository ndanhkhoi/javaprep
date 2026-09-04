<script lang="ts">
	import { base } from '$app/paths';
	import DifficultyBadge from '$lib/components/DifficultyBadge.svelte';
	import InlineMarkdown from '$lib/components/InlineMarkdown.svelte';
	import MarkdownBody from '$lib/components/MarkdownBody.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { topicById } from '$lib/data';
	import { accentStyle } from '$lib/theme/topic-accent';
	import type { Question } from '$lib/types';

	let {
		question,
		revealed,
		onReveal
	}: { question: Question; revealed: boolean; onReveal: () => void } = $props();

	const topic = $derived(topicById(question.topic));
</script>

<!--
	Lật 3D thật, không phải hiện/ẩn. Làm được vì hai mặt cân nhau về lượng chữ:
	`question` dài tối đa 133 ký tự, `answerShort` 164–240 ký tự. Hai mặt xếp
	tuyệt đối trong cùng một khung có chiều cao tối thiểu cố định nên không có cú
	nhảy layout khi lật.
-->
<div class="accent perspective" style={accentStyle(question.topic)}>
	<div class="flip min-h-[18rem] sm:min-h-[19rem]" class:is-flipped={revealed}>
		<button
			type="button"
			class="face surface-panel flex flex-col rounded-2xl p-5 text-start sm:p-6"
			aria-hidden={revealed}
			tabindex={revealed ? -1 : 0}
			onclick={onReveal}
		>
			<div class="flex items-center gap-2">
				<DifficultyBadge difficulty={question.difficulty} />
				{#if topic}
					<span class="truncate text-2xs font-semibold text-[var(--accent)]">
						{topic.icon} {topic.name}
					</span>
				{/if}
			</div>

			<InlineMarkdown
				source={question.question}
				class="my-auto block py-6 text-heading font-bold leading-snug"
			/>

			<span
				class="mt-auto flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand
				       text-sm font-semibold text-brand-ink shadow-glow"
			>
				<Icon name="refresh" size={17} strokeWidth={2} />
				Hiện đáp án
			</span>
			<span class="mt-2 flex items-center justify-center gap-1.5 text-2xs text-ink-subtle">
				<Icon name="keyboard" size={13} />
				hoặc nhấn phím cách
			</span>
		</button>

		<div
			class="face back surface-panel flex flex-col rounded-2xl p-5 sm:p-6"
			aria-hidden={!revealed}
		>
			<p class="text-2xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Đáp án</p>
			<InlineMarkdown
				source={question.question}
				class="mt-1.5 block text-xs font-medium leading-snug text-ink-muted"
			/>

			<div class="mt-3 border-t border-border pt-3">
				<MarkdownBody source={question.answerShort} />
			</div>

			<a
				href="{base}/q/{question.id}"
				class="mt-3 inline-flex min-h-9 items-center gap-1.5 self-start text-xs font-semibold
				       text-brand"
				tabindex={revealed ? 0 : -1}
			>
				Xem giải thích đầy đủ
				<Icon name="arrowRight" size={14} strokeWidth={2} />
			</a>
		</div>
	</div>
</div>

<style>
	.perspective {
		perspective: 1400px;
	}

	.flip {
		position: relative;
		transform-style: preserve-3d;
		transition: transform 620ms var(--ease-out-quart);
	}

	.flip.is-flipped {
		transform: rotateY(180deg);
	}

	.face {
		position: absolute;
		inset: 0;
		width: 100%;
		overflow-x: hidden;
		overflow-y: auto;
		backface-visibility: hidden;
		-webkit-backface-visibility: hidden;
	}

	.face.back {
		transform: rotateY(180deg);
	}

	/* Mặt đang úp không được nhận chuột: `backface-visibility` chỉ ẩn phần vẽ. */
	.flip:not(.is-flipped) .face.back,
	.flip.is-flipped .face:not(.back) {
		pointer-events: none;
	}

	/* Không lật thì đổi mặt bằng mờ dần — vẫn rõ là hai mặt của một thẻ. */
	@media (prefers-reduced-motion: reduce) {
		.flip,
		.flip.is-flipped {
			transform: none;
		}

		.face {
			transition: opacity 0.01ms;
		}

		.face.back {
			transform: none;
			opacity: 0;
		}

		.flip.is-flipped .face:not(.back) {
			opacity: 0;
		}

		.flip.is-flipped .face.back {
			opacity: 1;
		}
	}
</style>
