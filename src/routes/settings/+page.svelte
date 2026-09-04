<script lang="ts">
	import { base } from '$app/paths';
	import { backupFileName, parseBackup, serialiseBackup } from '$lib/backup';
	import { progress } from '$lib/stores/progress.svelte';
	import type { ThemePreference } from '$lib/types';

	let message = $state<{ tone: 'ok' | 'bad'; text: string } | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);

	const themes: { value: ThemePreference; label: string }[] = [
		{ value: 'system', label: 'Theo hệ thống' },
		{ value: 'light', label: 'Sáng' },
		{ value: 'dark', label: 'Tối' }
	];
	const limits = [5, 10, 20, 30];

	const cardCount = $derived(Object.keys(progress.cards).length);

	function exportBackup(): void {
		const blob = new Blob([serialiseBackup(progress.snapshot())], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = backupFileName(progress.today);
		link.click();
		URL.revokeObjectURL(url);
		message = { tone: 'ok', text: 'Đã tải file sao lưu.' };
	}

	async function importBackup(event: Event): Promise<void> {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		input.value = '';

		const result = parseBackup(await file.text());
		if (!result.ok) {
			message = { tone: 'bad', text: result.error };
			return;
		}

		const incoming = Object.keys(result.state.cards).length;
		const confirmed = confirm(
			`Nhập dữ liệu sẽ GHI ĐÈ toàn bộ tiến độ hiện tại (${cardCount} thẻ) bằng ${incoming} thẻ từ file. ` +
				'Thao tác này không hoàn tác được. Tiếp tục?'
		);
		if (!confirmed) return;

		progress.replaceAll(result.state);
		message = { tone: 'ok', text: `Đã khôi phục ${incoming} thẻ.` };
	}

	function reset(): void {
		if (!confirm(`Xoá toàn bộ tiến độ của ${cardCount} thẻ? Không hoàn tác được.`)) return;
		if (!confirm('Bạn chắc chắn chứ? Nên xuất file sao lưu trước khi xoá.')) return;
		progress.reset();
		message = { tone: 'ok', text: 'Đã xoá toàn bộ tiến độ học.' };
	}
</script>

<svelte:head><title>Cài đặt — JavaPrep</title></svelte:head>

<header class="mb-4">
	<a href="{base}/" class="text-xs text-ink-muted">← Chủ đề</a>
	<h1 class="mt-1 text-lg font-bold">Cài đặt</h1>
</header>

{#if message}
	<p
		class="mb-4 rounded-xl border p-3 text-sm
		       {message.tone === 'ok' ? 'border-ok/40 bg-ok/10 text-ok' : 'border-bad/40 bg-bad/10 text-bad'}"
		role="status"
		aria-live="polite"
	>
		{message.text}
	</p>
{/if}

<section class="mb-6">
	<h2 class="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-muted">Giao diện</h2>
	<div class="flex gap-1.5">
		{#each themes as theme (theme.value)}
			<button
				type="button"
				class="min-h-11 flex-1 rounded-xl border text-sm font-medium
				       {progress.settings.theme === theme.value
					? 'border-brand bg-brand text-brand-ink'
					: 'border-border text-ink-muted'}"
				aria-pressed={progress.settings.theme === theme.value}
				onclick={() => progress.setTheme(theme.value)}
			>
				{theme.label}
			</button>
		{/each}
	</div>
</section>

<section class="mb-6">
	<h2 class="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
		Thẻ mới mỗi ngày
	</h2>
	<p class="mb-2 text-xs text-ink-muted">
		Số thẻ chưa học được đưa vào mỗi phiên ôn. Đặt cao quá dễ dẫn tới dồn thẻ đến hạn.
	</p>
	<div class="flex gap-1.5">
		{#each limits as limit (limit)}
			<button
				type="button"
				class="min-h-11 flex-1 rounded-xl border text-sm font-medium tabular-nums
				       {progress.settings.dailyNewLimit === limit
					? 'border-brand bg-brand text-brand-ink'
					: 'border-border text-ink-muted'}"
				aria-pressed={progress.settings.dailyNewLimit === limit}
				onclick={() => progress.setDailyNewLimit(limit)}
			>
				{limit}
			</button>
		{/each}
	</div>
</section>

<section class="mb-6">
	<h2 class="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">Dữ liệu</h2>
	<p class="mb-2 text-xs text-ink-muted">
		Tiến độ chỉ nằm trên thiết bị này. Xoá dữ liệu trình duyệt sẽ mất hết — nên xuất file sao lưu
		định kỳ.
	</p>
	<div class="space-y-2">
		<button
			type="button"
			class="min-h-12 w-full rounded-xl border border-border text-sm font-semibold"
			onclick={exportBackup}
		>
			Xuất sao lưu ({cardCount} thẻ)
		</button>

		<button
			type="button"
			class="min-h-12 w-full rounded-xl border border-border text-sm font-semibold"
			onclick={() => fileInput?.click()}
		>
			Nhập từ file sao lưu
		</button>
		<input
			bind:this={fileInput}
			type="file"
			accept="application/json,.json"
			class="sr-only"
			onchange={importBackup}
		/>

		<button
			type="button"
			class="min-h-12 w-full rounded-xl border border-bad text-sm font-semibold text-bad"
			onclick={reset}
		>
			Xoá toàn bộ tiến độ
		</button>
	</div>
</section>

<section class="text-xs leading-relaxed text-ink-muted">
	<h2 class="mb-1 text-xs font-semibold uppercase tracking-wide">Về JavaPrep</h2>
	<p>
		100 câu hỏi phỏng vấn Java &amp; Spring Boot, bám Java 21 LTS và Spring Boot 3.x. Lịch ôn dùng
		thuật toán SM-2. App hoạt động hoàn toàn offline sau lần mở đầu tiên.
	</p>
	<p class="mt-2">
		Không có thông báo đẩy khi đóng app — số thẻ đến hạn được hiển thị ngay khi bạn mở JavaPrep.
	</p>
</section>
