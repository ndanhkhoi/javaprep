<script lang="ts">
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
	const state = $derived(
		!locked ? 'idle' : correct ? 'correct' : selected ? 'wrong' : 'idle'
	);
	const classes = $derived(
		{
			idle: 'border-border bg-surface-2',
			correct: 'border-ok bg-ok/10',
			wrong: 'border-bad bg-bad/10'
		}[state]
	);
	const letter = $derived('ABCD'[index] ?? '?');
</script>

<button
	type="button"
	class="flex w-full items-start gap-2.5 rounded-xl border-2 p-3 text-start text-sm
	       leading-snug transition-colors {classes}
	       {locked ? 'cursor-default' : 'hover:border-brand'}"
	aria-pressed={selected}
	disabled={locked}
	onclick={onSelect}
>
	<span
		class="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-md border
		       border-border text-[11px] font-bold"
		aria-hidden="true"
	>
		{letter}
	</span>
	<span class="flex-1">{text}</span>
	{#if state === 'correct'}
		<!-- Icon để phân biệt đúng/sai không chỉ bằng màu (người mù màu vẫn đọc được). -->
		<span class="font-bold text-ok" aria-label="Đáp án đúng">✓</span>
	{:else if state === 'wrong'}
		<span class="font-bold text-bad" aria-label="Đáp án sai">✗</span>
	{/if}
</button>
