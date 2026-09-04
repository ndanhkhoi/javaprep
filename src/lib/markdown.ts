import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: false });

/**
 * Nội dung là của chính app nên rủi ro XSS gần bằng 0, nhưng sanitize vẫn rẻ và loại
 * bỏ hẳn cả lớp rủi ro nếu sau này có nhập nội dung từ nguồn ngoài (import sao lưu,
 * bộ câu hỏi do người dùng thêm).
 */
export function renderMarkdown(source: string): string {
	const html = marked.parse(source, { async: false });
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: [
			'p', 'br', 'strong', 'em', 'code', 'pre', 'ul', 'ol', 'li',
			'h2', 'h3', 'h4', 'blockquote', 'a', 'table', 'thead', 'tbody',
			'tr', 'th', 'td', 'hr'
		],
		ALLOWED_ATTR: ['href', 'title'],
		ALLOW_DATA_ATTR: false
	});
}

/**
 * Markdown **một dòng**: chỉ `code`, `strong`, `em`. Dùng cho tiêu đề câu hỏi, lựa
 * chọn quiz và giải thích ngắn — những chỗ nội dung có backtick nhưng lại nằm trong
 * `<h1>`, `<button>` hay `<li>` nên không được sinh ra thẻ block nào.
 *
 * `parseInline` chứ không phải `parse`: `parse` bọc kết quả trong `<p>`, làm vỡ layout
 * flex của các chỗ gọi.
 */
export function renderInlineMarkdown(source: string): string {
	const html = marked.parseInline(source, { async: false });
	return DOMPurify.sanitize(html, {
		ALLOWED_TAGS: ['code', 'strong', 'em', 'br'],
		ALLOWED_ATTR: [],
		ALLOW_DATA_ATTR: false
	});
}

/** Bỏ dấu markdown inline để dùng ở chỗ chỉ nhận chữ thuần (thẻ `<title>`, aria-label). */
export function stripInlineMarkdown(source: string): string {
	return source.replace(/`([^`]*)`/g, '$1').replace(/\*\*([^*]*)\*\*/g, '$1');
}
