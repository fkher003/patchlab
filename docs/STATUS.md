# Trạng thái bàn giao PatchLab

Cập nhật: 18/11/2026, Asia/Saigon. File này được thay nội dung hiện tại sau mỗi phiên; lịch sử nằm trong Git.

## Phiên và checkout

- Trạng thái: Handoff ready.
- AI bàn giao: Codex. Không có ticket triển khai đang được AI này giữ.
- Local: D:/Projects/patchlab.
- Nhánh: chore/project-foundation.
- Base nền móng đã kiểm tra: 1cf191b1e6e1b7a40dcca01beec2c2706fe4d0b9. Commit thêm hướng dẫn bàn giao được tra bằng git log; không tự tham chiếu SHA của chính file.
- PR #1: https://github.com/fkher003/patchlab/pull/1 — open/draft, chưa merge khi kiểm tra ngày 18/11.
- Working tree trước thay đổi tài liệu phiên này: sạch; chưa thấy code PL-101.

## Đã có

Prototype hoàn tiền tuần tự: buggy/fixed service, generator có seed, checker, rút gọn và xuất test, replay. Bộ khung có phạm vi MVP, kiến trúc, backlog, workflow, typecheck, formatter và test CLI. PL-001/002/003 ở Review vì chưa tích hợp main.

Phiên này bổ sung AGENTS.md và cơ chế bàn giao dùng chung; không triển khai PL-101. Bản PATCHLAB_AI_HANDOFF.md cũ ngoài repo được thay thế bằng AGENTS.md + file này.

## Kiểm chứng

- Nền móng 1cf191b: npm run verify qua với 9/9 test; CI Windows/Linux đã quan sát thành công ở phiên trước.
- Phiên tài liệu này: npm run format:check và git diff --check đã qua; chỉ thay tài liệu, không chạy lại test hành vi. Nếu code hoặc dependency đã đổi sau mốc nền móng, chạy lại baseline trước triển khai.
- Không có người review độc lập cho nền móng; self-review.

## Việc tiếp theo — PL-101

1. Đọc AGENTS.md, SPEC và acceptance criteria PL-101 trong BACKLOG; kiểm tra git status/branch/log.
2. Nếu nền móng còn chưa merge và chưa có nhánh PL-101, tạo feat/PL-101-reference-model từ HEAD nền móng đã kiểm tra. Nếu nhánh đã tồn tại, xem commit/diff rồi tiếp tục đúng công việc thay vì tạo bản trùng.
3. Chạy baseline, tạo test về service luôn từ chối yêu cầu hợp lệ. Thiết kế model tham chiếu từ đặc tả, không gọi service cần kiểm tra.
4. Triển khai so sánh status/trạng thái; giữ khả năng shrink, export và replay; test các trường hợp biên theo ticket.
5. npm run verify, đọc diff, cập nhật docs và bàn giao. Có thể mở PR phụ thuộc nền móng; chưa tự merge.

PL-101 là việc ưu tiên kế tiếp cho AI nào đang hoạt động, không cố định Codex hay Antigravity. Không cần người dùng chuyển lời giữa hai AI.

## Điểm cần giữ rõ

- Checker hiện có thể bỏ sót service luôn từ chối. Đây là vấn đề PL-101, không phải kết quả đã sửa.
- Chưa có adapter bên ngoài, model tham chiếu, lỗi công khai đã tái hiện hoặc người dùng thật.
- Report còn ghi đè và chưa kiểm tra schema version; phạm vi PL-103.
- Người dùng muốn tiết kiệm quota và học trong quá trình làm. Không yêu cầu xác nhận từng bước thường lệ.

## Mẫu cập nhật cuối phiên

Thay các phần tương ứng ở trên: trạng thái; AI/ticket; branch/base/commit gần nhất; thay đổi; lệnh kiểm tra và kết quả thực; việc dang dở; bước tiếp theo; bài học hoặc câu hỏi ngắn. Giữ file ngắn, không nối vô hạn nhật ký.
