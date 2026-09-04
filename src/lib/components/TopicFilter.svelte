<script lang="ts">
	import FilterChip from './ui/FilterChip.svelte';
	import Icon from './ui/Icon.svelte';
	import { topics } from '$lib/data';
	import { topicIcon } from '$lib/theme/topic-icon';

	/**
	 * Bộ chọn chủ đề dùng chung cho ba trang có cùng nhu cầu (ôn thẻ, quiz, tìm kiếm).
	 * Trước đây mỗi trang tự lặp lại khối này nên nhãn nhóm, cách cuộn và cỡ icon lệch
	 * nhau — gom về một chỗ thì cả ba trang cùng hành xử.
	 *
	 * Ở màn hình nhỏ hàng chip cuộn ngang (12 chip xếp xuống chiếm gần nửa màn hình);
	 * từ `sm` trở lên nó tự xuống dòng để chuột không phải cuộn ngang.
	 */
	let {
		value,
		onSelect,
		label = 'Lọc theo chủ đề'
	}: { value: string | null; onSelect: (topicId: string | null) => void; label?: string } =
		$props();
</script>

<div
	class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1
	       sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
	role="group"
	aria-label={label}
>
	<FilterChip active={value === null} onToggle={() => onSelect(null)}>Tất cả</FilterChip>
	{#each topics as topic (topic.id)}
		<FilterChip
			active={value === topic.id}
			onToggle={() => onSelect(value === topic.id ? null : topic.id)}
		>
			<Icon name={topicIcon(topic.id)} size={15} strokeWidth={2} />
			{topic.name}
		</FilterChip>
	{/each}
</div>
