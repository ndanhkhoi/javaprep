<script lang="ts">
	import type { Difficulty } from '$lib/types';

	let { difficulty, size = 'md' }: { difficulty: Difficulty; size?: 'sm' | 'md' } = $props();

	const META: Record<Difficulty, { label: string; classes: string; dot: string }> = {
		easy: { label: 'Dễ', classes: 'bg-ok-soft text-ok', dot: 'bg-ok-solid' },
		medium: { label: 'Vừa', classes: 'bg-warn-soft text-warn', dot: 'bg-warn-solid' },
		hard: { label: 'Khó', classes: 'bg-bad-soft text-bad', dot: 'bg-bad-solid' }
	};
</script>

<span
	class="inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold
	       {META[difficulty].classes}
	       {size === 'sm' ? 'px-2 py-0.5 text-[0.625rem]' : 'px-2.5 py-1 text-2xs'}"
>
	<span class="size-1.5 rounded-full {META[difficulty].dot}" aria-hidden="true"></span>
	{META[difficulty].label}
</span>
