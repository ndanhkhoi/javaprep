<script lang="ts">
	import { base } from '$app/paths';
	import DifficultyBadge from '$lib/components/DifficultyBadge.svelte';
	import InlineMarkdown from '$lib/components/InlineMarkdown.svelte';
	import MarkdownBody from '$lib/components/MarkdownBody.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { topicById } from '$lib/data';
	import { accentStyle } from '$lib/theme/topic-accent';
	import { topicIcon } from '$lib/theme/topic-icon';
	import type { Question } from '$lib/types';

	let {
		question,
		revealed,
		onReveal
	}: { question: Question; revealed: boolean; onReveal: () => void } = $props();

	const topic = $derived(topicById(question.topic));

	let shell = $state<HTMLDivElement | null>(null);
	let front = $state<HTMLButtonElement | null>(null);
	let back = $state<HTMLDivElement | null>(null);

	/**
	 * Lật thẻ phải kéo theo cả điểm focus, không chỉ phần hình.
	 *
	 * Người dùng screen reader bấm nút "Hiện đáp án" rồi ở lại trên chính nút đó — nút
	 * vừa bị `aria-hidden` che đi, nên họ không được đọc gì cả và mặt sau coi như không
	 * tồn tại. Chuyển focus sang mặt đang hiện thì đáp án được đọc ngay, và Tab tiếp
	 * theo rơi đúng vào bộ nút chấm điểm.
	 *
	 * Chỉ giành focus khi focus đang nằm trong thẻ (hoặc chưa ở đâu cả): nếu người dùng
	 * đã Tab sang chỗ khác thì việc kéo focus về là hành vi cướp quyền điều khiển.
	 */
	$effect(() => {
		const target = revealed ? back : front;
		if (!target || !shell) return;

		const active = document.activeElement;
		const inside = active === document.body || active === null || shell.contains(active);
		if (inside && active !== target) target.focus({ preventScroll: true });
	});
</script>

<!--
	Lật 3D thật, không phải hiện/ẩn. Làm được vì hai mặt cân nhau về lượng chữ:
	`question` dài tối đa 133 ký tự, `answerShort` 164–240 ký tự. Hai mặt xếp
	tuyệt đối trong cùng một khung có chiều cao tối thiểu cố định nên không có cú
	nhảy layout khi lật.
-->
<div bind:this={shell} class="accent perspective" style={accentStyle(question.topic)}>
	<div class="flip min-h-[18rem] sm:min-h-[19rem]" class:is-flipped={revealed}>
		<button
			bind:this={front}
			type="button"
			class="face surface-panel flex flex-col rounded-2xl p-5 text-start sm:p-6"
			aria-hidden={revealed}
			tabindex={revealed ? -1 : 0}
			onclick={onReveal}
		>
			<div class="flex items-center gap-2">
				<DifficultyBadge difficulty={question.difficulty} />
				{#if topic}
					<span
						class="flex min-w-0 items-center gap-1.5 text-2xs font-semibold text-[var(--accent)]"
					>
						<Icon name={topicIcon(topic.id)} size={13} strokeWidth={2} />
						<span class="truncate">{topic.name}</span>
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
			<span class="mt-2 flex items-center justify-center gap-1.5 text-2xs text-ink-muted">
				<Icon name="keyboard" size={13} />
				hoặc nhấn phím cách
			</span>
		</button>

		<div
			bind:this={back}
			class="face back surface-panel flex flex-col rounded-2xl p-5 sm:p-6"
			aria-hidden={!revealed}
			tabindex="-1"
		>
			<p class="eyebrow text-[var(--accent)]">Đáp án</p>
			<InlineMarkdown
				source={question.question}
				class="mt-1.5 block text-xs font-medium leading-snug text-ink-muted"
			/>

			<div class="mt-3 border-t border-border pt-3">
				<MarkdownBody source={question.answerShort} />
			</div>

			<a
				href="{base}/q/{question.id}"
				class="mt-3 inline-flex min-h-11 items-center gap-1.5 self-start text-xs font-semibold
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

	/* Mặt sau nhận focus bằng script nên không cần ring của trình duyệt — nội dung
	   được đọc lên là đủ, còn viền quanh cả thẻ thì gây hiểu nhầm là chỗ bấm được. */
	.face.back:focus-visible {
		outline: none;
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
