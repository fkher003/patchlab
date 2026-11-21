# Buổi 2 — Từ lỗi công khai đến bằng chứng tái hiện (CASE-001 & Schema 3)

Mục tiêu: hiểu và tự giải thích được phần cốt lõi nhất của PatchLab v0.2.0 khi trình bày trong CV hoặc phỏng vấn kỹ thuật — cách công cụ tìm lỗi trên mã upstream thật (`hono-idempotency#89`), rút gọn chuỗi 30 thao tác xuống 4 bước, kiểm tra SHA-256 trước khi replay và xuất regression test.

## 1. Dự đoán trước khi đọc code

Giả sử bạn có một kho khóa (`memoryStore`) giới hạn tối đa `maxSize = 2` bản ghi trong bộ nhớ để chống xử lý trùng request:

- Khi một request bắt đầu xử lý, hệ thống gọi `lock(key)` và lưu trạng thái `status: 'processing'`.
- Khi request xử lý xong, hệ thống gọi `complete(key)` để đổi trạng thái sang `status: 'completed'`.
- Khi số bản ghi vượt quá `maxSize = 2`, kho phải xóa bớt bản ghi cũ để giải phóng chỗ.

Hãy tự trả lời trước khi mở file:

1. Nếu cả `k2` và `k3` đều đang `processing` (chưa hoàn tất), rồi `k4` gọi `lock('k4')`, điều gì xảy ra nếu kho xóa bản ghi cũ nhất (`k2`) mà không kiểm tra `status`?
2. Nếu một bản ghi đã `completed` bị xóa khi kho đầy, điều đó có vi phạm quy tắc bảo vệ request đang xử lý không?

## 2. Chạy luồng showcase và đối chiếu hai commit upstream

Chạy:

```powershell
npm.cmd run showcase
```

Quan sát 4 bước trên màn hình rồi mở song song hai file trong `vendor/hono-idempotency/`:

- `vendor/hono-idempotency/memory.parent.ts` (commit `dc5c675`, trước bản sửa)
- `vendor/hono-idempotency/memory.fixed.ts` (commit `28e0f9e`, PR #98)

Tìm vòng lặp `while (map.size > maxSize)` trong hàm `lock`:

- Ở `memory.parent.ts`: lấy `map.keys().next().value` và `map.delete(oldest)` bất kể bản ghi đó đang `processing` hay `completed`.
- Ở `memory.fixed.ts`: duyệt qua `map`, chỉ xóa bản ghi có `r.status !== "processing"`. Nếu mọi bản ghi trong kho đều đang `processing` (`!evicted`), thoát vòng lặp để không làm mất khóa đang chạy.

## 3. Hiểu thuật toán rút gọn (1-minimal shrinking)

Mở `src/lockstore.ts` (hàm `minimizeStoreOps`) hoặc `src/checker.ts` (hàm `minimize`):

- Generator sinh 30 thao tác từ `seed = 42`. Chuỗi 30 bước tìm ra lỗi `processing-key-lost`, nhưng rất khó đọc bằng mắt.
- Shrinker thử xóa từng thao tác tại vị trí `index`. Nếu chuỗi ngắn hơn **vẫn gây ra đúng cùng `failure.rule`** (`processing-key-lost`), nó giữ chuỗi ngắn hơn và quay lại `index = 0`.
- Kết quả dừng ở 4 bước: `lock k2` → `lock k3` → `lock k4` → `get k2`. Nếu xóa bất kỳ bước nào trong 4 bước này, lỗi `processing-key-lost` biến mất.

> **Điểm cần nhớ khi phỏng vấn:** Đây là rút gọn tham lam xóa đơn lẻ (_1-minimal_), không bảo đảm luôn tìm được chuỗi ngắn nhất toàn cục nếu cần xóa đồng thời 2 thao tác phụ thuộc nhau.

## 4. Vì sao `replay-external` kiểm tra SHA-256 và không tự chạy đường dẫn trong report?

Mở `src/external-report.ts` (hàm `validateExternalReport` và `replayExternal`):

1. **Report là dữ liệu, không phải quyền thực thi:** Nếu `failure.json` chứa đường dẫn file và công cụ tự `import()` đường dẫn đó, một file report tải từ nơi khác có thể trỏ tới module độc hại. Do đó người dùng phải truyền rõ đường dẫn adapter tin cậy trên dòng lệnh (`replay-external REPORT ADAPTER`) hoặc qua `PATCHLAB_ADAPTER`.
2. **Kiểm tra dữ liệu và SHA-256 trước khi `import()`:** Công cụ validate schema 3 và đối chiếu mã băm SHA-256 của file adapter trước khi nạp module. Nếu file adapter đã thay đổi mà không có `--allow-changed`, công cụ từ chối ngay ở bước kiểm tra hash (exit 2) trước khi top-level code của module chạy.
3. **Giới hạn trung thực:** SHA-256 chỉ băm file adapter đầu vào (`scope: "entry-file-only"`), không băm toàn bộ cây dependency mà adapter đó `import`.

## 5. Bốn câu hỏi phỏng vấn thực hành

Hãy thử tự trả lời miệng trong 60 giây cho mỗi câu:

1. **Model-based vs Property-based:** Vì sao một service hoàn tiền luôn trả `exceeds-balance` (từ chối mọi yêu cầu) lại vượt qua được các kiểm tra an toàn số dư nhưng bị bắt bởi `src/model.ts`?
2. **Preserving failure rule during shrinking:** Khi rút gọn chuỗi lỗi, tại sao điều kiện giữ lại chuỗi con phải là `check(...)?.rule === failure.rule` thay vì chỉ cần `check(...) !== null`?
3. **Deterministic seed vs Saved sequence:** Nếu sau này bạn sửa hàm `generateStoreOps`, việc có `seed: 42` có đủ để tái hiện đúng lỗi cũ không? Vì sao `failure.json` phải lưu cả mảng `operations` đã rút gọn?
4. **Meaning of 86.2% in benchmark:** Trong `docs/BENCHMARK.md`, target `hono-idempotency memoryStore parent` bị phát hiện ở 431/500 seed (86,2%). Con số này nói lên điều gì về bộ sinh (`maxSize=2`, 5 khóa `k0..k4`, 30 bước) và tại sao không được viết vào CV rằng "PatchLab phát hiện 86,2% lỗi phần mềm"?
