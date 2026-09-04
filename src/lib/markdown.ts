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
