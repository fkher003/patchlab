# Trạng thái bàn giao PatchLab

Cập nhật 20/11/2026, Asia/Saigon.

## Phiên và checkout

- Trạng thái: Handoff ready — Codex đã hoàn thành bản portfolio v0.2.0 trên nhánh.
- Local: D:/Projects/patchlab. Nhánh feat/portfolio-ready; base 9e7dfa6 (PL-106), main trước đó db2d905.
- Người dùng yêu cầu hoàn thiện bản đưa vào CV trước, học sau. Không dừng công việc để giao bài tập.
- Không merge hoặc đổi quyền riêng tư repo. Tra git log lấy commit hiện tại.

## Đã thực hiện

- PL-107: external-report.ts, schema 3 cho refund/store, provenance + entry-file hash, JSON/HTML/test export, explicit-target replay. Đổi adapter cần --allow-changed; metadata/hash được kiểm trước import. Report cũ 1/2 vẫn replay builtin.
- PL-108: --timing thêm thời gian check/shrink, môi trường và test counts không đổi.
- PL-109: npm run showcase chạy ca upstream end-to-end; README mới, DEMO.md, CV.md song ngữ, CHANGELOG và HTML evidence.
- Hardening: store trả sai kiểu hoặc processing bị đổi status được phát hiện; generator kiểm budget; regression export hỗ trợ source/output khác ổ đĩa.
- Đã đối chiếu raw upstream tại hai SHA với vendor (chuẩn hóa xuống dòng), khớp nội dung. Không sửa vendor hoặc xóa reports.

## Kiểm chứng

Full npm run verify đã qua: typecheck, format và 30/30 test, gồm CLI ngoài checkout. CI commit 5f92966 đã qua trên Windows và Ubuntu: https://github.com/fkher003/patchlab/actions/runs/44761727643. Self-review đã thực hiện; chưa có review độc lập.

Showcase đã qua: upstream parent FAIL, cùng chuỗi trên fixed PASS, regression xuất ra PASS. Benchmark 500 seed: refund buggy 499 lỗi, always-reject 500, store parent 431; hai fixed 0. Timing quan sát và môi trường ghi trong BENCHMARK.md. Counts không đổi sau thêm timing.

## Phần còn lại

- PL-105 vẫn thiếu feedback thật; không bịa hoặc coi AI test là người dùng ngoài.
- PL-106/107/108/109 ở Review đến khi tích hợp main. Chỉ merge khi được người dùng cấp quyền phù hợp.
- Draft PR #2: https://github.com/fkher003/patchlab/pull/2. Bước tiếp theo: review PR, lấy feedback thật theo docs/FEEDBACK.md và chỉ tích hợp main khi được cấp quyền. Code đã push; gói source được tạo từ HEAD sau cập nhật bàn giao.
- Bản này có thể trình bày như project cá nhân có AI hỗ trợ, chưa production hoặc có người dùng. CV.md ghi đúng phạm vi; chưa xác nhận người dùng hiểu code.

## Giới hạn

Hash chỉ file adapter entry, không dependency; module ngoài chạy với quyền người dùng, chưa sandbox/timeout từng thao tác. Chưa concurrency/TTL/crash/database thật. Một lỗi công khai, hai bản lỗi hoàn tiền mô phỏng; tỷ lệ benchmark không đại diện mọi lỗi. Model vẫn có thể sai. Source của regression cần giữ cùng checkout (cross-drive dùng file URL tuyệt đối).
