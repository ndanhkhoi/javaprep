<script lang="ts">
	import { formatInterval } from '$lib/srs/date';
	import { previewInterval } from '$lib/srs/sm2';
	import type { CardState, Grade } from '$lib/types';

	let { card, onGrade }: { card: CardState; onGrade: (grade: Grade) => void } = $props();

	const buttons: { grade: Grade; label: string; key: string; classes: string }[] = [
		{ grade: 0, label: 'Quên', key: '1', classes: 'border-bad text-bad' },
		{ grade: 3, label: 'Khó', key: '2', classes: 'border-warn text-warn' },
		{ grade: 4, label: 'Được', key: '3', classes: 'border-brand text-brand' },
		{ grade: 5, label: 'Dễ', key: '4', classes: 'border-ok text-ok' }
	];

	// Hiện trước khoảng ôn lại để user chấm có thông tin, không phải chấm mò.
	const previews = $derived(
		Object.fromEntries(buttons.map((b) => [b.grade, formatInterval(previewInterval(card, b.grade))]))
	);
</script>

<div class="grid grid-cols-4 gap-1.5">
	{#each buttons as button (button.grade)}
		<button
			type="button"
			class="flex min-h-14 flex-col items-center justify-center rounded-xl border-2 bg-surface-2
			       px-1 text-xs font-semibold {button.classes}"
			onclick={() => onGrade(button.grade)}
		>
			{button.label}
			<span class="mt-0.5 text-[10px] font-normal tabular-nums opacity-80">
				{previews[button.grade]}
			</span>
		</button>
	{/each}
</div>
<p class="mt-2 text-center text-[11px] text-ink-muted">Phím tắt: 1 Quên · 2 Khó · 3 Được · 4 Dễ</p>
