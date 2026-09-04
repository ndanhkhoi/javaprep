<script lang="ts">
	import { formatInterval } from '$lib/srs/date';
	import { previewInterval } from '$lib/srs/sm2';
	import type { CardState, Grade } from '$lib/types';

	let { card, onGrade }: { card: CardState; onGrade: (grade: Grade) => void } = $props();

	const BUTTONS: { grade: Grade; label: string; key: string; classes: string }[] = [
		{
			grade: 0,
			label: 'Quên',
			key: '1',
			classes: 'border-bad/40 bg-bad-soft text-bad hover:border-bad'
		},
		{
			grade: 3,
			label: 'Khó',
			key: '2',
			classes: 'border-warn/40 bg-warn-soft text-warn hover:border-warn'
		},
		{
			grade: 4,
			label: 'Được',
			key: '3',
			classes: 'border-brand/40 bg-brand-soft text-brand hover:border-brand'
		},
		{
			grade: 5,
			label: 'Dễ',
			key: '4',
			classes: 'border-ok/40 bg-ok-soft text-ok hover:border-ok'
		}
	];

	// Hiện trước khoảng ôn lại để user chấm có thông tin, không phải chấm mò.
	const previews = $derived(
		Object.fromEntries(
			BUTTONS.map((b) => [b.grade, formatInterval(previewInterval(card, b.grade))])
		)
	);
</script>

<div class="grid grid-cols-4 gap-2" role="group" aria-label="Tự chấm mức độ nhớ">
	{#each BUTTONS as button (button.grade)}
		<button
			type="button"
			class="flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-1
			       transition-[border-color,transform,background-color] duration-[var(--dur-fast)]
			       active:scale-[0.96] {button.classes}"
			onclick={() => onGrade(button.grade)}
		>
			<span class="text-[0.8125rem] font-bold leading-none">{button.label}</span>
			<span class="text-2xs font-medium leading-none tabular-nums opacity-80">
				{previews[button.grade]}
			</span>
			<kbd
				class="mt-0.5 hidden rounded border border-current px-1 text-[0.5625rem] font-semibold
				       leading-[0.95rem] opacity-70 sm:block"
			>
				{button.key}
			</kbd>
		</button>
	{/each}
</div>
