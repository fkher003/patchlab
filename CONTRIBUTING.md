# Cách đóng góp

Đọc docs/WORKFLOW.md và chọn một ticket trong docs/BACKLOG.md trước khi viết code. Không commit trực tiếp lên main trong quy trình đề xuất; tạo nhánh feat/PL-xxx-mo-ta, fix/PL-xxx-mo-ta hoặc chore/mo-ta.

Thiết lập: Node theo .node-version → npm ci → npm run verify.

Trước PR: đọc diff, chạy verify, cập nhật tài liệu liên quan và mô tả cách kiểm chứng. Commit ngắn mô tả kết quả. Không thêm dữ liệu bí mật, reports, node_modules hoặc kết quả benchmark chưa đo thật.

Branch protection chưa được cấu hình; đây là quy trình làm việc, chưa phải hạn chế được GitHub cưỡng chế. Với dự án một người, ghi rõ self-review; không giả định có người thứ hai đã review.
