<script lang="ts">
	import type { MasteryBreakdown } from '$lib/stats/mastery';
	import type { Topic } from '$lib/types';

	let {
		rows
	}: { rows: { topic: Topic; mastery: MasteryBreakdown }[] } = $props();

	const segments = [
		{ key: 'mature' as const, label: 'Đã thuộc', fill: 'var(--color-ok)' },
		{ key: 'learning' as const, label: 'Đang học', fill: 'var(--color-warn)' },
		{ key: 'new' as const, label: 'Chưa học', fill: 'var(--color-surface-3)' }
	];

	function widths(m: MasteryBreakdown): { key: string; x: number; w: number; fill: string }[] {
		if (m.total === 0) return [];
		let x = 0;
		return segments.map((s) => {
			const w = (m[s.key] / m.total) * 100;
			const out = { key: s.key, x, w, fill: s.fill };
			x += w;
			return out;
		});
	}
</script>

<div>
	<ul class="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-ink-muted">
		{#each segments as s (s.key)}
			<li class="flex items-center gap-1">
				<span class="h-2 w-2 rounded-sm" style="background: {s.fill}" aria-hidden="true"></span>
				{s.label}
			</li>
		{/each}
	</ul>

	<ul class="space-y-1.5">
		{#each rows as row (row.topic.id)}
			<li>
				<div class="mb-0.5 flex justify-between text-[11px]">
					<span class="truncate">{row.topic.icon} {row.topic.name}</span>
					<span class="tabular-nums text-ink-muted">
						{row.mastery.mature}/{row.mastery.total}
					</span>
				</div>
				<svg
					viewBox="0 0 100 6"
					preserveAspectRatio="none"
					class="h-1.5 w-full overflow-hidden rounded-full"
					role="img"
					aria-label="{row.topic.name}: {row.mastery.mature} đã thuộc, {row.mastery
						.learning} đang học, {row.mastery.new} chưa học trên tổng {row.mastery.total} câu"
				>
					{#each widths(row.mastery) as seg (seg.key)}
						<rect x={seg.x} y="0" width={seg.w} height="6" fill={seg.fill} />
					{/each}
				</svg>
			</li>
		{/each}
	</ul>
</div>
