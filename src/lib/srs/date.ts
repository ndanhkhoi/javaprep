/**
 * Ngày trong app luôn là chuỗi 'YYYY-MM-DD' theo múi giờ local, không phải timestamp.
 * Lý do: interval SRS tính bằng ngày; dùng timestamp sinh ra lớp bug "đến hạn lúc 23:00
 * nhưng hiện sang hôm sau" và lệch ngày khi đổi múi giờ. So sánh chuỗi ISO date là
 * tương đương so sánh thứ tự thời gian nên `a <= b` hoạt động đúng.
 */
export type IsoDate = string;

function pad(n: number): string {
	return n < 10 ? `0${n}` : String(n);
}

/** Chuyển một Date sang 'YYYY-MM-DD' theo các trường local (không dùng toISOString). */
export function toIsoDate(d: Date): IsoDate {
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function todayLocal(now: Date = new Date()): IsoDate {
	return toIsoDate(now);
}

/** Parse 'YYYY-MM-DD' thành Date lúc nửa đêm giờ local. */
export function fromIsoDate(iso: IsoDate): Date {
	const [y, m, d] = iso.split('-').map(Number);
	return new Date(y, m - 1, d);
}

export function addDays(from: IsoDate | Date, days: number): IsoDate {
	const base = typeof from === 'string' ? fromIsoDate(from) : new Date(from);
	base.setDate(base.getDate() + days);
	return toIsoDate(base);
}

/** Số ngày từ `a` đến `b` (dương nếu b sau a). Bỏ qua DST bằng cách so sánh theo ngày local. */
export function daysBetween(a: IsoDate, b: IsoDate): number {
	const da = fromIsoDate(a);
	const db = fromIsoDate(b);
	return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

/** Diễn giải interval theo tiếng Việt, dùng cho nhãn nút chấm điểm. */
export function formatInterval(days: number): string {
	if (days <= 0) return 'hôm nay';
	if (days === 1) return '1 ngày';
	if (days < 7) return `${days} ngày`;
	if (days < 30) {
		const w = Math.round(days / 7);
		return w === 1 ? '1 tuần' : `${w} tuần`;
	}
	if (days < 365) {
		const m = Math.round(days / 30);
		return m === 1 ? '1 tháng' : `${m} tháng`;
	}
	const y = Math.round((days / 365) * 10) / 10;
	return `${y} năm`;
}
