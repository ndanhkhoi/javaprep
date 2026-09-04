<script lang="ts">
	import { base } from '$app/paths';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import TopicFilter from '$lib/components/TopicFilter.svelte';
	import { questions, topics } from '$lib/data';

	// Cùng lý do như trang ôn thẻ: cấu hình nằm trong URL để link được và để nút back
	// từ lượt quiz trả về đúng lựa chọn cũ.
	const COUNT_CHOICES = [10, 20, 0];
	/** `Number(null)` là 0 — mà 0 lại là một lựa chọn hợp lệ ("Tất cả"), nên phải kiểm
	    sự tồn tại của tham số trước khi đổi kiểu. */
	const countParam = page.url.searchParams.get('count');
	const countFromUrl = countParam === null ? Number.NaN : Number(countParam);

	let topic = $state<string | null>(page.url.searchParams.get('topic'));
	let count = $state(COUNT_CHOICES.includes(countFromUrl) ? countFromUrl : 10);

	function syncUrl(): void {
		const url = new URL(page.url);
		if (topic) url.searchParams.set('topic', topic);
		else url.searchParams.delete('topic');
		url.searchParams.set('count', String(count));
		replaceState(url, page.state);
	}

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
	const scopeLabel = $derived(topics.find((t) => t.id === topic)?.name ?? 'Tất cả chủ đề');
</script>

<svelte:head><title>Quiz — JavaPrep</title></svelte:head>

<div class="mx-auto max-w-3xl">
	<PageHeader
		eyebrow="Trắc nghiệm"
		title="Quiz 4 lựa chọn"
		description="Phản hồi ngay sau mỗi câu. Quiz đo khả năng nhận diện nên không ảnh hưởng tới lịch ôn thẻ — câu bạn hay sai sẽ được ưu tiên xuất hiện lại."
	/>

	<section class="mb-6">
		<SectionHeading title="Phạm vi" hint={scopeLabel} />
		<TopicFilter
			value={topic}
			onSelect={(next) => {
				topic = next;
				syncUrl();
			}}
			label="Phạm vi quiz"
		/>
	</section>

	<section class="mb-6">
		<SectionHeading title="Số câu" />
		<SegmentedControl
			label="Số câu trong lượt quiz"
			options={countOptions}
			value={count}
			onSelect={(next) => {
				count = next;
				syncUrl();
			}}
		/>
	</section>

	<Button {href} size="lg" full>
		<Icon name="quiz" size={18} strokeWidth={2} />
		Bắt đầu {effective} câu
	</Button>
</div>
