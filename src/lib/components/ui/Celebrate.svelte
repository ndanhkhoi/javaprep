<script lang="ts">
	/**
	 * Bung giấy màu bằng CSS thuần cho màn hình kết thúc phiên. Không dùng canvas và
	 * không thêm thư viện: 28 phần tử với animation một lần rồi tự dừng.
	 *
	 * Vị trí và độ trễ được sinh **một lần** khi component mount, không phải trong
	 * `$derived` — nếu tính lại theo render thì mỗi lần cập nhật state là một lần
	 * animation nhảy lại từ đầu.
	 */
	const PIECES = Array.from({ length: 28 }, (_, i) => {
		// Phân bố tất định theo chỉ số: không cần Math.random và không nhảy giữa render.
		const spread = ((i * 37) % 100) - 50;
		return {
			x: spread,
			lift: 120 + ((i * 53) % 120),
			delay: (i % 7) * 45,
			hue: (i * 47) % 360,
			size: 6 + (i % 3) * 3,
			spin: (i % 2 === 0 ? 1 : -1) * (180 + ((i * 61) % 360))
		};
	});
</script>

<div class="pointer-events-none absolute inset-x-0 top-0 grid h-0 place-items-center" aria-hidden="true">
	{#each PIECES as piece, i (i)}
		<span
			class="confetti absolute rounded-[2px]"
			style="
				width: {piece.size}px;
				height: {piece.size * 1.6}px;
				background: oklch(70% 0.19 {piece.hue});
				--x: {piece.x}vw;
				--lift: {piece.lift}px;
				--spin: {piece.spin}deg;
				animation-delay: {piece.delay}ms;
			"
		></span>
	{/each}
</div>

<style>
	.confetti {
		opacity: 0;
		animation: burst 1400ms var(--ease-out-quart) both;
	}

	@keyframes burst {
		0% {
			opacity: 1;
			transform: translate(0, 0) rotate(0deg) scale(0.6);
		}
		45% {
			opacity: 1;
			transform: translate(calc(var(--x) * 0.7), calc(var(--lift) * -1))
				rotate(calc(var(--spin) * 0.6)) scale(1);
		}
		100% {
			opacity: 0;
			transform: translate(var(--x), 60vh) rotate(var(--spin)) scale(0.9);
		}
	}

	/* Bung giấy là hiệu ứng trang trí thuần — tắt hẳn thay vì chỉ rút ngắn. */
	@media (prefers-reduced-motion: reduce) {
		.confetti {
			display: none;
		}
	}
</style>
