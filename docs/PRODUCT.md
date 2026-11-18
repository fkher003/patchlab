# Định nghĩa sản phẩm

## Mục tiêu

PatchLab giúp lập trình viên tạo bằng chứng tái hiện khi logic trạng thái vi phạm quy tắc đã khai báo. Mục tiêu cá nhân của dự án là tạo portfolio có thể kiểm tra và giúp tác giả học cách đặc tả, kiểm thử, debug và review code AI. Không hứa hẹn việc làm hoặc khả năng kiểm chứng mọi chương trình.

## Người dùng đầu tiên và giả thuyết

Người dùng mục tiêu: developer hoặc test automation engineer sửa logic đơn hàng/hoàn tiền. Họ cần biết một bản sửa có phá quy tắc nghiệp vụ không và cần test đủ nhỏ để debug. Chưa có phỏng vấn người dùng hoặc triển khai thực tế; đây là giả thuyết sản phẩm cần xác nhận bằng thử nghiệm với người ngoài.

## Luồng sử dụng MVP

1. Developer cung cấp adapter TypeScript cho module đáng tin cậy chạy cục bộ, theo contract đã tài liệu hóa.
2. Chọn bộ quy tắc, seed và ngân sách thử nghiệm.
3. Công cụ tạo chuỗi thao tác, quan sát kết quả và tìm vi phạm.
4. Khi có lỗi: rút gọn nhưng giữ loại lỗi, lưu báo cáo và test chạy lại được.
5. Developer sửa module, chạy regression và đưa kiểm tra vào CI.

Đây là luồng đích, chưa hoàn thành end-to-end: adapter hoàn tiền và kho khóa đã có; report, regression export và replay hiện chỉ dành cho service mẫu. Kho khóa được thêm làm ca kiểm chứng upstream (CASE-001), không phải bộ kiểm chứng mọi loại store.

## Phạm vi MVP

- Một runtime Node/TypeScript, một miền hoàn tiền, thao tác tuần tự.
- Kiểm tra cả thuộc tính an toàn và kết quả theo mô hình tham chiếu.
- Kết quả gồm seed, phiên bản schema/công cụ, nguồn case, chuỗi lỗi và giới hạn phép thử.
- Một lệnh chạy lại; test được xuất sử dụng adapter thực tế đã chọn.
- Ít nhất một lỗi công khai đã xác minh nguồn và giấy phép được tái hiện.

Ngoài MVP: dashboard, tài khoản, thanh toán, tự sửa code bằng LLM, đa ngôn ngữ, chạy code không tin cậy trên server, chứng minh hình thức, race condition phân tán và database thật.

## Tiêu chí chấp nhận MVP

- Bản lỗi bị phát hiện, bản sửa vượt qua cùng test trên các ca benchmark đã ghi nguồn.
- Replay cùng chuỗi cho kết quả ổn định trên Windows và Linux trong CI.
- Có ca luôn từ chối yêu cầu hợp lệ để đánh giá điểm mù của checker.
- Có báo cáo số ca lỗi phát hiện / tổng ca, thời gian chạy, kết quả trên bản đúng và lỗi bỏ sót. Không suy rộng tỷ lệ từ bộ ca nhỏ ra mọi phần mềm.
- Một developer ngoài dự án thử theo README; ghi phản hồi thực, không dựng lời chứng thực.

## Quyết định phát hành

Chỉ gắn mốc MVP khi toàn bộ tiêu chí đạt. Bản hiện tại là prototype học tập; v0.1.0 trong package không đồng nghĩa sản phẩm hoàn thiện.

## Khoảng thiếu đã đối chiếu ngày 18/11/2026

- PL-107: báo cáo/provenance, replay và regression test cho adapter ngoài chưa có.
- PL-108: benchmark hiện đo số chuỗi vi phạm và shrink, chưa đo thời gian theo tiêu chí MVP.
- PL-105: chưa có phản hồi người dùng ngoài dự án.

Vì vậy, chưa đánh dấu MVP hoàn thành dù các ticket triển khai trước đã tích hợp main. PL-103 Done phản ánh phạm vi report của service mẫu đã kiểm tra, không đại diện mọi adapter.
