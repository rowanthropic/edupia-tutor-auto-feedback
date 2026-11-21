# Edupia Tutor - Intelligent Evaluation Assistant

Client-side automation tool designed to streamline student grading and generate context-aware pedagogical feedback using Google Gemini API.

Author: Rowan (RW)  
License: MIT License  
Platform: Edupia Tutor LMS (lms.edupiatutor.vn)

---

## 1. Bối cảnh dự án và Tác động thực tế (Problem & Impact)

### Vấn đề thực tế (Problem Statement)
Trong quá trình giảng dạy trên nền tảng Edupia Tutor LMS, giáo viên sau mỗi ca dạy phải thực hiện quy trình đánh giá hành chính bắt buộc:
- Điền thủ công 4 tiêu chí điểm số (Từ vựng, Ngữ pháp, Nghe hiểu, Phản xạ) cho từng học sinh.
- Viết nhận xét chi tiết cho từng em (Tiếp thu kiến thức, Thái độ học tập).
- Viết nhận xét tổng quan buổi học và dặn dò bài tập về nhà.

Với các lớp từ 3 đến 4 học sinh, công việc này tiêu tốn trung bình từ 15 đến 20 phút sau mỗi buổi dạy, lặp đi lặp lại nhiều lần trong ngày, dễ gây mệt mỏi và dẫn đến tình trạng sao chép nhận xét rập khuôn, thiếu tính cá nhân hóa cho học sinh.

### Giải pháp và Tác động (Solution & Impact)
Dự án được xây dựng như một trợ lý tự động hóa chạy trực tiếp tại trình duyệt (client-side), kết hợp cùng mô hình ngôn ngữ lớn Google Gemini 2.5 Flash:
- Tối ưu hóa thời gian: Rút ngắn thời gian đánh giá từ 15 phút xuống dưới 5 giây mỗi buổi dạy (giảm hơn 90% thời gian xử lý hành chính).
- Cá nhân hóa sư phạm: Tự động trích xuất chủ đề bài học, số cúp thi đua của từng học sinh và lý do trừ điểm từ giáo viên để tạo nhận xét tự nhiên, riêng biệt cho từng em.
- Bảo mật tuyệt đối: Áp dụng kiến trúc BYOK (Bring Your Own Key), dữ liệu lưu trữ cục bộ, không thông qua bất kỳ server trung gian nào, bảo vệ quyền riêng tư của học sinh.

---

## 2. Kiến trúc kỹ thuật (Engineering Highlights)

Dự án thể hiện năng lực giải quyết các thách thức kỹ thuật phức tạp trên nền tảng web hiện đại:

### Can thiệp định tuyến Single Page Application (SPA Route Interception)
Hệ thống Edupia Tutor LMS được xây dựng dưới dạng ứng dụng đơn trang (SPA). Khi người dùng chuyển trang thông qua menu điều hướng, trình duyệt không tải lại toàn bộ trang (không kích hoạt lại `window.onload`). 
Giải pháp kỹ thuật: Script chủ động can thiệp và ghi đè phương thức `history.pushState` và `history.replaceState`, kết hợp lắng nghe sự kiện `popstate` và cơ chế quét chu kỳ nhẹ để nhận diện tức thời khi người dùng chuyển vào URL `/statistics-report/edit*`, từ đó kích hoạt giao diện ngay lập tức mà không cần F5.

### Bỏ qua cơ chế chặn Virtual DOM của React (React Synthetic Event Dispatching)
Trên các phiên bản React 16+, việc gán giá trị trực tiếp vào thuộc tính `input.value = val` sẽ bị cơ chế Synthetic Event của React bỏ qua, dẫn đến việc giao diện hiển thị số nhưng khi bấm nút "Lưu" thì dữ liệu bị mất.
Giải pháp kỹ thuật: Script can thiệp trực tiếp vào bộ mô tả thuộc tính gốc (`prototype value setter descriptor`) của `HTMLInputElement` và `HTMLTextAreaElement`, sau đó phát liên tiếp các sự kiện chuẩn `input` và `change` với cờ `bubbles: true`. Điều này đảm bảo React State được cập nhật chính xác 100%.

### Ràng buộc định dạng AI bằng JSON Schema nghiêm ngặt
Để loại bỏ hiện tượng mô hình ngôn ngữ sinh văn bản tự do khó phân tích, hệ thống sử dụng tham số `responseMimeType: "application/json"` của Google Gemini 2.5 Flash API. Định dạng trả về được khóa cứng theo cấu trúc Schema chứa trường `general` (nhận xét chung) và mảng đối tượng `students` (tên, nhận xét kiến thức, nhận xét thái độ).

