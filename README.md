# Truyền Thuyết LangBiAn I — bản web

[Chơi trực tuyến](https://phongbang2.github.io/langbian-i-web/)

Bản thử nghiệm chạy game trên trình duyệt bằng mkxp-z/libretro và Nostalgist, kèm Sổ tay gồm 7 phần từ tài liệu hướng dẫn của jenchow.

## Cách chơi

1. Mở đường dẫn bằng trình duyệt và đợi tải dữ liệu lần đầu (khoảng 185 MB).
2. Bấm **Chơi LangBiAn I**. Dùng phím mũi tên để di chuyển, **C** để xác nhận và **X** để mở hoặc thoát menu.
3. Bấm **Sổ tay** để tìm NPC, địa danh hoặc nhiệm vụ. Có thể tìm không dấu; nhấp ra ngoài bảng để đóng và chơi tiếp.

Âm thanh đang tắt trong bản thử nghiệm. Việc giữ bản lưu sau khi đóng hoặc tải lại trang chưa được xác minh.

## Chơi trên iPhone

1. Mở [bản dành cho màn hình cảm ứng](https://phongbang2.github.io/langbian-i-web/play.html?v=20261114-iphone-1) trực tiếp bằng Safari. Nếu đang xem link trong Zalo hoặc Facebook, chọn mở bằng Safari.
2. Dùng Wi-Fi cho lần tải đầu; đợi nút **Chơi LangBiAn I** sáng lên rồi chạm để bắt đầu.
3. Xoay ngang để chơi, hoặc giữ dọc nếu thuận tay. Màn hình giữ tỷ lệ 4:3, các nút nằm ngoài vùng game và tránh vùng tai thỏ/thanh Home.
4. Giữ các mũi tên để di chuyển; **C** xác nhận/nói chuyện; **X** mở menu hoặc quay lại. Có thể giữ nhiều phím cùng lúc. Nút **Phím phụ** mở A/S/D/Q/W/Ctrl/Alt; Z và Shift nằm sẵn bên cạnh C/X.
5. Mở **Sổ tay** để tra nhiệm vụ. Nút **Ẩn phím / Hiện phím** đổi chế độ hiển thị bộ điều khiển.

Nên dùng iOS/Safari được cập nhật. Khả năng chạy còn phụ thuộc bộ nhớ thiết bị và việc trình duyệt cho phép WebAssembly dùng nhiều luồng. Nếu không khởi động được, trang sẽ hiện cách thử lại thay vì chỉ để màn hình trống.

Giao diện cảm ứng nằm trong `mobile.css` và `mobile.js`; `boot.js` chuẩn bị môi trường trình duyệt và báo lỗi tải. Phím được nhả khi đổi tab, đổi hướng hoặc mở Sổ tay. Mỗi lần chạm ngắn được giữ tối thiểu 80 ms để game có thể nhận phím khi tốc độ khung hình thấp.

## Xuất bản

GitHub Pages phục vụ nhánh `main`, thư mục gốc. `.nojekyll` giữ nguyên các tệp nhị phân. Gói game chia thành 9 phần trong `game-parts/`, lõi WebAssembly chia thành 3 phần trong `wasm-parts/`. Mỗi phần tối đa 16 MiB. Trình khởi chạy ghép các phần và dùng mã SHA-256 để nhận diện phiên bản bộ nhớ đệm; dữ liệu đã được đối chiếu mã băm trước khi xuất bản.

`coi-serviceworker.min.js` cung cấp các header COOP/COEP cần cho WebAssembly dùng nhiều luồng. Lần mở đầu tiên có thể tự tải lại trang để kích hoạt service worker. Máy chủ thử ở máy cá nhân cần phục vụ `.js` với kiểu `text/javascript` hoặc `application/javascript`, và `.wasm` với kiểu `application/wasm`.

## Thành phần sử dụng

- [mkxp-z](https://github.com/mkxp-z/mkxp-z)
- [Bản mkxp-z/libretro cho Emscripten](https://github.com/white-axe/mkxp-z-libretro-emscripten)
- [Nostalgist](https://github.com/arianrhodsandlot/nostalgist)
- [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker)

Nội dung game, đồ họa, âm thanh, font và tài liệu hướng dẫn thuộc các tác giả tương ứng. Kho này lưu bản thử nghiệm chuyển game sang web.
