# Truyền Thuyết LangBiAn I — bản web

[Chơi trực tuyến](https://phongbang2.github.io/langbian-i-web/)

Bản thử nghiệm chạy game trên trình duyệt bằng mkxp-z/libretro và Nostalgist, kèm Sổ tay gồm 7 phần từ tài liệu hướng dẫn của jenchow.

## Cách chơi

1. Mở đường dẫn bằng trình duyệt trên máy tính và đợi tải dữ liệu lần đầu (khoảng 185 MB).
2. Bấm **Chơi LangBiAn I**. Dùng phím mũi tên để di chuyển, **C** để xác nhận và **X** để mở hoặc thoát menu.
3. Bấm **Sổ tay** để tìm NPC, địa danh hoặc nhiệm vụ. Có thể tìm không dấu; nhấp ra ngoài bảng để đóng và chơi tiếp.

Âm thanh đang tắt trong bản thử nghiệm. Việc giữ bản lưu sau khi đóng hoặc tải lại trang chưa được xác minh.

## Xuất bản

GitHub Pages phục vụ nhánh `main`, thư mục gốc. `.nojekyll` giữ nguyên các tệp nhị phân. Gói game chia thành 9 phần trong `game-parts/`; trình khởi chạy ghép lại và kiểm tra SHA-256.

`coi-serviceworker.min.js` cung cấp các header COOP/COEP cần cho WebAssembly dùng nhiều luồng. Lần mở đầu tiên có thể tự tải lại trang để kích hoạt service worker. Để thử ở máy cá nhân, chạy `python -m http.server 8767` trong thư mục này rồi mở `http://localhost:8767/`.

## Thành phần sử dụng

- [mkxp-z](https://github.com/mkxp-z/mkxp-z)
- [Bản mkxp-z/libretro cho Emscripten](https://github.com/white-axe/mkxp-z-libretro-emscripten)
- [Nostalgist](https://github.com/arianrhodsandlot/nostalgist)
- [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker)

Nội dung game, đồ họa, âm thanh, font và tài liệu hướng dẫn thuộc các tác giả tương ứng. Kho này lưu bản thử nghiệm chuyển game sang web.
