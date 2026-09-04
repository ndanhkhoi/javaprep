<script lang="ts">
	import { ICONS, type IconName } from './icons';

	let {
		name,
		size = 20,
		strokeWidth = 1.75,
		class: extra = ''
	}: { name: IconName; size?: number; strokeWidth?: number; class?: string } = $props();
</script>

<svg
	class="shrink-0 {extra}"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width={strokeWidth}
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<path d={ICONS[name]} />
</svg>
