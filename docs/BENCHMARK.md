# Benchmark (PL-105, phần đo)

Lệnh: `npm.cmd run benchmark -- 500` (seed 0..499, mỗi chuỗi 30 thao tác; xác định, không đo thời gian). Exit 0 nếu mọi mục "correct" không báo lỗi và mọi mục "bug" bị phát hiện ít nhất một lần.

| Target                                                   | Expected | Sequences | Failing | Detected | Avg length | Avg minimized |
| -------------------------------------------------------- | -------- | --------- | ------- | -------- | ---------- | ------------- |
| refund fixed                                             | correct  | 500       | 0       | 0.0%     | 0          | 0             |
| refund buggy (retry not recognised)                      | bug      | 500       | 499     | 99.8%    | 30         | 2             |
| refund always-reject (mutant)                            | bug      | 500       | 500     | 100.0%   | 30         | 1             |
| hono-idempotency memoryStore fixed (28e0f9e)             | correct  | 500       | 0       | 0.0%     | 0          | 0             |
| hono-idempotency memoryStore parent (dc5c675, issue #89) | bug      | 500       | 431     | 86.2%    | 30         | 4             |

Cách đọc: cột Detected của mục _correct_ chính là tỉ lệ báo nhầm (0% là kết quả cần có); của mục _bug_ là tỉ lệ chuỗi sinh ngẫu nhiên có chạm lỗi. "Avg minimized" là độ dài trung bình sau khi rút gọn.

## Giới hạn

- Chỉ 3 bản lỗi/mutant cho hoàn tiền (1 bản là mutant tự tạo) và 1 lỗi công khai thật (CASE-001); chưa đại diện cho lỗi thực tế nói chung.
- Detected phụ thuộc generator (khoá và số tiền lấy từ tập nhỏ, maxSize cố định 2). Đừng suy ra tỉ lệ phát hiện lỗi ngoài đời.
- Chưa có phản hồi người dùng thử: xem docs/FEEDBACK.md.
