# PatchLab

**Tìm lỗi logic bằng chuỗi thao tác, rút gọn phản ví dụ và xuất bằng chứng chạy lại được.**

PatchLab là developer tool viết bằng TypeScript/Node.js. Nó đối chiếu hành vi hoàn tiền với model tham chiếu và kiểm tra quy tắc kho khóa idempotency. Có ca tái hiện lỗi công khai của hono-idempotency, adapter module ngoài, báo cáo JSON/HTML và test regression tự xuất.

Trạng thái v0.2.0: bản portfolio chạy được, chưa có phản hồi người dùng ngoài dự án. Không phải công cụ chứng minh đúng mọi chương trình hay AI reviewer tổng quát. Lỗi upstream là lỗi đã công khai được tái hiện, không phải phát hiện mới của tác giả PatchLab.

## Demo trong một lệnh

Node theo .node-version (tối thiểu 24.12), npm. Không cần API key hoặc tài khoản dịch vụ.

    npm ci
    npm run verify
    npm run showcase

Trên PowerShell dùng npm.cmd nếu npm.ps1 bị execution policy chặn. Không cần thay execution policy.

Showcase tự chạy bốn bước, không cần điền tên thư mục report:

1. Chạy mã upstream trước bản sửa: FAIL processing-key-lost.
2. Rút chuỗi từ 30 xuống 4 thao tác và lưu report/test/HTML.
3. Replay cùng chuỗi trên bản lỗi, rồi so với bản sửa: bản lỗi FAIL, bản sửa PASS.
4. Chạy test được xuất ra trên bản sửa: PASS. Báo cáo nằm trong reports/ và được giữ lại.

[Xem báo cáo HTML mẫu](docs/evidence/case001-report.html) (tải về rồi mở trong trình duyệt), [nguồn ca lỗi](docs/CASE-001.md), [kịch bản demo 90 giây](docs/DEMO.md).

## Ví dụ lỗi được tìm

Kho maxSize=2: lock k2 → lock k3 → lock k4 → get k2. Bản cũ loại k2 dù vẫn processing. Điều đó có thể cho phép yêu cầu lặp chạy lại trong khi yêu cầu đầu đang xử lý. PatchLab tìm được chuỗi vi phạm; nó không khẳng định một giao dịch tiền thật đã xảy ra.

## Kiểm tra module của bạn

Module cần xuất create theo [contract](docs/SPEC.md). Chỉ nạp module tin cậy: mã chạy với quyền người dùng, chưa có sandbox hoặc timeout cho từng thao tác.

    npm run check-module -- test/fixtures/reject-adapter.mjs 42
    npm run check-store -- examples/hono-parent.mjs 42

Khi có lỗi, CLI in đường dẫn failure.json, repro.test.ts và report.html. Mỗi run dùng thư mục riêng. Tên module và SHA-256 của file adapter được ghi vào provenance; hash chưa bao phủ các dependency được import.

Để chạy lại, thay REPORT bằng đường dẫn failure.json vừa in:

    npm run replay-external -- REPORT examples/hono-parent.mjs
    npm run replay-external -- REPORT examples/hono-fixed.mjs --allow-changed

Report không tự chọn mã thực thi. Bạn phải chỉ định adapter. Mặc định khác hash sẽ bị từ chối trước import; --allow-changed dùng khi cố ý so bản sửa.

Test xuất ra yêu cầu PATCHLAB_ADAPTER trỏ tới adapter tin cậy. Khi thử bản sửa khác hash, đặt PATCHLAB_ALLOW_CHANGED=1. Showcase tự thiết lập các biến này chỉ cho tiến trình con.

## Lệnh và exit code

| Lệnh                                      | Mục đích                                                |
| ----------------------------------------- | ------------------------------------------------------- |
| npm run demo                              | Ví dụ hoàn tiền mô phỏng đơn giản                       |
| npm run showcase                          | Ca upstream end-to-end, xuất báo cáo và chạy regression |
| npm run check:buggy / check:fixed         | Service hoàn tiền mẫu                                   |
| npm run replay -- REPORT buggy hoặc fixed | Replay report builtin schema 1/2                        |
| npm run replay-external -- REPORT ADAPTER | Replay report external schema 3                         |
| npm run benchmark -- 500                  | Kết quả xác định theo seed, 5 target                    |
| npm run benchmark:timing                  | Thêm thời gian check/shrink và môi trường               |
| npm run verify                            | Typecheck strict, Prettier, toàn bộ test                |

Exit 0 = chưa thấy vi phạm trong phạm vi chạy; 1 = tìm vi phạm; 2 = tham số/report/module không hợp lệ. Demo/showcase trả 0 khi các kết quả mong đợi đều đúng, kể cả khi target buggy trả FAIL.

## Bằng chứng và giới hạn

Benchmark 500 seed/target: refund buggy 499 chuỗi có lỗi, always-reject 500, upstream parent 431; hai target đã sửa không báo vi phạm trong tập này. Một chuỗi upstream cụ thể rút từ 30 xuống 4 thao tác. Xem [phương pháp và thời gian đo](docs/BENCHMARK.md).

- 31 test ở bản chuẩn bị v0.2.0, gồm CLI, model, adapter contract, hash/metadata, regression export, showcase end-to-end và timing. Lệnh verify là bằng chứng hiện hành nếu số test thay đổi.
- Một lỗi công khai, hai bản lỗi hoàn tiền mô phỏng; không suy rộng tỷ lệ phát hiện ra mọi phần mềm.
- Shrinker chỉ đạt mức không thể bỏ riêng một thao tác nữa, không bảo đảm tối thiểu toàn cục.
- Chưa kiểm TTL, crash, concurrency, database thật hoặc code không tin cậy.
- Model có thể sai; giữ test ví dụ độc lập. PASS không phải chứng minh đúng hoàn toàn.
- Report/repro giữ các tham chiếu tới source project. Giữ checkout kèm báo cáo; không coi riêng file test là một package độc lập.

## Kiến trúc

CLI → generator có seed → checker/model → adapter → chuỗi lỗi → shrinker → JSON + HTML + regression → replay.

src/model.ts mô tả kết quả hoàn tiền kỳ vọng; checker.ts quan sát service; lockstore.ts kiểm quy tắc khóa; external-report.ts validate dữ liệu, hash nguồn, export/replay; benchmark.ts đo tập thử. Chi tiết ở [ARCHITECTURE](docs/ARCHITECTURE.md).

## Học và cộng tác

[Hướng dẫn 15 phút](docs/QUICKSTART-LEARNING.md) · [Buổi học 1](docs/LESSON-01.md) · [Buổi học 2](docs/LESSON-02.md) · [SPEC](docs/SPEC.md) · [BACKLOG](docs/BACKLOG.md) · [STATUS](docs/STATUS.md) · [Nội dung CV](docs/CV.md).

AI tiếp tục đọc AGENTS.md và STATUS.md, kiểm tra Git trước khi sửa. Một AI ghi checkout tại một thời điểm. Repository giữ private; nhà tuyển dụng không tự truy cập được link private — cung cấp demo hoặc quyền truy cập phù hợp khi bạn quyết định chia sẻ.

Mã upstream MIT được giữ trong vendor/hono-idempotency với LICENSE và NOTICE. PatchLab không liên kết với dự án upstream. Chưa gửi thông báo hoặc PR cho họ.
