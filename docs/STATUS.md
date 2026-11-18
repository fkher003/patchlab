# Trạng thái bàn giao PatchLab

Cập nhật: 18/11/2026, Asia/Saigon. File này được thay nội dung hiện tại sau mỗi phiên; lịch sử nằm trong Git.

## Phiên và checkout

- Trạng thái: Handoff ready.
- AI bàn giao: Antigravity. Không giữ ticket đang làm.
- Local: D:/Projects/patchlab.
- Nhánh làm việc: feat/PL-102-adapter-contract, đã merge fast-forward vào main và push theo quyền người dùng cấp (ghi đè quy tắc "không tự merge" cho phiên này). Dùng git log để biết commit.
- PR #1 không được merge qua giao diện; nội dung đã vào main bằng git. Có thể bị GitHub đánh dấu đóng/merged; kiểm tra bằng git log origin/main.

## Đã có

Prototype hoàn tiền tuần tự (buggy/fixed), generator có seed, checker so với model tham chiếu src/model.ts (PL-101), rút gọn, xuất test, replay. PL-102: src/adapter.ts + lệnh `npm run check-module -- file.mjs [seed]` kiểm module ngoài theo contract trong docs/SPEC.md; module ném lỗi hoặc trả sai hình dạng thành failure (service-threw, contract-violation). PL-001/002/003/101/102 = Done (đã vào main).

## Kiểm chứng

- npm run verify (typecheck, prettier, test) qua, 18/18 test trước khi merge PL-102.
- CI GitHub Windows/Linux chưa quan sát sau các lần merge này; kiểm tra tab Actions của repo. Chỉ self-review. Trên Windows PowerShell dùng npm.cmd/npx.cmd.

## Việc tiếp theo — PL-103 (đang Planned)

Report có version (schema), provenance (variant/module, seed, paid, phiên bản), output riêng từng run (không ghi đè reports/failure.json), replay kiểm schema version. check-module hiện chưa ghi report. Trước khi code: ghi acceptance criteria cụ thể trong BACKLOG rồi chuyển Ready.

## Điểm cần giữ rõ

- Model cùng tác giả với đặc tả có thể sai giống service: giữ test ví dụ viết tay.
- Nạp module ngoài = chạy mã với quyền người dùng; chưa sandbox.
- Chưa có lỗi công khai đã tái hiện (PL-104) hoặc người dùng thật.
- Người dùng muốn nhanh để đưa vào CV nhưng phải hiểu project; người dùng báo "chưa hiểu gì": giải thích đơn giản, từng bước, lấy ví dụ cụ thể.
