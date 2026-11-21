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

Checker hiện so sánh status và tổng hoàn với src/model.ts, nên bắt được service luôn từ chối yêu cầu hợp lệ (PL-101). Model và checker vẫn có thể hiểu sai đặc tả hoặc bỏ sót đầu vào; giữ test ví dụ độc lập và không coi PASS là chứng minh đúng hoàn toàn.

## Adapter cho module bên ngoài (PL-102)

`npm run check-module -- đường/dẫn/module.mjs [seed]` nạp một ES module có `export function create(paid)` trả về dịch vụ mới ở mỗi lần gọi: `{ refund({id, amount}) -> {status}, total() -> number }`, đồng bộ, tuần tự. `status` phải thuộc accepted, invalid, conflict, exceeds-balance. Checker xử lý module ném lỗi (service-threw) hoặc trả sai hình dạng (contract-violation) như một lỗi kiểm chứng, không làm crash. Exit: 0 không thấy lỗi trong 100 chuỗi, 1 có lỗi (in chuỗi đã rút gọn), 2 module/tham số sai.

Giới hạn: nạp module là chạy mã của nó với quyền của bạn; chỉ dùng mã tin cậy. Khi tìm lỗi, xuất report schema 3 và regression test (PL-107). Chưa hỗ trợ async/đồng thời.

## Report (PL-103)

Mỗi lần `check` tìm thấy lỗi ghi `reports/<run>/failure.json` và `repro.test.ts`; `<run>` = thời gian UTC + variant + seed + 6 ký tự hex ngẫu nhiên, nên không ghi đè lần trước. `failure.json` có `schema: 2`, `provenance: { tool, version, runId, createdAt, source }`, cùng seed, paid, chuỗi đã rút gọn và failure. `replay` nhận schema 1 (cũ, không provenance) và 2; thiếu hoặc khác schema thì exit 2. `check-module`/`check-store` dùng report schema 3, mô tả ở phần tiếp theo.

## Contract kho khóa (PL-104)

`npm run check-store -- file.mjs [seed]` nạp ES module có `export function create({ maxSize })` trả về store bất đồng bộ { get, lock, complete, delete }. Quy tắc và giới hạn: docs/CASE-001.md. Exit 0 / 1 (in chuỗi rút gọn) / 2 như check-module. Xuất report schema 3 khi có vi phạm.

## External report schema 3 (PL-107)

check-module và check-store xuất failure.json, repro.test.ts và report.html vào thư mục riêng được tạo bằng mkdtemp. Report chứa contract, config (paid/maxSize), seed, operations đã rút gọn, originalLength, failure và provenance (tool/version/time/runId, tên adapter và SHA-256). Hash chỉ bao phủ file adapter đầu vào, không bao phủ dependency nhập vào.

replay-external yêu cầu report và đường dẫn adapter tin cậy do người dùng chọn rõ. Validate dữ liệu và hash trước import. Khác hash mặc định exit 2; --allow-changed là lựa chọn rõ ràng để thử bản sửa. Report không tự chọn mã để chạy. Regression test yêu cầu PATCHLAB_ADAPTER; PATCHLAB_ALLOW_CHANGED=1 cho phép bản sửa khác hash. Report HTML tĩnh, escape dữ liệu, không script. Report cũ schema 1/2 vẫn dùng lệnh replay cho builtin.

Benchmark --timing thêm thời gian check và shrink; generator không tính trong check, thời gian includes model/service creation, không warmup. Counts giữ xác định; timing thay đổi theo môi trường.
