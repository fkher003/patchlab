# Nhật ký công việc phiên Antigravity (18/11/2026) — để Codex tiếp tục

STATUS.md là điểm bàn giao ngắn; file này là chi tiết lý do và cách làm. Lịch sử đầy đủ: `git log`.

| Ticket | Làm gì                                                                                                                                                                               | Quyết định chính                                                                          | Kiểm chứng                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| PL-101 | src/model.ts (model tham chiếu từ SPEC); checker chạy rule thuộc tính cũ rồi so status/tổng với model (model-status-mismatch, model-total-mismatch)                                  | Giữ rule cũ chạy trước để tên rule/test cũ ổn định; model dựng từ sổ cái id→amount        | Chạy checker cũ với service luôn từ chối: trả null; checker mới bắt được. test/model.test.ts                                      |
| PL-102 | src/adapter.ts, lệnh check-module, fixtures test/fixtures/\*.mjs; checker bắt module ném lỗi (service-threw) và sai hình dạng (contract-violation)                                   | Contract = create(paid) trả {refund,total}; không ghi report cho module ngoài (để PL-103) | test/adapter.test.ts, exit 0/1/2                                                                                                  |
| PL-103 | reports/<run>/ riêng mỗi lần chạy, failure.json schema 2 + provenance; replay nhận schema 1/2, khác thì exit 2; repro.test.ts import ../../src                                       | Thư mục riêng thay vì ghi đè; không đoán schema lạ                                        | test/cli.test.ts (2 run không ghi đè, schema lạ exit 2)                                                                           |
| PL-104 | CASE-001: paveg/hono-idempotency#89 (MIT). vendor/ chứa memory.parent.ts (dc5c675) và memory.fixed.ts (28e0f9e) nguyên bản; src/lockstore.ts; lệnh check-store; examples/hono-\*.mjs | Quy tắc lấy từ chú thích upstream; không kiểm khoá đã hoàn tất vì xóa khi đầy là hợp lệ   | test/lockstore.test.ts: chuỗi đúng của issue + 100 seed; browser agent tìm case, tôi xác minh issue/license/commit qua API GitHub |
| PL-105 | src/benchmark.ts, lệnh benchmark, docs/BENCHMARK.md, docs/FEEDBACK.md, README                                                                                                        | Benchmark xác định (seed 0..n-1), không đo thời gian; feedback người dùng KHÔNG bịa       | test/benchmark.test.ts; phần phản hồi thật còn thiếu                                                                              |

## Quy ước và bẫy đã gặp

- Windows PowerShell: dùng npm.cmd/npx.cmd (npm.ps1 bị chặn). Không đổi execution policy.
- reports/ là thư mục git-ignored của người dùng; một lần tôi lỡ xóa khi gỡ lỗi. Đừng xóa.
- Ghi file tiếng Việt có dấu bằng UTF-8; chạy npx.cmd prettier --write sau khi sửa tài liệu (verify kiểm định dạng). vendor/ nằm trong .prettierignore.
- Người dùng cho phép tôi merge fast-forward vào main và push (ghi đè quy tắc không tự merge, riêng phiên này). Không force-push.
- CI: người dùng gửi ảnh Actions xanh cho các commit đến PL-104; chưa xem riêng job Windows/Linux.
- Người dùng nói "chưa hiểu gì": giải thích ngắn, có ví dụ cụ thể, kèm một câu hỏi nhỏ.

## Còn thiếu

Phản hồi người dùng thử thật (PL-105 chưa Done); gửi hoặc không gửi ghi chú cho upstream; check-module/check-store chưa ghi report.
