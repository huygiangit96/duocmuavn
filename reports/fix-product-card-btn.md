# Fix Product Card Button Alignment

## Thay đổi

- Cập nhật `frontend/src/components/ProductCard.tsx`.
- Card wrapper chuyển sang `display: flex` và `flexDirection: column`.
- Content wrapper thêm `display: flex`, `flexDirection: column`, `flex: 1`.
- Tách nút `Thêm vào giỏ` khỏi row giá.
- Vùng giá + nút được đặt trong khối `marginTop: auto`.
- Nút thêm giỏ hàng chuyển thành full width và căn giữa.

## Kết quả

- Nút `Thêm vào giỏ` luôn nằm sát đáy card.
- Các nút trong grid thẳng hàng hơn, không còn bị lệch bởi sản phẩm có/không có giá khuyến mãi.

## Kiểm tra

- Đã chạy `npm run build` trong `frontend/`.
- Kết quả: build thành công, không có lỗi TypeScript.
