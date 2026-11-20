# Changelog

## 0.2.0 — 20/11/2026, bản portfolio trên nhánh feat/portfolio-ready

- External schema 3 cho refund/store, báo cáo JSON + HTML tĩnh + regression test.
- Replay bắt buộc adapter do người dùng chỉ định, kiểm tra metadata và hash trước import; tùy chọn so bản sửa.
- Kiểm tra kiểu dữ liệu đầu ra store/refund (`total()` không phải số nguyên an toàn hoặc `create()` trả sai contract trả đúng lỗi) và trạng thái processing; từ chối report có chuỗi thao tác rỗng; giới hạn count generator.
- Benchmark timing tách check/shrink (hỗ trợ cả `benchmark --timing` và `benchmark [n] --timing`), ghi môi trường; test counts vẫn xác định.
- Showcase một lệnh (được kiểm thử tự động trong thư mục tạm), HTML evidence hiển thị chi tiết lỗi/cấu hình, hướng dẫn demo, CV và tài liệu học Buổi 2 (`docs/LESSON-02.md`).

Chưa có feedback người dùng ngoài; chưa sandbox/timeout thao tác adapter; chưa phát hành npm hoặc public repository. Chỉ đánh dấu tích hợp main khi đã merge thực tế.
