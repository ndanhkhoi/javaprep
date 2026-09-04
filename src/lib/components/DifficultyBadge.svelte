<script lang="ts">
	import type { Difficulty } from '$lib/types';

	let { difficulty }: { difficulty: Difficulty } = $props();

	const meta: Record<Difficulty, { label: string; classes: string }> = {
		easy: { label: 'Dễ', classes: 'bg-ok/15 text-ok' },
		medium: { label: 'Vừa', classes: 'bg-warn/15 text-warn' },
		hard: { label: 'Khó', classes: 'bg-bad/15 text-bad' }
	};
</script>

<span class="rounded-md px-1.5 py-0.5 text-[11px] font-semibold {meta[difficulty].classes}">
	{meta[difficulty].label}
</span>
