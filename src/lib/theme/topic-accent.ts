/**
 * Mỗi chủ đề có một góc hue riêng. Toàn bộ màu của chủ đề (chữ, nền nhạt, viền, khối
 * đặc) được dẫn xuất từ đúng con số này trong CSS — xem class `.accent` ở `app.css`.
 *
 * Vì thế thêm chủ đề mới chỉ cần thêm một số vào bảng dưới, không phải thêm bảng màu
 * và không phải kiểm tra lại tương phản: độ sáng (L) và chroma (C) do `.accent` giữ
 * cố định, chỉ hue thay đổi.
 */
const HUE_BY_TOPIC: Record<string, number> = {
	'java-core': 35,
	collections: 250,
	concurrency: 318,
	'jvm-memory': 288,
	exceptions: 18,
	'java8-plus': 200,
	'spring-core': 145,
	'spring-boot': 108,
	'spring-web': 225,
	'spring-data': 62,
	'spring-security': 172
};

/** Hue mặc định trùng brand — chủ đề lạ vẫn hiển thị đúng, chỉ mất tính riêng biệt. */
export const DEFAULT_HUE = 274;

export function topicHue(topicId: string | undefined | null): number {
	return (topicId ? HUE_BY_TOPIC[topicId] : undefined) ?? DEFAULT_HUE;
}

/** Style inline để gắn vào phần tử mang class `accent`. */
export function accentStyle(topicId: string | undefined | null): string {
	return `--th: ${topicHue(topicId)}`;
}
