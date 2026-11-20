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
| PL-105 | P1      | Benchmark bản lỗi/bản đúng và phản hồi người dùng thử | Review     | PL-104         |

## Sprint 0 — Nền móng

PL-001: Người mới đọc PRODUCT → ARCHITECTURE → WORKFLOW hiểu mục đích, giới hạn, cách làm một ticket. Tài liệu phân biệt rõ tính năng đã có và dự kiến.

PL-002: Clone sạch, npm ci và npm run verify chạy được. Typecheck strict bao gồm src và test. CI khai báo Windows/Linux, quyền đọc; cần xem kết quả GitHub trước khi nói CI đã xanh. Có lockfile.

PL-003: Test tự động xác nhận demo exit 0; buggy exit 1 và tạo report; replay buggy exit 1/fixed exit 0; regression sinh ra fail với buggy/pass với fixed; input hoặc JSON sai exit 2. Test không làm thay đổi reports của người dùng.

## Sprint 1 — Kiểm chứng tính đúng

### PL-101 — Done

Vấn đề: một implementation luôn từ chối có thể vượt qua các thuộc tính an toàn hiện tại.

Acceptance criteria:

- Test thể hiện checker hiện tại bỏ sót implementation luôn từ chối.
- Mô hình tham chiếu tính trạng thái/kết quả từ đặc tả, không gọi createService hoặc sao chép nguyên implementation.
- Checker phát hiện khác biệt trạng thái hoặc status giữa model và service.
- Các ca retry, conflict, dữ liệu sai và hết số dư vẫn có test.
- Người học giải thích được vì sao model vẫn có thể sai và cần test độc lập.

### PL-102 — Done

Contract và tiêu chí chấp nhận nằm ở docs/SPEC.md mục Adapter. Test: test/adapter.test.ts (module tốt qua, reject-all bị bắt, ném lỗi/sai hình dạng thành failure, module không hợp lệ exit 2; từ PL-107 có ghi report schema 3).

### PL-103 — Done

Tiêu chí: mỗi run ghi vào thư mục riêng, không ghi đè; failure.json schema 2 có provenance; replay từ chối schema thiếu/lạ (exit 2) và vẫn đọc schema 1; repro test xuất ra chạy được từ thư mục mới. Test: test/cli.test.ts.

### PL-104 — Done

Tiêu chí: lỗi công khai có nguồn + giấy phép đã kiểm; mã upstream nguyên bản trong vendor/ kèm NOTICE; PatchLab fail ở parent (đã rút gọn) và pass ở bản sửa; test chạy đúng chuỗi trong issue. Chi tiết: docs/CASE-001.md. Test: test/lockstore.test.ts.

### PL-105 — Review (benchmark xong; thiếu phản hồi người dùng thật)

Tiêu chí: benchmark xác định trên bản đúng/bản lỗi (docs/BENCHMARK.md, test/benchmark.test.ts) — ĐÃ ĐẠT; ít nhất một lập trình viên ngoài dự án chạy thử theo README và phản hồi được ghi trong docs/FEEDBACK.md — CHƯA ĐẠT. Chỉ chuyển Done khi có phản hồi thật.

## Theo dõi sau bàn giao

### PL-106 — Review: đồng bộ tài liệu và hướng dẫn học

Tiêu chí: SPEC/ARCHITECTURE/PRODUCT khớp implementation; số target benchmark chính xác; hướng dẫn mới dùng lệnh/kết quả đã chạy; giữ trạng thái phản hồi thật chưa có. Code không đổi. Đã đối chiếu 24 test, demo, hai store và benchmark 500 seed trên Windows. Chờ tích hợp nhánh docs/PL-106-handoff-learning.

### PL-107 — Review: report và replay cho adapter ngoài

Ưu tiên P1, phụ thuộc PL-102/103/104. Đây là khoảng thiếu của MVP, không phải chỉ thêm tính năng phụ.

- check-module/check-store lưu report riêng từng run với contract, seed, cấu hình, chuỗi rút gọn, nguồn adapter và hash nguồn để phát hiện thay đổi.
- Replay dùng đúng contract và adapter được người dùng chỉ định rõ; report không được tự lựa chọn và thực thi đường dẫn mã tùy ý.
- Report thiếu/sai schema, contract hoặc metadata trả exit 2 với thông báo rõ; tương thích report cũ được kiểm tra.
- Regression xuất ra chạy được trên target; test chứng minh bản lỗi fail/bản sửa pass và hai run không ghi đè.
- Mã ngoài vẫn phải đáng tin cậy; chưa tuyên bố sandbox. Quy định rõ hash bao phủ adapter hay cả dependency, không hứa hơn implementation.
- Trước code cập nhật thiết kế report trong SPEC; sau code chạy verify và test CLI, cập nhật tài liệu.

### PL-108 — Review: đo thời gian benchmark

Ưu tiên P2. Hoàn thiện tiêu chí thời gian trong PRODUCT: tách thời gian thực thi và rút gọn, ghi môi trường/phiên bản, không assert thời gian chính xác trong test. Đã triển khai --timing với hai cột Check ms/Shrink ms và môi trường; test mọi target có số đo hữu hạn. Không dùng timing làm cam kết tốc độ chung.

## Kết quả phiên portfolio 20/11/2026

PL-107 và PL-108 đã đạt phần triển khai/test local trên feat/portfolio-ready. PL-109 (Review): gói showcase, HTML evidence, README/CV/changelog. Test toàn bộ gồm 30 trường hợp. PL-105 vẫn chưa Done vì không có feedback thật. PL-106 vẫn Review do nhánh chưa merge. CI cần kiểm tra theo commit mới; không suy từ lần trước.
