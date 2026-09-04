<script lang="ts">
	import { base } from '$app/paths';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import { backupFileName, parseBackup, serialiseBackup } from '$lib/backup';
	import { progress } from '$lib/stores/progress.svelte';
	import type { ThemePreference } from '$lib/types';

	let message = $state<{ tone: 'ok' | 'bad'; text: string } | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);

	const THEMES: { value: ThemePreference; label: string }[] = [
		{ value: 'system', label: 'Hệ thống' },
		{ value: 'light', label: 'Sáng' },
		{ value: 'dark', label: 'Tối' }
	];
	const LIMITS = [5, 10, 20, 30].map((n) => ({ value: n, label: String(n) }));

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

<div class="mx-auto max-w-3xl">
	<a
		href="{base}/"
		class="mb-3 inline-flex min-h-8 items-center gap-1 text-xs font-medium text-ink-muted
		       transition-colors hover:text-ink"
	>
		<Icon name="chevronLeft" size={14} />
		Chủ đề
	</a>

	<h1 class="mb-5 text-title font-extrabold">Cài đặt</h1>

	{#if message}
		<p
			class="animate-rise mb-5 flex items-center gap-2.5 rounded-xl border p-3.5 text-sm font-medium
			       {message.tone === 'ok'
				? 'border-ok/40 bg-ok-soft text-ok'
				: 'border-bad/40 bg-bad-soft text-bad'}"
			role="status"
			aria-live="polite"
		>
			<Icon name={message.tone === 'ok' ? 'check' : 'x'} size={16} strokeWidth={2.4} />
			{message.text}
		</p>
	{/if}

	<div class="space-y-4">
		<section class="surface-card rounded-2xl p-5" aria-labelledby="theme-heading">
			<div class="mb-3 flex items-start gap-3">
				<span class="grid size-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand">
					<Icon name="sun" size={17} />
				</span>
				<div class="min-w-0">
					<h2 id="theme-heading" class="text-sm font-bold">Giao diện</h2>
					<p class="mt-0.5 text-2xs text-ink-muted">
						"Hệ thống" đi theo cài đặt sáng/tối của thiết bị.
					</p>
				</div>
			</div>
			<SegmentedControl
				label="Chế độ giao diện"
				options={THEMES}
				value={progress.settings.theme}
				onSelect={(next) => progress.setTheme(next)}
			/>
		</section>

		<section class="surface-card rounded-2xl p-5" aria-labelledby="limit-heading">
			<div class="mb-3 flex items-start gap-3">
				<span class="grid size-9 shrink-0 place-items-center rounded-lg bg-warn-soft text-warn">
					<Icon name="layers" size={17} />
				</span>
				<div class="min-w-0">
					<h2 id="limit-heading" class="text-sm font-bold">Thẻ mới mỗi ngày</h2>
					<p class="mt-0.5 text-2xs leading-relaxed text-ink-muted">
						Số thẻ chưa học được đưa vào mỗi phiên ôn. Đặt cao quá thì vài ngày sau lượng thẻ đến
						hạn sẽ dồn lại.
					</p>
				</div>
			</div>
			<SegmentedControl
				label="Giới hạn thẻ mới mỗi ngày"
				options={LIMITS}
				value={progress.settings.dailyNewLimit}
				onSelect={(next) => progress.setDailyNewLimit(next)}
			/>
		</section>

		<section class="surface-card rounded-2xl p-5" aria-labelledby="data-heading">
			<div class="mb-4 flex items-start gap-3">
				<span class="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-3 text-ink-muted">
					<Icon name="download" size={17} />
				</span>
				<div class="min-w-0">
					<h2 id="data-heading" class="text-sm font-bold">Dữ liệu</h2>
					<p class="mt-0.5 text-2xs leading-relaxed text-ink-muted">
						Tiến độ chỉ nằm trên thiết bị này. Xoá dữ liệu trình duyệt là mất hết — nên xuất file
						sao lưu định kỳ.
					</p>
				</div>
			</div>

			<div class="grid gap-2.5 sm:grid-cols-2">
				<Button variant="secondary" size="lg" onclick={exportBackup}>
					<Icon name="download" size={17} />
					Xuất sao lưu ({cardCount} thẻ)
				</Button>
				<Button variant="secondary" size="lg" onclick={() => fileInput?.click()}>
					<Icon name="upload" size={17} />
					Nhập từ file
				</Button>
			</div>
			<input
				bind:this={fileInput}
				type="file"
				accept="application/json,.json"
				class="sr-only"
				onchange={importBackup}
			/>

			<hr class="my-4 border-border" />

			<Button variant="danger" size="lg" full onclick={reset}>
				<Icon name="trash" size={17} />
				Xoá toàn bộ tiến độ
			</Button>
		</section>

		<section class="rounded-2xl border border-border bg-surface-2 p-5" aria-labelledby="about-heading">
			<h2
				id="about-heading"
				class="mb-2 text-2xs font-bold uppercase tracking-[0.13em] text-ink-muted"
			>
				Về JavaPrep
			</h2>
			<div class="space-y-2 text-xs leading-relaxed text-ink-muted">
				<p>
					100 câu hỏi phỏng vấn Java &amp; Spring Boot, bám Java 21 LTS và Spring Boot 3.x. Lịch ôn
					dùng thuật toán SM-2. App hoạt động hoàn toàn offline sau lần mở đầu tiên.
				</p>
				<p>
					Không có thông báo đẩy khi đóng app — số thẻ đến hạn được hiển thị ngay khi bạn mở
					JavaPrep.
				</p>
			</div>
		</section>
	</div>
</div>
