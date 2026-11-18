# Backlog

Đây là nguồn trạng thái công việc hiện tại, chưa đồng bộ thành GitHub Issues. Ready = phạm vi và acceptance criteria rõ; In progress = đang thực hiện; Review = kiểm tra local xong, chờ review/CI; Done = đã kiểm chứng và tích hợp main. Không đánh dấu Done chỉ vì đã có code.

| ID     | Ưu tiên | Công việc                                             | Trạng thái | Phụ thuộc      |
| ------ | ------- | ----------------------------------------------------- | ---------- | -------------- |
| PL-001 | P0      | PRD, kiến trúc, backlog, quy trình học và phát triển  | Done       | Không          |
| PL-002 | P0      | Typecheck strict, formatter, lockfile và CI hai OS    | Done       | PL-001         |
| PL-003 | P0      | Kiểm thử CLI và regression được xuất                  | Done       | PL-002         |
| PL-101 | P0      | Model tham chiếu bắt service luôn từ chối             | Done       | PL-003         |
| PL-102 | P1      | Contract adapter cho module bên ngoài                 | Done       | PL-101         |
| PL-103 | P1      | Report có version, provenance, output riêng từng run  | Done       | PL-102         |
| PL-104 | P1      | Tái hiện một lỗi công khai có nguồn và giấy phép      | Done       | PL-102, PL-103 |
| PL-105 | P1      | Benchmark bản lỗi/bản đúng và phản hồi người dùng thử | Planned    | PL-104         |

## Sprint 0 — Nền móng

PL-001: Người mới đọc PRODUCT → ARCHITECTURE → WORKFLOW hiểu mục đích, giới hạn, cách làm một ticket. Tài liệu phân biệt rõ tính năng đã có và dự kiến.

PL-002: Clone sạch, npm ci và npm run verify chạy được. Typecheck strict bao gồm src và test. CI khai báo Windows/Linux, quyền đọc; cần xem kết quả GitHub trước khi nói CI đã xanh. Có lockfile.

PL-003: Test tự động xác nhận demo exit 0; buggy exit 1 và tạo report; replay buggy exit 1/fixed exit 0; regression sinh ra fail với buggy/pass với fixed; input hoặc JSON sai exit 2. Test không làm thay đổi reports của người dùng.

## Sprint 1 — Kiểm chứng tính đúng

### PL-101 — ticket tiếp theo

Vấn đề: một implementation luôn từ chối có thể vượt qua các thuộc tính an toàn hiện tại.

Acceptance criteria:

- Test thể hiện checker hiện tại bỏ sót implementation luôn từ chối.
- Mô hình tham chiếu tính trạng thái/kết quả từ đặc tả, không gọi createService hoặc sao chép nguyên implementation.
- Checker phát hiện khác biệt trạng thái hoặc status giữa model và service.
- Các ca retry, conflict, dữ liệu sai và hết số dư vẫn có test.
- Người học giải thích được vì sao model vẫn có thể sai và cần test độc lập.

### PL-102 — Done

Contract và tiêu chí chấp nhận nằm ở docs/SPEC.md mục Adapter. Test: test/adapter.test.ts (module tốt qua, reject-all bị bắt, ném lỗi/sai hình dạng thành failure, module không hợp lệ exit 2, không ghi report).

### PL-103 — Done

Tiêu chí: mỗi run ghi vào thư mục riêng, không ghi đè; failure.json schema 2 có provenance; replay từ chối schema thiếu/lạ (exit 2) và vẫn đọc schema 1; repro test xuất ra chạy được từ thư mục mới. Test: test/cli.test.ts.

### PL-104 — Done

Tiêu chí: lỗi công khai có nguồn + giấy phép đã kiểm; mã upstream nguyên bản trong vendor/ kèm NOTICE; PatchLab fail ở parent (đã rút gọn) và pass ở bản sửa; test chạy đúng chuỗi trong issue. Chi tiết: docs/CASE-001.md. Test: test/lockstore.test.ts.

### PL-105

Chỉ chuyển Ready sau khi ghi cụ thể contract, input/output và test chấp nhận. Chưa đặt deadline cứng cho lỗi công khai vì chưa chọn được case có thể tái hiện. Mỗi lần lập kế hoạch chỉ chọn một ticket đang làm.
