# Trạng thái bàn giao PatchLab

Cập nhật 21/11/2026, Asia/Saigon.

## Phiên và checkout

- Trạng thái: Handoff ready — Antigravity đã hoàn thành PL-111 (bề mặt repo tiếng Anh, MIT LICENSE, README sạch cho nhà tuyển dụng) trên nhánh feat/portfolio-ready.
- Local: D:/Projects/patchlab. Nhánh feat/portfolio-ready; base 9e7dfa6 (PL-106), main trước đó db2d905.
- Người dùng yêu cầu hoàn thiện bản đưa vào CV trước, học sau. Không dừng công việc để giao bài tập.
- Không merge hoặc đổi quyền riêng tư repo. Tra git log lấy commit hiện tại.

## Đã thực hiện

- PL-107 (Codex, đã được Antigravity review độc lập): external-report.ts, schema 3 cho refund/store, provenance + entry-file hash, JSON/HTML/test export, explicit-target replay. Đổi adapter cần --allow-changed; metadata/hash được kiểm trước import. Report cũ 1/2 vẫn replay builtin.
- PL-108 (Codex, đã review): --timing thêm thời gian check/shrink, môi trường và test counts không đổi.
- PL-109 (Codex, đã review): npm run showcase chạy ca upstream end-to-end; README mới, DEMO.md, CV.md song ngữ, CHANGELOG và HTML evidence.
- PL-110 (Antigravity — review độc lập & hardening):
  - Sửa kiểm tra contract khi nạp `loadAdapter`/`loadStoreAdapter` để adapter trả `{}` từ `create()` trả exit 2 thay vì bị `checkStore` bắt thành `store-threw` (exit 1).
  - Bổ sung kiểm tra `Number.isSafeInteger` cho `before`/`after` từ `service.total()` trong `src/checker.ts`, trả `contract-violation` nếu `total()` trả kiểu sai trong JS.
  - Từ chối report có `requests: []` hoặc `operations: []` rỗng ở `replay` và `replay-external` (exit 2, ngăn PASS giả).
  - Hỗ trợ `benchmark --timing` không kèm `n`, chặn tham số số rỗng/khoảng trắng (`""`, `"   "`) và tham số thừa ở `demo`/`help`.
  - Hiển thị thêm `Config` và `Observed failure` trong HTML report (`renderReport` và `docs/evidence/case001-report.html`).
  - Cho phép `scripts/showcase.mjs` chạy trên `process.cwd()` và thêm test tự động chạy showcase trong thư mục tạm không chạm `reports/` của repo.
  - Bổ sung `docs/LESSON-02.md` cho lộ trình học sâu và ôn phỏng vấn sau khi hoàn thiện code.
- PL-111 (Antigravity — polish bề mặt repo cho CV/nhà tuyển dụng):
  - Viết lại `README.md` hoàn toàn bằng tiếng Anh, bổ sung badges, output thực tế từ `npm run showcase`, sơ đồ Mermaid kiến trúc, bảng benchmark và gỡ các liên kết tài liệu nội bộ (`STATUS.md`, `CV.md`, `LESSON-01/02`) khỏi README public.
  - Chuyển `CONTRIBUTING.md` và `CHANGELOG.md` sang tiếng Anh.
  - Thêm file `LICENSE` (MIT) ở thư mục gốc.
- Đã đối chiếu raw upstream tại hai SHA với vendor (chuẩn hóa xuống dòng), khớp nội dung. Không sửa vendor hoặc xóa reports.

## Kiểm chứng

Full npm run verify đã qua: typecheck, format và 31/31 test (gồm CLI ngoài checkout và showcase end-to-end trong thư mục tạm), cộng `git diff --check`. CI commit trước đó (5f92966) đã qua trên Windows và Ubuntu; commit mới của PL-110 cần kiểm tra lại trên GitHub Actions sau khi push. Đã có review độc lập của Antigravity cho PL-107..109 và self-review cho PL-110.

Showcase đã qua: upstream parent FAIL, cùng chuỗi trên fixed PASS, regression xuất ra PASS. Benchmark 500 seed: refund buggy 499 lỗi, always-reject 500, store parent 431; hai fixed 0. Timing quan sát và môi trường ghi trong BENCHMARK.md. Counts không đổi.

## Phần còn lại

- PL-105 vẫn thiếu feedback thật; không bịa hoặc coi AI test là người dùng ngoài.
- PL-106/107/108/109/110 ở Review đến khi tích hợp main. Chỉ merge khi được người dùng cấp quyền phù hợp.
- Draft PR #2: https://github.com/fkher003/patchlab/pull/2. Bước tiếp theo cho Codex/người dùng: xem kết quả CI của commit mới trên PR #2, lấy feedback thật theo docs/FEEDBACK.md nếu muốn hoàn tất PL-105, ôn theo docs/QUICKSTART-LEARNING.md + LESSON-01/02 + DEMO.md, và chỉ tích hợp main khi người dùng quyết định merge.
- Bản này có thể trình bày như project cá nhân có AI hỗ trợ, chưa production hoặc có người dùng. CV.md ghi đúng phạm vi; chưa xác nhận người dùng hiểu code.

## Giới hạn

Hash chỉ file adapter entry, không dependency; module ngoài chạy với quyền người dùng, chưa sandbox/timeout từng thao tác. Chưa concurrency/TTL/crash/database thật. Một lỗi công khai, hai bản lỗi hoàn tiền mô phỏng; tỷ lệ benchmark không đại diện mọi lỗi. Model vẫn có thể sai. Source của regression cần giữ cùng checkout (cross-drive dùng file URL tuyệt đối).
