# Trạng thái bàn giao PatchLab

Cập nhật: 18/11/2026, Asia/Saigon. File này được thay nội dung hiện tại sau mỗi phiên; lịch sử nằm trong Git.

## Phiên và checkout

- Trạng thái: Handoff ready.
- AI bàn giao: Antigravity. Không giữ ticket đang làm.
- Local: D:/Projects/patchlab.
- Nhánh làm việc: feat/PL-103-versioned-reports, merge fast-forward vào main và push theo quyền người dùng cấp. Dùng git log để biết commit.
- PR #1 không được merge qua giao diện; nội dung đã vào main bằng git. Có thể bị GitHub đánh dấu đóng/merged; kiểm tra bằng git log origin/main.

## Đã có

Prototype hoàn tiền tuần tự (buggy/fixed), generator có seed, checker so với model tham chiếu src/model.ts (PL-101), rút gọn, xuất test, replay. PL-102: src/adapter.ts + lệnh `npm run check-module -- file.mjs [seed]` kiểm module ngoài theo contract trong docs/SPEC.md; module ném lỗi hoặc trả sai hình dạng thành failure (service-threw, contract-violation). PL-103: mỗi run ghi reports/<run>/ riêng (failure.json schema 2 + provenance, repro.test.ts); replay nhận schema 1 hoặc 2, khác thì exit 2. PL-001/002/003/101/102/103 = Done (đã vào main).

## Kiểm chứng

- npm run verify (typecheck, prettier, test) qua, 18/18 test trước khi merge PL-103.
- CI GitHub Windows/Linux chưa quan sát sau các lần merge này; kiểm tra tab Actions của repo. Chỉ self-review. Trên Windows PowerShell dùng npm.cmd/npx.cmd.

## Việc tiếp theo — PL-104 (Planned, chờ người dùng chọn case)

Browser agent tìm trên GitHub (18/11); tôi đã xác minh ứng viên 1 qua API GitHub (MIT, issue đóng, commit sửa, parent). Hai ứng viên còn lại do browser agent báo, chưa tự xác minh.

1. ĐỀ XUẤT: paveg/hono-idempotency#89 (MIT, 14 sao) — memoryStore({maxSize}) FIFO xóa record đang "processing", cùng khóa chạy 2 lần. Fix: commit 28e0f9e (PR #98), parent dc5c675; file src/stores/memory.ts. Tái hiện: maxSize 1; lock k1, lock k2, lock k1 lại trả true (đáng lẽ false). Phù hợp nhất: logic store thuần, in-memory, đồng bộ về ý nghĩa.
2. paveg/hono-idempotency#92 — record completed không có response gây 409 không phục hồi (fix 06e4329, parent 532abec). Gắn với middleware Hono.
3. VilledeMontreal/express-idempotency#34 — 409/417 thành 500 (fix 5835151). Phụ thuộc Express, khó thành adapter.

Cần: tải mã tại parent commit, giữ NOTICE giấy phép MIT, adapter cho store (cần mở rộng contract: khóa/lock thay vì refund), test fail ở parent và pass ở bản fix. Lưu ý: contract hiện tại là refund(), không khớp store.lock(); PL-104 có thể cần thêm một adapter dịch hoặc mô hình thứ hai. Reports/ là thư mục của người dùng, đừng xóa.

## Điểm cần giữ rõ

- Model cùng tác giả với đặc tả có thể sai giống service: giữ test ví dụ viết tay.
- Nạp module ngoài = chạy mã với quyền người dùng; chưa sandbox.
- Chưa có lỗi công khai đã tái hiện (PL-104) hoặc người dùng thật.
- Người dùng muốn nhanh để đưa vào CV nhưng phải hiểu project; người dùng báo "chưa hiểu gì": giải thích đơn giản, từng bước, lấy ví dụ cụ thể.
