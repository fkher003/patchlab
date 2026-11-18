# Trạng thái bàn giao PatchLab

Cập nhật 18/11/2026, Asia/Saigon.

## Phiên và checkout

- Trạng thái: Handoff ready.
- AI bàn giao: Codex; không giữ ticket đang làm.
- Local: D:/Projects/patchlab. Nhánh: docs/PL-106-handoff-learning, base main db2d905.
- Phiên này chỉ sửa tài liệu; không sửa code/runtime, vendor hoặc reports của người dùng. Không merge.
- Tra git log để lấy commit cuối. Đọc AGENTS.md trước tiếp tục.

## Kết quả đã kiểm tra độc lập tại base db2d905

- npm.cmd run verify qua: strict typecheck, formatter, 24/24 test.
- demo: buggy hoàn 60.000, fixed 30.000 khi cùng yêu cầu 30.000 được gửi hai lần.
- check-store parent: FAIL processing-key-lost, 30 → 4 thao tác; fixed PASS trong 100 chuỗi.
- benchmark 500: fixed refund 0 lỗi; buggy 499; always-reject 500; fixed store 0; parent store 431. Khớp bảng đã lưu.
- Đây là kiểm tra local Windows; phiên này chưa xác nhận CI mới hoặc kiểm toán toàn bộ source/vendor.

## PL-106

Đồng bộ tài liệu cũ còn nói model/adapter/schema chưa có; sửa số target benchmark; thêm docs/QUICKSTART-LEARNING.md bằng ví dụ chạy thật. Cập nhật rõ MVP chưa hoàn tất. PL-106 ở Review đến khi tích hợp main. Tài liệu sau sửa được kiểm tra định dạng và git diff --check trước commit.

## Việc tiếp theo

1. Đọc tiêu chí PL-107 trong BACKLOG và SPEC; thực hiện report/replay/regression cho adapter ngoài. Nếu PL-106 chưa merge, có thể tạo nhánh feat/PL-107-external-reports từ nhánh hiện tại và ghi quan hệ phụ thuộc. Không cần chờ feedback thật để làm phần kỹ thuật này.
2. PL-105 vẫn thiếu feedback từ lập trình viên ngoài; chỉ người thật cung cấp được. Không gửi tin nhắn cho người khác hoặc báo upstream nếu người dùng chưa yêu cầu.
3. PL-108 đo timing còn Planned. Không gọi MVP hoàn thành chỉ vì test qua.

## Giới hạn cần nhớ

Report/replay hiện chỉ dùng service mẫu; check-module/check-store chưa ghi report. Benchmark chưa đo thời gian. Có một lỗi upstream đã được tái hiện theo hồ sơ Antigravity, chưa có người dùng ngoài. Model cùng nguồn đặc tả vẫn có thể sai. Adapter chạy mã với quyền người dùng, chưa sandbox.

## Học

Người dùng từng nói chưa hiểu project. Bắt đầu từ QUICKSTART-LEARNING: khóa k2 đang xử lý bị loại khi kho đầy, tại sao đó là lỗi? Dùng dữ liệu cụ thể và câu hỏi nhỏ, không chặn công việc thường lệ để chờ trả lời. Ghi đúng chưa xác nhận người dùng đã hiểu.
