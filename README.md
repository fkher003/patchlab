# PatchLab

Bản khởi đầu để học cách kiểm chứng logic: sinh chuỗi yêu cầu hoàn tiền, tìm vi phạm, rút ngắn chuỗi lỗi và xuất test tái hiện.

**Trạng thái:** prototype học tập, dữ liệu và lỗi được cố tình mô phỏng. Chưa kiểm chứng trên repository bên ngoài, chưa có người dùng thật, chưa phải công cụ review code AI tổng quát.

## Chạy ngay

Yêu cầu Node.js >=24.12. Không cần `npm install`, không cần API key.

```powershell
npm run demo
npm test
npm run check:buggy
npm run replay -- reports/failure.json buggy
npm run replay -- reports/failure.json fixed
npm run check:fixed
node --test reports/repro.test.ts
```

`check:buggy` và replay bản buggy **cố ý trả exit code 1 khi tìm thấy lỗi**. Đó là hành vi đúng của checker, không phải công cụ bị hỏng. Exit code 2 là lỗi tham số hoặc đọc báo cáo. `demo` trả 0 nếu trình diễn chạy xong.

Mỗi lần tìm lỗi ghi đè `reports/failure.json` và `reports/repro.test.ts`; copy riêng nếu muốn giữ nhiều kết quả. Lần chạy không tìm lỗi không xóa báo cáo cũ: hãy đọc seed và variant trong báo cáo, đừng coi file tồn tại là lỗi của lần chạy mới.

```powershell
# Đổi seed: cùng seed và cùng phiên bản generator tạo cùng đầu vào.
npm run check:buggy -- 123
# Test đã xuất mặc định kiểm tra fixed. Chạy với buggy để thấy regression:
$env:PATCHLAB_TARGET = 'buggy'
node --test reports/repro.test.ts
Remove-Item Env:PATCHLAB_TARGET
```

## Bắt đầu học

Đọc [buổi học đầu tiên](docs/LESSON-01.md), rồi [đặc tả](docs/SPEC.md). Đừng đọc hết source ngay: dự đoán đầu ra, chạy, giải thích chênh lệch, sau đó mới mở phần lời giải.

## Các phần của hệ thống

`generator.ts` tạo dữ liệu → `checker.ts` quan sát service → `minimize` xóa thao tác không cần → CLI lưu bằng chứng và test.

- `src/refunds.ts`: dịch vụ mẫu, hai phiên bản buggy/fixed.
- `src/checker.ts`: các quy tắc quan sát được và thuật toán rút gọn.
- `src/generator.ts`: sinh dữ liệu có seed, có yêu cầu lặp và giá trị biên.
- `src/cli.ts`: điều phối và lưu báo cáo; JSON replay được kiểm tra cấu trúc trước khi chạy.
- `test/patchlab.test.ts`: kiểm tra hành vi nghiệp vụ và chính công cụ kiểm tra.

## Giới hạn và phần cần phát triển

- PASS chỉ nghĩa là chưa tìm vi phạm trong phạm vi đã chạy.
- Generator nhỏ, tập giá trị hữu hạn, không đo coverage hoặc đại diện lưu lượng thật.
- Rút gọn chỉ xóa thao tác đến khi không xóa riêng một thao tác nào nữa được; không bảo đảm chuỗi ngắn nhất toàn cục, chưa rút gọn số tiền.
- Checker vẫn có điểm mù; xem SPEC. Không dùng LLM làm trọng tài đúng/sai.
- Node chạy TypeScript bằng cách bỏ type, **không kiểm tra kiểu tĩnh**. Bản này chưa có `tsc`; bước tiếp theo thêm TypeScript compiler và kiểm tra kiểu trong CI.
- Chưa kiểm tra lỗi đồng thời, crash hoặc dữ liệu nhiều đơn. Không tuyên bố bảo đảm an toàn thanh toán.

## Lộ trình sau khi hiểu bài đầu

1. Tự thêm quy tắc, test và một biến thể lỗi; giải thích trước khi dùng AI sửa.
2. Thêm mô hình tham chiếu để kiểm tra các yêu cầu đáng lẽ phải thành công.
3. Thêm typecheck, CI và kiểm thử CLI tự động.
4. Chọn lỗi công khai có giấy phép phù hợp, cố định phiên bản, tái hiện và ghi nguồn.
5. Đo kết quả trên nhiều bản lỗi; xin một lập trình viên ngoài dự án chạy thử.

Chỉ ghi vào CV những bước đã hoàn thành, không ghi các mục lộ trình như tính năng đã có.

## Tài liệu gốc

- https://stripe.com/blog/idempotency — bối cảnh gửi lại yêu cầu.
- https://nodejs.org/api/typescript.html — thực thi TypeScript và giới hạn type stripping.
- https://fast-check.dev/docs/tutorials/detect-race-conditions/ — hướng mở rộng kiểm tra thứ tự thực thi.
