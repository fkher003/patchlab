# Nội dung CV dựa trên bằng chứng

## Phiên bản tiếng Việt

**PatchLab — công cụ kiểm chứng logic và tạo test tái hiện** | TypeScript, Node.js, GitHub Actions | Dự án cá nhân có AI hỗ trợ

- Phát triển công cụ sinh chuỗi thao tác theo seed, đối chiếu model tham chiếu và rút gọn phản ví dụ cho logic hoàn tiền/kho khóa.
- Tái hiện lỗi công khai hono-idempotency #89 trên mã upstream; rút một chuỗi 30 thao tác xuống 4 bước và đối chiếu với bản sửa.
- Xây luồng xuất báo cáo JSON/HTML, provenance SHA-256 cho file adapter, replay và regression test; bổ sung kiểm tra contract và report đầu vào.

Chọn 2–3 gạch đầu dòng phù hợp vị trí. Có thể thêm số test/CI sau khi kiểm tra kết quả commit thực tế, không dùng số cũ khi code đã thay đổi.

## English version

**PatchLab — Model-based logic testing and reproducible failure reports** | TypeScript, Node.js, GitHub Actions | Personal project with AI assistance

- Built seeded sequence checks, a reference model, and counterexample reduction for refund and idempotency-store logic.
- Reproduced public hono-idempotency issue #89 against pinned upstream code, reducing a 30-operation failure to four steps and validating the fixed version.
- Implemented JSON/HTML reports, adapter entry-file SHA-256 provenance, explicit-target replay, and executable regression-test export.

## Những gì không được nhận là thành tích

Chưa có người dùng thật, doanh thu, triển khai production, phát hiện zero-day hoặc đóng góp upstream được chấp nhận. 86,2% là số chuỗi chạm lỗi trong một tập sinh cụ thể, không phải độ chính xác chung. Chưa có bằng chứng người dùng hiểu toàn bộ code, nên cần chuẩn bị phần giải thích trước khi phỏng vấn.

Repo đang private. Không chỉ đặt link private rồi kỳ vọng recruiter đọc được; có thể cung cấp video demo, ảnh report hoặc quyền truy cập khi phù hợp. Không tự đổi repo public.