### Cơ chế dự phòng không gián đoạn (Zero-Failure Fallback Engine)
Trong trường hợp mất kết nối mạng hoặc người dùng gặp lỗi hạn ngạch API, script tự động chuyển hướng sang bộ sinh nhận xét ngoại tuyến thông minh. Bộ dữ liệu dự phòng được xây dựng đa chiều với thuật toán xáo trộn không trùng lặp (Fisher-Yates Shuffle), tự động gắn tên riêng và xử lý danh xưng Thầy/Cô mượt mà.

### Thiết kế giao diện tối giản chuẩn Apple (Minimalist UI Architecture)
Giao diện được thiết kế độc lập, nhúng trực tiếp vào DOM trang web nhưng được cô lập hoàn toàn về mặt thẩm mỹ: Bảng màu monochrome đen - trắng trung tính, hiệu ứng kính mờ (Backdrop blur), typography chuẩn SF Pro Display, phản hồi vi tương tác khi bấm nút và cơ chế hiển thị có điều kiện (Conditional Rendering) chỉ mở ô nhập khi điểm dưới 10.

---

## 3. Hướng dẫn cài đặt chi tiết (Dành cho người dùng mới)

Quy trình cài đặt chỉ cần thực hiện một lần duy nhất theo 3 bước sau:

### Bước 1: Cài đặt tiện ích Tampermonkey
Tampermonkey là tiện ích mở rộng an toàn và phổ biến nhất trên Chrome dùng để chạy công cụ này.
1. Bấm vào đường link này để cài Tampermonkey từ Chrome Web Store:  
   https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo
2. Bấm vào nút màu xanh "Thêm vào Chrome" (Add to Chrome), sau đó bấm tiếp "Thêm tiện ích" (Add extension).
3. Sau khi cài xong, bạn mở một tab mới trên Chrome, gõ vào thanh địa chỉ dòng này rồi bấm Enter:  
   `chrome://extensions`
4. Nhìn lên góc trên cùng bên phải màn hình, bạn tìm nút gạt có tên:  
   "Chế độ dành cho nhà phát triển" (Developer mode).  
   -> Hãy gạt nút đó sang BẬT (Màu xanh).  
   (Lưu ý: Bắt buộc phải bật nút này thì Chrome mới cho phép Tampermonkey tự động cài đặt công cụ).

