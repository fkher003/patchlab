# CASE-001 — tái hiện lỗi công khai thật

| Mục        | Giá trị                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------- |
| Dự án      | paveg/hono-idempotency (MIT, giấy phép đã đối chiếu qua API GitHub và file LICENSE)                |
| Issue      | https://github.com/paveg/hono-idempotency/issues/89 (đã đóng)                                      |
| Commit sửa | 28e0f9e4c36426c1e0d3ca6c5600ac6d65bbca02 (PR #98); parent dc5c675ed3498894c795ce7d80ba5fde090ec610 |
| Mã dùng    | vendor/hono-idempotency (nguyên bản, NOTICE.md)                                                    |
| Phạm vi    | Chỉ memoryStore trong bộ nhớ, tuần tự. Không dùng framework Hono.                                  |

## Lỗi

`memoryStore({ maxSize })` khi đầy xóa bản ghi cũ nhất kể cả bản ghi đang "processing". Khóa bị xóa có thể được lock lại (trả true) hoặc get() trả undefined, nên cùng một yêu cầu có thể chạy hai lần.

## Tái hiện bằng PatchLab

```powershell
npm.cmd run check-store -- examples/hono-parent.mjs   # exit 1: FAIL, chuỗi 30 -> 4 thao tác
npm.cmd run check-store -- examples/hono-fixed.mjs    # exit 0: PASS (100 chuỗi, không phải chứng minh)
```

Test: test/lockstore.test.ts chạy đúng chuỗi trong issue (maxSize 1: lock k1, lock k2, lock k1 → processing-key-relocked) trên mã parent, và xác nhận bản đã sửa qua.

## Quy tắc kiểm chứng và giới hạn

Quy tắc lấy từ chính chú thích của upstream (lock trả false nếu khóa đã tồn tại): khóa đã lock và chưa complete/delete phải còn thấy được và không lock lại được. Checker không khẳng định gì về khóa đã hoàn tất, vì việc xóa chúng khi đầy là hợp lệ. Giới hạn: không kiểm TTL, đồng thời, hay các store khác của upstream; PASS chỉ nói trong 100 chuỗi × 30 thao tác với maxSize 2. Mình không phải tác giả upstream và chưa gửi gì cho họ.

## Đối chiếu lại ngày 20/11/2026

Codex đã đọc issue #89 qua GitHub API và lấy raw memory.ts từ hai SHA ghi trên. Nội dung hai file vendor khớp raw upstream sau chuẩn hóa CRLF/LF và newline cuối file. Vendor không bị sửa trong phiên này. Luồng npm run showcase nay tạo report/replay/regression trên ca này.
