# Đặc tả hoàn tiền phiên bản 0.1

Đây là bài toán mô phỏng để học kiểm chứng, không phải dịch vụ thanh toán thật.

- Một phiên kiểm tra có đúng một đơn hàng. Số tiền đã thu là số nguyên an toàn không âm, đơn vị đồng.
- Yêu cầu gồm `id` (chuỗi không rỗng sau khi trim) và `amount` (số nguyên an toàn lớn hơn 0). ID được so sánh nguyên văn, không tự trim hoặc đổi hoa thường.
- Dữ liệu không hợp lệ trả `invalid`, không thay đổi trạng thái.
- ID đã thành công và cùng số tiền: trả `accepted`, không hoàn thêm, kể cả khi số dư đã hết.
- ID đã thành công nhưng số tiền khác: trả `conflict`, không thay đổi trạng thái.
- ID mới có số tiền lớn hơn số dư: trả `exceeds-balance`, không thay đổi trạng thái.
- ID mới hợp lệ và đủ số dư: tăng tổng hoàn đúng số tiền và ghi nhận ID thành công.
- Chỉ lưu ID thành công. Một yêu cầu từng bị từ chối không chiếm ID. Đây là lựa chọn của bài tập, không phải quy tắc chung cho mọi API.
- Các thao tác chạy tuần tự trong một tiến trình. Chưa có database, request đồng thời, crash, timeout hoặc lưu trữ bền vững.

## Các tính chất đang kiểm tra

Tổng hoàn nằm trong [0, tiền đã thu]; từ chối không thay đổi tổng hoàn; lần thành công mới tăng đúng số tiền; retry thành công không tăng tiền; ID thành công không được đổi số tiền.

Bộ checker chưa là đặc tả đầy đủ: ví dụ một service luôn từ chối các yêu cầu hợp lệ có thể qua một số kiểm tra tính chất. Các test ví dụ giúp bổ sung nhưng cũng không chứng minh đúng hoàn toàn. Bài học tiếp theo là xây mô hình tham chiếu để kiểm tra cả trường hợp phải chấp nhận.
