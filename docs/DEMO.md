# Demo PatchLab trong 90 giây

## Chuẩn bị

Node theo .node-version, npm ci, npm run verify. Đóng các cửa sổ có thông tin riêng trước khi quay video. Repo private, video hoặc report mẫu có thể dùng để giới thiệu khi bạn quyết định chia sẻ.

## Kịch bản

0–15 giây: "PatchLab kiểm tra quy tắc nghiệp vụ bằng chuỗi thao tác và xuất test tái hiện. Tôi dùng một lỗi kho khóa đã công khai làm ca kiểm chứng."

15–40 giây: chạy npm run showcase. Chỉ vào FAIL processing-key-lost và 30 → 4 operations. Giải thích khóa k2 đang xử lý bị loại khi thêm k4 vào kho đầy.

40–65 giây: chỉ vào replay bản lỗi FAIL, bản sửa PASS và exported regression test PASS. Nêu rằng bản sửa được thử với cùng chuỗi, không sinh lại bộ dữ liệu khác để che lỗi.

65–90 giây: mở report.html vừa tạo. Chỉ vào contract, seed, chuỗi rút gọn và hash nguồn. Kết thúc bằng giới hạn: hash chỉ file adapter, chưa sandbox, một ca công khai không đại diện mọi lỗi.

## Trước phỏng vấn

Bạn cần tự giải thích được vì sao service luôn từ chối vẫn có thể an toàn về số dư nhưng sai nghiệp vụ; tại sao model phải độc lập; seed khác report đã lưu thế nào; và vì sao không tự thực thi đường dẫn nằm trong report.

Tài liệu này chuẩn bị phần trình bày, không chứng nhận người dùng đã nắm code. AI đã hỗ trợ triển khai; mô tả đúng vai trò và kiến thức bạn có thể giải thích.
