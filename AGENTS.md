# Hướng dẫn chung cho AI làm PatchLab

## Bắt đầu hoặc tiếp tục

Đọc docs/STATUS.md trước, kiểm tra git status, branch và commit thực tế. STATUS là điểm bàn giao, không thay thế bằng chứng từ code/Git. Giữ nguyên thay đổi chưa commit không thuộc phiên của mình; xác định nguồn thay đổi trước khi tiếp tục.

Đọc docs/PRODUCT.md và docs/ARCHITECTURE.md khi vào dự án lần đầu hoặc đổi phạm vi/thiết kế. Trước khi sửa hành vi, đọc docs/SPEC.md và tiêu chí ticket trong docs/BACKLOG.md. Lệnh và phiên bản công cụ lấy từ package.json, lockfile và .node-version.

## Một hướng và một người ghi

Codex và Antigravity dùng cùng đặc tả, backlog và trạng thái; không tạo kế hoạch riêng mâu thuẫn. Tại một thời điểm chỉ một AI sửa checkout này. STATUS chỉ là dấu hiệu bàn giao, không phải khóa kỹ thuật. Khi người dùng nói AI khác còn đang chạy, tránh sửa cùng thư mục; dùng checkout riêng và phân công riêng nếu cần làm đồng thời.

Trước thay đổi, cập nhật STATUS thành Working với tên AI và ticket. Khi kết thúc, cập nhật thành Handoff ready, ghi việc dang dở và bước tiếp theo cụ thể. Nếu phiên bị ngắt, AI sau đọc diff và test để khôi phục, không tự xóa công việc dở hoặc coi cờ Working cũ là khóa vĩnh viễn.

## Thực hiện trong ngân sách quota

Hoàn thành một ticket hoặc nhóm việc nhỏ liên quan đã có tiêu chí rõ; tự xử lý lựa chọn triển khai thông thường. Tránh dừng sau mỗi bước để xin xác nhận hoặc yêu cầu người dùng chuyển phản hồi giữa hai AI. Chỉ hỏi khi thiếu yêu cầu làm thay đổi hành vi/phạm vi hoặc có thao tác cần quyền chưa được cấp.

Mỗi thay đổi logic cần test chứng minh hành vi. Chạy npm run verify trước bàn giao code. Với tài liệu thuần túy, kiểm tra định dạng, liên kết và git diff --check là đủ; ghi đúng loại kiểm tra đã chạy. Đọc lại diff và ghi self-review nếu chỉ một AI kiểm tra. Review độc lập ưu tiên cho logic model/checker, dữ liệu đầu vào và export/replay; không bắt buộc chuyển AI sau mọi ticket.

Giữ repo private. Không tự merge PR, force-push, xóa lịch sử hoặc ghi đè công việc của AI khác. Có thể commit/push lên nhánh công việc theo quyền người dùng đã cấp; nếu môi trường không có quyền thì bàn giao local với trạng thái rõ. PR nền móng chưa merge không ngăn làm ticket tiếp: tạo nhánh phụ thuộc từ nền móng đã kiểm tra và ghi base trong STATUS.

## Học và báo cáo

Giao tiếp tiếng Việt. Trước thay đổi nêu ví dụ và quyết định chính; sau thay đổi giải thích kết quả, giới hạn và đưa một câu hỏi/bài tập ngắn. Bài tập là phần học, không phải điều kiện buộc dừng mọi việc chờ người dùng trả lời. Không tuyên bố người dùng đã hiểu nếu chưa có bằng chứng.

Kết thúc phiên cập nhật docs/STATUS.md và trạng thái ticket trong docs/BACKLOG.md. Chỉ ghi Done khi đạt tiêu chí và tích hợp main; code xong trên nhánh là Review. Ghi test đã chạy, commit liên quan và bước tiếp theo; không ghi kết quả CI chưa quan sát hoặc gọi lỗi mô phỏng là lỗi sản phẩm thật.
