# Quy trình phát triển và học

## Một ticket đi qua những bước nào?

1. Xác định vấn đề: ví dụ đầu vào, kết quả hiện tại, kết quả mong đợi.
2. Làm rõ acceptance criteria và phạm vi; kiểm tra ticket đủ Ready.
3. Viết thiết kế ngắn: dữ liệu, quy tắc, trường hợp sai, cách kiểm tra.
4. Tạo nhánh, triển khai thay đổi nhỏ; thêm test chứng minh hành vi.
5. Chạy npm run verify, đọc diff và tự review logic, dữ liệu đầu vào, trường hợp lỗi.
6. Đẩy nhánh, mở PR theo template, xem CI và phản hồi review.
7. Chỉ merge khi tiêu chí đạt; cập nhật backlog, ghi bài học và demo kết quả.

## Vai trò trong dự án một người

Bạn là người chịu trách nhiệm hiểu yêu cầu và chấp nhận kết quả. AI hỗ trợ phân tích, code, test và phản biện. Đổi góc nhìn product/developer/reviewer giúp kiểm tra, nhưng không biến một người và AI thành review độc lập của công ty. Sau này xin review thật từ người ngoài.

## Definition of Ready

- Có vấn đề cụ thể, phạm vi, đầu vào/đầu ra và tiêu chí kiểm tra.
- Có quyết định về các trường hợp biên liên quan.
- Có ticket phụ thuộc hoặc ghi không có; người làm giải thích được ý định.

## Definition of Done

- Acceptance criteria đạt; test hành vi có ý nghĩa và npm run verify chạy qua.
- CI trên các môi trường đã chọn chạy qua, hoặc ghi rõ hạn chế chưa xác minh và chưa đánh dấu Done.
- Tài liệu và giới hạn cập nhật; không ghi tính năng dự kiến là đã có.
- Diff đã được đọc; PR ghi review thật hoặc self-review.
- Tích hợp main xong mới chuyển Done.

## Học trong mỗi ticket

Trước code: bạn dự đoán kết quả và giải thích quy tắc bằng lời. Trong code: đi theo một luồng dữ liệu từ input đến output. Sau code: tự sửa một test hoặc cài một lỗi nhỏ để quan sát bộ kiểm tra. Cuối ticket: trả lời ba câu — lỗi nào được ngăn, bằng chứng ở đâu, giải pháp còn bỏ sót gì?

Không cần nhớ từng dòng hoặc cấm AI sinh code. Nếu chưa giải thích được một thay đổi, giữ ticket ở Review và hỏi về phần chưa hiểu thay vì coi đã hoàn thành.

## Nhịp làm việc

Mỗi buổi chọn một kết quả nhỏ; cuối buổi ghi điều hoàn thành, vướng mắc và bước tiếp theo. Mỗi tuần demo một luồng chạy được và xem lại phạm vi. Chưa cần Scrum ceremony, nhiều nhánh môi trường hoặc microservices cho quy mô này.

## Bàn giao giữa các AI

Quy trình dùng chung nằm trong [AGENTS.md](../AGENTS.md); điểm tiếp tục nằm trong [STATUS.md](STATUS.md). Một AI thực hiện trọn ticket hoặc nhóm việc liên quan rồi cập nhật trạng thái. Self-review và kiểm tra tự động áp dụng thường xuyên; dành review độc lập cho logic rủi ro cao khi có quota. Bài tập giúp người dùng học nhưng không bắt buộc chờ câu trả lời trước mọi bước triển khai.
