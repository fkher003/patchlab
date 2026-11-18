# Trạng thái bàn giao PatchLab

Cập nhật: 18/11/2026, Asia/Saigon. File này được thay nội dung hiện tại sau mỗi phiên; lịch sử nằm trong Git.

## Phiên và checkout

- Trạng thái: Handoff ready.
- AI bàn giao: Antigravity. Không giữ ticket đang làm.
- Local: D:/Projects/patchlab.
- Nhánh làm việc: feat/PL-105-benchmark-readme, merge fast-forward vào main và push theo quyền người dùng cấp. Dùng git log để biết commit. Chi tiết toàn bộ phiên: docs/WORKLOG.md.
- PR #1 không được merge qua giao diện; nội dung đã vào main bằng git. Có thể bị GitHub đánh dấu đóng/merged; kiểm tra bằng git log origin/main.

## Đã có

Prototype hoàn tiền tuần tự (buggy/fixed), generator có seed, checker so với model tham chiếu src/model.ts (PL-101), rút gọn, xuất test, replay. PL-102: src/adapter.ts + lệnh `npm run check-module -- file.mjs [seed]` kiểm module ngoài theo contract trong docs/SPEC.md; module ném lỗi hoặc trả sai hình dạng thành failure (service-threw, contract-violation). PL-103: mỗi run ghi reports/<run>/ riêng (failure.json schema 2 + provenance, repro.test.ts); replay nhận schema 1 hoặc 2, khác thì exit 2. PL-104: lỗi công khai paveg/hono-idempotency#89 (MIT) tái hiện trên mã upstream nguyên bản trong vendor/: `npm run check-store -- examples/hono-parent.mjs` fail (30→4 thao tác), hono-fixed.mjs pass; chi tiết docs/CASE-001.md. PL-105 (Review): lệnh `npm run benchmark -- 500`, docs/BENCHMARK.md, README cập nhật, docs/FEEDBACK.md (chưa có phản hồi thật, không bịa). PL-001..104 = Done (đã vào main).

## Kiểm chứng

- npm run verify (typecheck, prettier, test) qua, 24/24 test trước khi merge PL-105.
- CI GitHub: người dùng gửi ảnh chụp tab Actions lúc 18:00 18/11 cho thấy các run CI xanh, gồm main commit 7db2793 (PL-104) và các nhánh PL-101..104. Ảnh chỉ hiện trạng thái tổng của từng run, không thấy riêng job Windows/Linux. Chỉ self-review. Trên Windows PowerShell dùng npm.cmd/npx.cmd.

## Việc tiếp theo

1. PL-105 chỉ còn thiếu phản hồi người dùng thật: chủ dự án nhờ 1–2 lập trình viên ngoài chạy thử theo README, ghi vào docs/FEEDBACK.md; sau đó chuyển PL-105 Done. AI không được bịa phản hồi.
2. Tùy chọn: sửa README/doc theo phản hồi; báo upstream hono-idempotency (chưa làm, cần người dùng quyết định); cho check-module/check-store ghi report có provenance.
3. Sau đó chọn ticket mới trong BACKLOG (chưa có) — lập kế hoạch với người dùng, một ticket mỗi lần. Thư mục reports/ là của người dùng, đừng xóa.

## Điểm cần giữ rõ

- Model cùng tác giả với đặc tả có thể sai giống service: giữ test ví dụ viết tay.
- Nạp module ngoài = chạy mã với quyền người dùng; chưa sandbox.
- Chỉ một lỗi công khai được tái hiện (CASE-001); chưa có người dùng thật. Mã vendor/ là bản sao nguyên bản MIT, không sửa.
- Người dùng muốn nhanh để đưa vào CV nhưng phải hiểu project; người dùng báo "chưa hiểu gì": giải thích đơn giản, từng bước, lấy ví dụ cụ thể.
