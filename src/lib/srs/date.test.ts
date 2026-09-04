import { describe, expect, it } from 'vitest';
import {
	addDays,
	daysBetween,
	formatInterval,
	formatIsoDate,
	fromIsoDate,
	toIsoDate,
	todayLocal
} from './date';

describe('toIsoDate', () => {
	it('dùng các trường local, không phải UTC', () => {
		// 23:30 ngày 5 local — toISOString() ở múi giờ +7 sẽ ra ngày 5 UTC 16:30, nhưng
		// ở múi giờ -5 sẽ nhảy sang ngày 6. Ta luôn phải nhận đúng ngày local.
		const d = new Date(2026, 8, 5, 23, 30, 0);
		expect(toIsoDate(d)).toBe('2026-09-05');
	});

	it('pad tháng và ngày một chữ số', () => {
		expect(toIsoDate(new Date(2026, 0, 3))).toBe('2026-01-03');
	});

	it('todayLocal khớp toIsoDate của cùng thời điểm', () => {
		const now = new Date(2026, 11, 31, 0, 0, 1);
		expect(todayLocal(now)).toBe('2026-12-31');
	});
});

describe('addDays', () => {
	it('cộng ngày qua ranh giới tháng', () => {
		expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
	});

	it('cộng ngày qua ranh giới năm', () => {
		expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
	});

	it('xử lý năm nhuận', () => {
		expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
	});

	it('nhận số âm', () => {
		expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
	});

	it('nhận Date làm đầu vào', () => {
		expect(addDays(new Date(2026, 8, 5), 10)).toBe('2026-09-15');
	});
});

describe('daysBetween', () => {
	it('đếm đúng khoảng cách dương', () => {
		expect(daysBetween('2026-09-01', '2026-09-15')).toBe(14);
	});

	it('âm khi b trước a', () => {
		expect(daysBetween('2026-09-15', '2026-09-01')).toBe(-14);
	});

	it('bằng 0 với cùng ngày', () => {
		expect(daysBetween('2026-09-05', '2026-09-05')).toBe(0);
	});

	it('đúng qua mốc đổi giờ mùa (DST) nếu môi trường có', () => {
		// 2026-03-08 là ngày đổi giờ ở Mỹ; kết quả phải là 1 ngày tròn, không phải 0.96.
		expect(daysBetween('2026-03-07', '2026-03-09')).toBe(2);
	});
});

describe('fromIsoDate', () => {
	it('trả về nửa đêm giờ local', () => {
		const d = fromIsoDate('2026-09-05');
		expect(d.getFullYear()).toBe(2026);
		expect(d.getMonth()).toBe(8);
		expect(d.getDate()).toBe(5);
		expect(d.getHours()).toBe(0);
	});
});

describe('formatInterval', () => {
	it.each([
		[0, 'hôm nay'],
		[1, '1 ngày'],
		[3, '3 ngày'],
		[7, '1 tuần'],
		[15, '2 tuần'],
		[30, '1 tháng'],
		[90, '3 tháng'],
		[365, '1 năm']
	])('%i ngày -> %s', (days, expected) => {
		expect(formatInterval(days)).toBe(expected);
	});
});

describe('formatIsoDate', () => {
	it('đọc ra ngày và tháng thay vì chuỗi ISO', () => {
		const label = formatIsoDate('2026-09-19');
		expect(label).not.toBe('2026-09-19');
		expect(label).toContain('19');
		expect(label).toContain('9');
	});

	it('thêm thứ khi được yêu cầu', () => {
		const plain = formatIsoDate('2026-09-19');
		const withWeekday = formatIsoDate('2026-09-19', { weekday: true });
		expect(withWeekday.length).toBeGreaterThan(plain.length);
	});

	it('trả lại chuỗi ISO khi ngày không hợp lệ', () => {
		expect(formatIsoDate('không-phải-ngày')).toBe('không-phải-ngày');
	});
});
