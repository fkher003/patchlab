# Trạng thái bàn giao PatchLab

Cập nhật: 18/11/2026, Asia/Saigon. File này được thay nội dung hiện tại sau mỗi phiên; lịch sử nằm trong Git.

## Phiên và checkout

- Trạng thái: Handoff ready.
- AI bàn giao: Antigravity. Không giữ ticket đang làm.
- Local: D:/Projects/patchlab.
- Nhánh làm việc: feat/PL-104-public-bug-repro, merge fast-forward vào main và push theo quyền người dùng cấp. Dùng git log để biết commit.
- PR #1 không được merge qua giao diện; nội dung đã vào main bằng git. Có thể bị GitHub đánh dấu đóng/merged; kiểm tra bằng git log origin/main.

## Đã có

Prototype hoàn tiền tuần tự (buggy/fixed), generator có seed, checker so với model tham chiếu src/model.ts (PL-101), rút gọn, xuất test, replay. PL-102: src/adapter.ts + lệnh `npm run check-module -- file.mjs [seed]` kiểm module ngoài theo contract trong docs/SPEC.md; module ném lỗi hoặc trả sai hình dạng thành failure (service-threw, contract-violation). PL-103: mỗi run ghi reports/<run>/ riêng (failure.json schema 2 + provenance, repro.test.ts); replay nhận schema 1 hoặc 2, khác thì exit 2. PL-104: lỗi công khai paveg/hono-idempotency#89 (MIT) tái hiện trên mã upstream nguyên bản trong vendor/: `npm run check-store -- examples/hono-parent.mjs` fail (30→4 thao tác), hono-fixed.mjs pass; chi tiết docs/CASE-001.md. PL-001..104 = Done (đã vào main).

## Kiểm chứng

- npm run verify (typecheck, prettier, test) qua, 22/22 test trước khi merge PL-104.
- CI GitHub Windows/Linux chưa quan sát sau các lần merge này; kiểm tra tab Actions của repo. Chỉ self-review. Trên Windows PowerShell dùng npm.cmd/npx.cmd.

## Việc tiếp theo — PL-105 (Planned, cần tiêu chí cụ thể)

Benchmark bản lỗi/bản đúng (có thể làm: bảng tỉ lệ phát hiện theo số seed cho refund buggy và hono-parent, thời gian chạy) và phản hồi người dùng thử (cần người thật; không bịa phản hồi). Trước khi code: ghi tiêu chí trong BACKLOG, chuyển Ready. Việc nên làm thêm cho CV: README giới thiệu ngắn có kết quả, theo dõi CI Actions xanh, cân nhắc gửi issue/ghi chú cho upstream (chưa làm). check-module/check-store chưa ghi report. Thư mục reports/ là của người dùng, đừng xóa.

## Điểm cần giữ rõ

- Model cùng tác giả với đặc tả có thể sai giống service: giữ test ví dụ viết tay.
- Nạp module ngoài = chạy mã với quyền người dùng; chưa sandbox.
- Chỉ một lỗi công khai được tái hiện (CASE-001); chưa có người dùng thật. Mã vendor/ là bản sao nguyên bản MIT, không sửa.
- Người dùng muốn nhanh để đưa vào CV nhưng phải hiểu project; người dùng báo "chưa hiểu gì": giải thích đơn giản, từng bước, lấy ví dụ cụ thể.
