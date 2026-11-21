# Hiểu PatchLab trong 15 phút

PatchLab là một chương trình thử nhiều chuỗi thao tác để tìm trường hợp một quy tắc bị phá vỡ. Bạn đang học cách kiểm tra phần mềm, không cần hiểu hết source trong lần đầu.

## 1. Mở đúng thư mục và xem lỗi mô phỏng

Trong PowerShell: cd D:\Projects\patchlab, rồi chạy npm.cmd run demo.

Kết quả đã chạy ngày 18/11/2026:

    buggy: FAIL successful-retry-changed-result; refunded=60000
    fixed: PASS; refunded=30000

Một yêu cầu hoàn 30.000 được gửi hai lần với cùng mã. Bản buggy hoàn thêm lần nữa, bản fixed nhận ra yêu cầu cũ. Đây là lỗi được cố tình tạo để học, không phải lỗi lấy từ người dùng thật.

## 2. Xem ca mã nguồn upstream đã lưu trong repo

Chạy npm.cmd run check-store -- examples/hono-parent.mjs. Lệnh trả FAIL, exit code 1 là dự kiến. Với seed mặc định, chuỗi 30 thao tác được rút xuống:

1. lock k2: đánh dấu yêu cầu k2 đang xử lý.
2. lock k3: thêm một yêu cầu đang xử lý khác.
3. lock k4: kho giới hạn maxSize=2, bản parent loại k2 dù nó còn đang xử lý.
4. get k2: không tìm thấy khóa. Checker báo processing-key-lost.

Nguy cơ là hệ thống có thể nhận lại k2 như yêu cầu mới. Ca này chỉ chứng minh khóa bị mất trong store; không chứng minh đã có khách hàng thực sự bị trừ tiền hai lần.

Chạy npm.cmd run check-store -- examples/hono-fixed.mjs. Kết quả: PASS trong 100 chuỗi × 30 thao tác. Chi tiết nguồn/version ở CASE-001.md. Bạn đang tái hiện lỗi đã công khai, không tự nhận là người đầu tiên phát hiện.

## 3. Hiểu công cụ làm gì

- Generator: tạo danh sách thao tác từ một seed để có thể tạo lại cùng đầu vào.
- Checker: theo dõi điều kiện phải đúng, ví dụ khóa đang xử lý phải còn tồn tại.
- Shrinker: thử bỏ từng thao tác, giữ lại chuỗi ngắn hơn vẫn có cùng loại lỗi.
- Adapter: nối API của module cần thử với contract PatchLab hiểu.

Hãy lần lượt mở examples/hono-parent.mjs, src/lockstore.ts, test/lockstore.test.ts. Chưa cần đọc toàn bộ vendor/ hoặc cli.ts.

## 4. Đọc benchmark đúng nghĩa

Chạy npm.cmd run benchmark -- 500. Với bản kho khóa parent: 431/500 chuỗi tìm được vi phạm. 69 chuỗi còn lại không tìm ra; chúng không chứng minh bản parent đúng. Con số 86,2% chỉ áp dụng bộ sinh và target này, không có nghĩa PatchLab bắt được 86,2% mọi lỗi phần mềm.

Chạy npm.cmd run verify để kiểm tra chính PatchLab. Test xanh và dòng FAIL của bản buggy không mâu thuẫn: một test đúng có thể yêu cầu công cụ phải phát hiện buggy.

## 5. Một câu hỏi tự kiểm tra

Nếu sau lock k2 ta hoàn tất k2 trước khi kho đầy, việc loại k2 còn vi phạm quy tắc đang kiểm tra không? Dự đoán trước khi xem checkStore: quy tắc hiện chỉ bảo vệ khóa còn processing, không khẳng định mọi bản ghi completed phải giữ mãi.

Kết thúc: bạn cần giải thích được target, quy tắc, chuỗi gây lỗi và giới hạn của PASS. Không cần thuộc source. Hướng dẫn này hỗ trợ chủ dự án học; không được ghi thành phản hồi của người dùng ngoài dự án trong FEEDBACK.md.
