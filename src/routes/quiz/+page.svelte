<script lang="ts">
	import { base } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';
	import FilterChip from '$lib/components/ui/FilterChip.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import { questions, topics } from '$lib/data';

	let topic = $state<string | null>(null);
	let count = $state(10);

	const available = $derived(
		topic ? questions.filter((q) => q.topic === topic).length : questions.length
	);
	const effective = $derived(count === 0 ? available : Math.min(count, available));
	const href = $derived(`${base}/quiz/play?count=${effective}${topic ? `&topic=${topic}` : ''}`);
	const countOptions = $derived([
		{ value: 10, label: '10' },
		{ value: 20, label: '20' },
		{ value: 0, label: `Tất cả (${available})` }
	]);
</script>

<svelte:head><title>Quiz — JavaPrep</title></svelte:head>

<div class="mx-auto max-w-3xl">
	<PageHeader
		eyebrow="Trắc nghiệm"
		title="Quiz 4 lựa chọn"
		description="Phản hồi ngay sau mỗi câu. Quiz đo khả năng nhận diện nên không ảnh hưởng tới lịch ôn thẻ — câu bạn hay sai sẽ được ưu tiên xuất hiện lại."
	/>

	<section class="mb-6">
		<h2 class="mb-2.5 text-2xs font-bold uppercase tracking-[0.13em] text-ink-muted">Phạm vi</h2>
		<div class="flex flex-wrap gap-2">
			<FilterChip active={topic === null} onToggle={() => (topic = null)}>Tất cả</FilterChip>
			{#each topics as t (t.id)}
				<FilterChip active={topic === t.id} onToggle={() => (topic = topic === t.id ? null : t.id)}>
					<span aria-hidden="true">{t.icon}</span>
					{t.name}
				</FilterChip>
			{/each}
		</div>
	</section>

	<section class="mb-6">
		<h2 class="mb-2.5 text-2xs font-bold uppercase tracking-[0.13em] text-ink-muted">Số câu</h2>
		<SegmentedControl
			label="Số câu trong lượt quiz"
			options={countOptions}
			value={count}
			onSelect={(next) => (count = next)}
		/>
	</section>

	<Button {href} size="lg" full>
		<Icon name="quiz" size={18} strokeWidth={2} />
		Bắt đầu {effective} câu
	</Button>
</div>
