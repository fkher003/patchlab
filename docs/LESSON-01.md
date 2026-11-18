# Buổi 1 — Một request hay một lần gửi?

Mục tiêu: phân biệt một yêu cầu nghiệp vụ với những lần truyền lại yêu cầu đó. Dành khoảng 45–60 phút. Không cần tự gõ toàn bộ source; cần dự đoán, chạy và tự giải thích được kết quả.

## 1. Dự đoán trước khi chạy

Đơn hàng đã thu 100.000 đồng. Gửi `refund('a', 30.000)` hai lần.

Viết câu trả lời vào một file ghi chú riêng:

1. Tổng hoàn cuối cùng phải là bao nhiêu? Vì sao?
2. Nếu lần thứ hai dùng ID `b`, kết quả khác thế nào?
3. Nếu lần thứ hai vẫn ID `a` nhưng số tiền là 40.000, phải làm gì?
4. Nếu lần đầu hoàn đủ 100.000, lần retry có bị từ chối vì hết số dư không?

## 2. Chạy và quan sát

Chạy `npm run demo`. So sánh dự đoán với hai dòng buggy/fixed. Sau đó chạy `npm test`.

Toàn bộ test xanh không có nghĩa bản buggy đúng: có test cố ý xác nhận checker bắt được buggy. Mở test đầu tiên để thấy một ca hoàn tiền bình thường không phân biệt được hai bản.

## 3. Đọc phần code nhỏ nhất

Mở `src/refunds.ts`. Theo dõi `refunded` và `accepted` sau mỗi bước. Tìm điều kiện khiến bản buggy không nhận ra retry.

<details>
<summary>Lời giải — chỉ mở sau khi đã dự đoán</summary>

Cùng ID và số tiền là cùng một yêu cầu đã thành công: tổng hoàn giữ ở 30.000. ID mới là yêu cầu mới, tổng có thể thành 60.000. Cùng ID nhưng khác số tiền là conflict. Kiểm tra ID thành công phải diễn ra trước kiểm tra số dư, nếu không retry sau khi hoàn hết tiền bị trả sai trạng thái.

</details>

## 4. Để công cụ tìm chuỗi lỗi

Chạy `npm run check:buggy`. Exit code 1 ở đây là dự kiến. Mở `reports/<run>/failure.json`, đọc seed, số thao tác ban đầu, chuỗi đã rút gọn và rule bị vi phạm.

Chạy `npm run replay -- reports/<run>/failure.json buggy`, rồi đổi `buggy` thành `fixed`. Cuối cùng chạy `node --test reports/<run>/repro.test.ts`.

Tự giải thích: seed dùng để làm gì? Vì sao lưu cả chuỗi thao tác giúp replay ngay cả khi generator thay đổi? Vì sao service phải được tạo mới mỗi lần thử xóa một thao tác?

## 5. Bài tập bạn tự làm

Thêm test vào `test/patchlab.test.ts`: ID `a` hoàn 60.000 thành công; ID `b` hoàn 50.000 bị từ chối; ID `c` hoàn 40.000 thành công. Kiểm tra cả status và tổng tiền sau từng bước. Chạy `npm test`.

Sau đó giải thích bằng lời: tại sao chỉ kiểm tra tổng tiền cuối cùng có thể bỏ sót lỗi ở bước giữa?

Nếu dùng AI, yêu cầu nó gợi ý một bước hoặc review test bạn vừa viết trước khi xin lời giải đầy đủ.

## 6. Thử thách đọc code review

Một service luôn trả `exceeds-balance` và giữ tổng bằng 0 từng qua checker chỉ kiểm thuộc tính an toàn. Checker hiện đã có model tham chiếu. Đọc src/model.ts và test/model.test.ts để chỉ ra điều kiện bắt lỗi này. Vì sao model vẫn cần được kiểm tra bằng ví dụ độc lập?

## Điều kiện hoàn thành buổi học

Bạn giải thích được idempotency, chạy lại được một lỗi, thêm được một test và chỉ ra ít nhất một giới hạn của PatchLab. Gửi câu trả lời hoặc phần code bạn sửa để được review trước khi sang buổi 2.
