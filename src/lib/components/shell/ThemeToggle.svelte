<script lang="ts">
	import Icon from '../ui/Icon.svelte';
	import { progress } from '$lib/stores/progress.svelte';
	import type { ThemePreference } from '$lib/types';

	/** Lối tắt cho tuỳ chọn đã có trong Cài đặt — xoay vòng qua đúng ba giá trị đó. */
	const ORDER: ThemePreference[] = ['system', 'light', 'dark'];
	const META = {
		system: { icon: 'monitor', label: 'Giao diện: theo hệ thống' },
		light: { icon: 'sun', label: 'Giao diện: sáng' },
		dark: { icon: 'moon', label: 'Giao diện: tối' }
	} as const;

	const current = $derived(progress.settings.theme);
	const next = $derived(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]);
</script>

<button
	type="button"
	class="grid size-11 place-items-center rounded-lg border border-border bg-surface-2
	       text-ink-muted transition-colors duration-[var(--dur-fast)]
	       hover:border-border-strong hover:text-ink"
	title={META[current].label}
	aria-label="{META[current].label}. Bấm để đổi sang {META[next].label.toLowerCase()}"
	onclick={() => progress.setTheme(next)}
>
	<Icon name={META[current].icon} size={18} />
</button>
