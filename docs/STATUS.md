# Trạng thái bàn giao PatchLab

Cập nhật: 18/11/2026, Asia/Saigon. File này được thay nội dung hiện tại sau mỗi phiên; lịch sử nằm trong Git.

## Phiên và checkout

- Trạng thái: Handoff ready.
- AI bàn giao: Antigravity. Ticket PL-101 code xong, ở Review (chưa merge main).
- Local: D:/Projects/patchlab.
- Nhánh: feat/PL-101-reference-model, tạo từ chore/project-foundation (base 6c9480a). Commit PL-101 tra bằng git log.
- PR #1 (nền móng): https://github.com/fkher003/patchlab/pull/1 — open/draft, chưa merge. Đã push nhánh lên origin; chưa mở PR (không có gh CLI). Mở PR (base chore/project-foundation) tại https://github.com/fkher003/patchlab/pull/new/feat/PL-101-reference-model.

## Đã có

Prototype hoàn tiền tuần tự: buggy/fixed service, generator có seed, checker, rút gọn, xuất test, replay. PL-001/002/003 ở Review. PL-101: src/model.ts là mô hình tham chiếu viết từ SPEC (ledger id→amount, không gọi createService); checker chạy các rule thuộc tính cũ trước, rồi so status và tổng với model (rule mới model-status-mismatch, model-total-mismatch). Shrink/export/replay không đổi.

## Kiểm chứng

- Baseline trước thay đổi: npm run verify qua, 9/9 test.
- Sau PL-101: npm run verify (typecheck, prettier, test) qua, 14/14 test; demo vẫn buggy FAIL / fixed PASS.
- Đã chạy checker cũ (HEAD) với service luôn từ chối: trả null (bỏ sót); checker mới bắt model-status-mismatch.
- Chỉ self-review; chưa review độc lập. Trên Windows PowerShell dùng npm.cmd/npx.cmd vì npm.ps1 bị chặn bởi execution policy (không đổi policy).

## Việc tiếp theo

1. Mở PR PL-101 (base chore/project-foundation) qua link trên; chưa tự merge.
2. Khi nền móng và PL-101 vào main, đổi PL-001/002/003/101 thành Done.
3. PL-102 (adapter) chỉ chuyển Ready sau khi ghi contract, input/output và test chấp nhận.

## Điểm cần giữ rõ

- Model cùng tác giả với đặc tả có thể sai giống service: vẫn cần test ví dụ viết tay (tests trong test/model.test.ts).
- Rule mới cho report/replay: report cũ vẫn đọc được nhưng chưa có schema version (PL-103).
- Chưa có adapter bên ngoài, lỗi công khai đã tái hiện hoặc người dùng thật.
- Người dùng muốn nhanh để đưa vào CV nhưng phải hiểu project; giải thích quyết định ngắn, không xin xác nhận từng bước.

## Mẫu cập nhật cuối phiên

Thay các phần tương ứng ở trên: trạng thái; AI/ticket; branch/base/commit gần nhất; thay đổi; lệnh kiểm tra và kết quả thực; việc dang dở; bước tiếp theo; bài học hoặc câu hỏi ngắn. Giữ file ngắn, không nối vô hạn nhật ký.
