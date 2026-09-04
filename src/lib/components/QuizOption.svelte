<script lang="ts">
	import InlineMarkdown from './InlineMarkdown.svelte';
	import Icon from './ui/Icon.svelte';

	let {
		text,
		index,
		selected,
		correct,
		locked,
		onSelect
	}: {
		text: string;
		index: number;
		selected: boolean;
		correct: boolean;
		locked: boolean;
		onSelect: () => void;
	} = $props();

	// Sau khi khoá: đúng luôn xanh; đáp án user chọn mà sai thì đỏ.
	const state = $derived(!locked ? 'idle' : correct ? 'correct' : selected ? 'wrong' : 'muted');

	const SHELL = {
		idle: 'border-border bg-elevated hover:-translate-y-px hover:border-brand hover:shadow-2',
		correct: 'border-ok bg-ok-soft',
		wrong: 'border-bad bg-bad-soft',
		muted: 'border-border bg-surface-2 text-ink-muted'
	} as const;

	const CHIP = {
		idle: 'border-border bg-surface-2 text-ink-muted',
		correct: 'border-transparent bg-ok text-ok-ink',
		wrong: 'border-transparent bg-bad text-bad-ink',
		muted: 'border-border bg-surface-3 text-ink-subtle'
	} as const;

	const letter = $derived('ABCD'[index] ?? '?');
</script>

<!--
	Sau khi trả lời, các lựa chọn dùng `aria-disabled` chứ không phải `disabled`: nút
	`disabled` bị loại khỏi cây accessibility và không focus được nữa, nên người dùng
	screen reader mất luôn khả năng đọc lại các đáp án ngay lúc cần đọc nhất. Chặn
	thao tác thì đã có kiểm tra trong `onSelect`.
-->
<button
	type="button"
	class="flex w-full items-center gap-3 rounded-xl border p-3.5 text-start text-sm leading-snug
	       shadow-1 transition-[border-color,background-color,box-shadow,transform,color]
	       duration-[var(--dur-fast)] {SHELL[state]}
	       {locked ? 'cursor-default' : 'active:scale-[0.99]'}"
	aria-pressed={selected}
	aria-disabled={locked}
	aria-keyshortcuts={locked ? undefined : String(index + 1)}
	onclick={() => !locked && onSelect()}
>
	<span
		class="grid size-7 shrink-0 place-items-center rounded-lg border text-xs font-bold
		       transition-colors duration-[var(--dur-fast)] {CHIP[state]}"
		aria-hidden="true"
	>
		{letter}
	</span>

	<InlineMarkdown source={text} class="min-w-0 flex-1 font-medium" />

	<!-- Đúng/sai được phân biệt bằng cả icon và chữ cho screen reader, không chỉ bằng
	     màu — người mù màu và người không thấy màn hình đều đọc được kết quả. -->
	{#if state === 'correct'}
		<span class="animate-pop shrink-0 text-ok">
			<Icon name="check" size={18} strokeWidth={2.6} />
			<span class="sr-only">Đáp án đúng</span>
		</span>
	{:else if state === 'wrong'}
		<span class="animate-pop shrink-0 text-bad">
			<Icon name="x" size={18} strokeWidth={2.6} />
			<span class="sr-only">Đáp án bạn chọn, sai</span>
		</span>
	{/if}
</button>