### Bước 2: Cài đặt công cụ Tự Động Đánh Giá
1. Bấm trực tiếp vào đường dẫn cài đặt script:
   [BẤM VÀO ĐÂY ĐỂ CÀI ĐẶT CÔNG CỤ](https://raw.githubusercontent.com/rowanthropic/edupia-tutor-auto-feedback/refs/heads/main/edupia-tutor.user.js)
2. Trình duyệt sẽ tự động chuyển hướng đến màn hình cài đặt của Tampermonkey.
3. Bạn sẽ nhìn thấy tên script: `Edupia Tutor - Tự Động Đánh Giá Buổi Học`.
4. Tìm và bấm vào nút "Cài đặt" (Install) ở góc bên trái màn hình.
5. Tab cài đặt sẽ tự động đóng lại. Công cụ đã sẵn sàng hoạt động.

### Bước 3 (Bắt buộc): Lấy Gemini API Key miễn phí từ Google để kích hoạt
Để AI có thể viết nhận xét riêng biệt cho từng học sinh và bảo đảm tính bảo mật cá nhân, mỗi giáo viên cần có một khóa API miễn phí do Google cung cấp:

1. Cách lấy API Key (Thao tác trong 1 phút):
   - Mở trang Google AI Studio: https://aistudio.google.com/app/apikey
   - Đăng nhập bằng tài khoản Gmail cá nhân của bạn.
   - Bấm vào nút màu xanh "Create API key" (Tạo khóa API).
   - Chọn "Create API key in new project" rồi bấm "Create".
   - Hệ thống sẽ tạo một đoạn mã dài bắt đầu bằng chữ `AIzaSy...`. Bấm nút "Copy" để sao chép đoạn mã này.

2. Cách dán Key vào công cụ để kích hoạt:
   - Đăng nhập vào trang quản lý Edupia: https://lms.edupiatutor.vn/
   - Bấm vào bất kỳ buổi học nào cần nhận xét.
   - Nhìn xuống góc dưới cùng bên phải màn hình, bấm vào nút màu đen "Tự động đánh giá".
   - Trong bảng điều khiển hiện ra, bấm vào dòng chữ gạch chân "Thiết lập API Key".
   - Dán đoạn mã vừa sao chép vào ô trống và bấm nút "Lưu".
   - Trạng thái chuyển sang "Sẵn sàng" là công cụ đã được kích hoạt thành công. Trình duyệt sẽ lưu nhớ vĩnh viễn, bạn không cần nhập lại ở các buổi sau.

---

## 4. Hướng dẫn sử dụng khi đi dạy thực tế

Sau mỗi ca dạy, giáo viên thực hiện quy trình 4 bước đơn giản:

1. Mở trang đánh giá buổi học trên Edupia LMS.
2. Bấm vào nút màu đen "Tự động đánh giá" ở góc dưới bên phải màn hình:
   - Xưng hô: Bấm chọn "Cô" hoặc "Thầy" (hệ thống tự lưu danh xưng cho mọi buổi học sau).
   - Đánh giá điểm số:
     - Trường hợp cả lớp học tốt: Chọn thẻ "Toàn bộ 10 điểm".
     - Trường hợp có học sinh cần trừ điểm: Chọn thẻ "Chấm điểm từng em" và bấm chọn điểm 9, 8 hoặc 7. Lúc này một ô ghi chú nhỏ sẽ tự động mở ra dưới tên học sinh, bạn chỉ cần gõ nhanh lý do (ví dụ: "chưa hiểu bài", "phản xạ chậm"). AI sẽ tự động phân tích lý do này để đưa vào lời dặn dò khuyên bảo học sinh một cách khéo léo.
3. Bấm nút màu đen "Tự động điền đánh giá". Toàn bộ 4 cột điểm số và các ô nhận xét sẽ được tự động điền đầy đủ và chính xác trong 1 giây.
4. Màn hình hiển thị bảng thông báo "Hoàn tất đánh giá". Bạn bấm "Đóng cửa sổ", kiểm tra lại nội dung lần cuối và bấm nút "Lưu đánh giá" màu xanh ở cuối trang của Edupia.

---

## 5. Chính sách quyền riêng tư và An toàn dữ liệu (Privacy & Security)

Dự án tuân thủ nghiêm ngặt các nguyên tắc bảo mật phần mềm:
- Kiến trúc lưu trữ cục bộ (Local-Only Storage): Khóa API Key và các tùy chọn cá nhân được lưu trữ hoàn toàn trong vùng nhớ an toàn của Tampermonkey trên máy tính của bạn (`GM_setValue`), không thể bị truy cập từ bên ngoài.
- Không thu thập dữ liệu (Zero Telemetry): Không sử dụng cookie theo dõi, không gửi thông tin định danh học sinh, không thu thập tài khoản hay mật khẩu Edupia của giáo viên.
- Kết nối trực tiếp (Direct Peer-to-Provider): Mọi yêu cầu sinh dữ liệu nhận xét được gửi trực tiếp từ máy của người dùng tới máy chủ của Google qua giao thức bảo mật HTTPS đã được mã hóa.

---

## 6. Câu hỏi thường gặp và Xử lý sự cố (FAQ & Troubleshooting)

- Câu hỏi 1: Vì sao tôi không thấy nút "Tự động đánh giá" ở góc màn hình?
  Trả lời: Hãy bấm phím F5 (trên Windows) hoặc Cmd + R (trên Mac) để tải lại trang. Hãy kiểm tra xem biểu tượng tiện ích Tampermonkey ở góc trên trình duyệt có đang hiển thị số 1 màu đỏ hay không (đảm bảo script đang được Bật).

- Câu hỏi 2: Công cụ có nhận diện đúng lớp có 3 học sinh hoặc 4 học sinh không?
  Trả lời: Có. Bộ cào dữ liệu được lập trình để tự động đếm chính xác số lượng cột học sinh thực tế trên bảng điểm để điền dữ liệu tương ứng, tự động loại bỏ các tiền tố/hậu tố như "Lớp 3", "Lớp 4" trong tên học sinh.

- Câu hỏi 3: Nếu tôi không nhập API Key thì công cụ có chạy không?
  Trả lời: Không. Để bảo đảm chất lượng nhận xét luôn thông minh và không bị trùng lặp, công cụ yêu cầu người dùng phải thiết lập API Key cá nhân từ Google để kích hoạt.

---

## 7. Thông tin tác giả và Bản quyền (Author & License)

- Tác giả: Rowan (RW) - Software Developer & Educator.
- Liên hệ và đóng góp ý kiến: Vui lòng mở mục Issues trên GitHub repository này.
- Bản quyền: Dự án được phân phối theo giấy phép mã nguồn mở MIT License. Tự do sử dụng, chỉnh sửa và chia sẻ phục vụ mục đích phi thương mại và hỗ trợ cộng đồng giáo dục.
