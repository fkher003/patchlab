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

## Việc tiếp theo — PL-104 (Planned, cần quyết định người dùng)

Chọn MỘT lỗi công khai có nguồn và giấy phép cho phép dùng lại, tái hiện bằng adapter + check-module. Tiêu chí chọn: logic nhỏ, tuần tự, chạy được không cần dịch vụ ngoài, issue/commit sửa lỗi công khai. Chưa chọn được case; việc này cần tìm kiếm web và người dùng duyệt case trước khi code. check-module chưa ghi report/repro (có thể cần khi làm PL-104). Lưu ý: reports/ là thư mục git-ignored của người dùng, đừng xóa.

## Điểm cần giữ rõ

- Model cùng tác giả với đặc tả có thể sai giống service: giữ test ví dụ viết tay.
- Nạp module ngoài = chạy mã với quyền người dùng; chưa sandbox.
- Chưa có lỗi công khai đã tái hiện (PL-104) hoặc người dùng thật.
- Người dùng muốn nhanh để đưa vào CV nhưng phải hiểu project; người dùng báo "chưa hiểu gì": giải thích đơn giản, từng bước, lấy ví dụ cụ thể.
