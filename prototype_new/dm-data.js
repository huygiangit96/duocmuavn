// dm-data.js — Mock data for Được Mùa GAH
window.DM = window.DM || {};

window.DM.CATS = [
  { id: 1, name: 'Máy & Thiết Bị', fullName: 'Máy và Thiết Bị Nông Nghiệp', color: '#1E5BAA', bg: '#e8f0fb' },
  { id: 2, name: 'Kích Thích Sinh Trưởng', fullName: 'Thuốc Kích Thích Sinh Trưởng', color: '#7a9820', bg: '#f0f7e0' },
  { id: 3, name: 'Thuốc Trừ Bệnh', fullName: 'Thuốc Trừ Bệnh', color: '#c0392b', bg: '#fce8ea' },
  { id: 4, name: 'Thuốc Trừ Nhuyễn Thể', fullName: 'Thuốc Trừ Nhuyễn Thể', color: '#7b5ea7', bg: '#f0ebf8' },
  { id: 5, name: 'Thuốc Trừ Sâu', fullName: 'Thuốc Trừ Sâu', color: '#d35400', bg: '#fef0e6' },
  { id: 6, name: 'Thuốc Trừ Tuyến Trùng', fullName: 'Thuốc Trừ Tuyến Trùng', color: '#0878a0', bg: '#e0f4f8' },
];

window.DM.PLANTS = ['Lúa', 'Rau màu', 'Cây ăn trái', 'Hoa màu', 'Cà phê', 'Tiêu', 'Điều'];

// price = giá khuyến mãi (sale), listPrice = giá niêm yết (gốc)
// promo = nhãn khuyến mãi hiển thị trên thẻ
window.DM.PRODUCTS = [
  { id: 1,  catId: 1, name: 'Máy Phun Thuốc Điện 16L', price: 2500000, listPrice: 2900000, promo: 'Giảm 14%', unit: 'cái',       tag: 'Mới',      rating: 4.8, reviews: 32, plants: ['Lúa','Rau màu'],               desc: 'Máy phun điện dung tích 16L, pin lithium 12V/8Ah, thời gian phun 45-60 phút/lần sạc. Vòi phun điều chỉnh được.' },
  { id: 2,  catId: 1, name: 'Bình Phun Đeo Vai 20L',   price: 450000,  listPrice: 450000,  promo: '',          unit: 'cái',       tag: '',         rating: 4.5, reviews: 18, plants: ['Lúa','Cây ăn trái'],            desc: 'Bình phun tay đeo vai 20L, van bơm áp lực cao, vòi phun đa chiều 360°.' },
  { id: 3,  catId: 1, name: 'Máy Sạ Lúa Hàng Mini',   price: 8500000, listPrice: 9500000, promo: '-1tr',      unit: 'cái',       tag: 'Bán chạy', rating: 4.9, reviews: 45, plants: ['Lúa'],                           desc: 'Máy sạ lúa hàng mini, khoảng cách hàng 20-30cm, phù hợp ruộng diện tích nhỏ.' },
  { id: 4,  catId: 2, name: 'Auxin 10SL',              price: 85000,   listPrice: 110000,  promo: 'Giảm 23%', unit: 'chai 100ml', tag: 'Bán chạy', rating: 4.7, reviews: 62, plants: ['Lúa','Rau màu','Cây ăn trái'],  desc: 'Kích thích ra rễ, đẻ nhánh, tăng tỷ lệ đậu trái. Thành phần: Alpha-naphthalene acetic acid 10%.' },
  { id: 5,  catId: 2, name: 'GA3 10% SL',              price: 120000,  listPrice: 120000,  promo: '',          unit: 'chai 50ml',  tag: '',         rating: 4.6, reviews: 38, plants: ['Cây ăn trái','Rau màu'],         desc: 'Gibberellin A3 10SL, kích thích sinh trưởng tế bào, tăng kích thước quả và kéo dài cuống.' },
  { id: 6,  catId: 2, name: 'Siêu Ra Hoa 30ml',        price: 65000,   listPrice: 80000,   promo: 'Giảm 19%', unit: 'chai 30ml',  tag: 'Mới',      rating: 4.4, reviews: 22, plants: ['Cây ăn trái','Hoa màu'],         desc: 'Kích thích ra hoa đồng loạt, hoa to và nhiều hơn, tăng tỷ lệ đậu quả.' },
  { id: 7,  catId: 3, name: 'Anvil 5SC',               price: 95000,   listPrice: 115000,  promo: 'Giảm 17%', unit: 'chai 100ml', tag: 'Bán chạy', rating: 4.8, reviews: 55, plants: ['Lúa'],                           desc: 'Trừ nấm đạo ôn, khô vằn, lem lép hạt trên lúa. Hoạt chất: Hexaconazole 5% SC.' },
  { id: 8,  catId: 3, name: 'Carbenzim 500FL',         price: 75000,   listPrice: 75000,   promo: '',          unit: 'chai 100ml', tag: '',         rating: 4.5, reviews: 29, plants: ['Lúa','Rau màu','Cây ăn trái'],  desc: 'Phổ rộng, trừ nhiều loại nấm bệnh, thấm lá nhanh. Hoạt chất: Carbendazim 500g/L.' },
  { id: 9,  catId: 3, name: 'Mancozeb 80WP',           price: 55000,   listPrice: 65000,   promo: 'Giảm 15%', unit: 'gói 200g',   tag: '',         rating: 4.3, reviews: 17, plants: ['Cây ăn trái','Rau màu'],         desc: 'Thuốc trừ bệnh tiếp xúc, phổ rộng, bảo vệ bề mặt lá lâu dài khỏi nấm bệnh.' },
  { id: 10, catId: 4, name: 'Deadline 5G',             price: 45000,   listPrice: 55000,   promo: 'Giảm 18%', unit: 'gói 500g',   tag: 'Bán chạy', rating: 4.9, reviews: 78, plants: ['Lúa'],                           desc: 'Diệt ốc bươu vàng hiệu quả cao, an toàn cho tôm cá. Hoạt chất: Metaldehyde 5%.' },
  { id: 11, catId: 4, name: 'Bolis 6GR',               price: 52000,   listPrice: 52000,   promo: '',          unit: 'gói 500g',   tag: '',         rating: 4.6, reviews: 33, plants: ['Lúa','Rau màu'],                 desc: 'Dạng hạt, rải trực tiếp ruộng nước, diệt ốc và sên nhớt nhanh trong 24h.' },
  { id: 12, catId: 5, name: 'Regent 800WG',            price: 88000,   listPrice: 105000,  promo: 'Giảm 16%', unit: 'gói 5g x10', tag: 'Bán chạy', rating: 4.8, reviews: 91, plants: ['Lúa','Rau màu'],                 desc: 'Trừ sâu đục thân, rầy nâu, bọ trĩ hiệu quả cao. Hoạt chất: Fipronil 800g/kg.' },
  { id: 13, catId: 5, name: 'Actara 25WG',             price: 135000,  listPrice: 135000,  promo: '',          unit: 'gói 3g',     tag: '',         rating: 4.7, reviews: 44, plants: ['Rau màu','Cây ăn trái'],         desc: 'Lưu dẫn mạnh, diệt sâu chích hút triệt để, tác dụng kéo dài 2-3 tuần.' },
  { id: 14, catId: 5, name: 'Abamectin 3.6EC',         price: 72000,   listPrice: 90000,   promo: 'Giảm 20%', unit: 'chai 100ml', tag: 'Mới',      rating: 4.5, reviews: 26, plants: ['Rau màu','Cây ăn trái','Hoa màu'], desc: 'Trừ nhện đỏ, bọ trĩ, sâu vẽ bùa hiệu quả, phổ tác dụng rộng.' },
  { id: 15, catId: 6, name: 'Tervigo 020SC',           price: 185000,  listPrice: 220000,  promo: 'Giảm 16%', unit: 'chai 50ml',  tag: 'Mới',      rating: 4.7, reviews: 28, plants: ['Rau màu','Cây ăn trái','Tiêu','Cà phê'], desc: 'Trừ tuyến trùng bộ rễ an toàn, ít ảnh hưởng đến vi sinh vật đất có lợi.' },
  { id: 16, catId: 6, name: 'Nimitz 480SC',            price: 220000,  listPrice: 220000,  promo: '',          unit: 'chai 100ml', tag: 'Bán chạy', rating: 4.8, reviews: 36, plants: ['Rau màu','Tiêu','Điều'],          desc: 'Fluensulfone – cơ chế mới, diệt tuyến trùng nhanh và bền vững hơn.' },
];

window.DM.NEWS = [
  { id: 1, catName: 'Kỹ Thuật',  title: 'Phòng trừ sâu keo mùa thu hại ngô hiệu quả', date: '15/04/2026', excerpt: 'Sâu keo mùa thu (Spodoptera frugiperda) đang gây hại nghiêm trọng trên nhiều vùng trồng ngô, cần áp dụng biện pháp phòng trừ kịp thời.', featured: true,  tags: ['sâu-keo','ngô','phòng-trừ','kỹ-thuật'] },
  { id: 2, catName: 'Kinh Nghiệm', title: 'Bí quyết tăng năng suất lúa vụ Hè Thu 2026', date: '10/04/2026', excerpt: 'Các biện pháp kỹ thuật giúp tăng năng suất lúa từ 15-20% trong vụ Hè Thu, bao gồm quản lý nước và dinh dưỡng hợp lý.', featured: true,  tags: ['lúa','năng-suất','hè-thu','kinh-nghiệm'] },
  { id: 3, catName: 'Tin Tức',   title: 'Ra mắt dòng sản phẩm kích thích sinh trưởng mới', date: '05/04/2026', excerpt: 'Được Mùa GAH chính thức giới thiệu dòng sản phẩm kích thích sinh trưởng thế hệ mới, hiệu quả vượt trội trên cây ăn trái.', featured: false, tags: ['sản-phẩm-mới','kích-thích-sinh-trưởng','cây-ăn-trái'] },
  { id: 4, catName: 'Kỹ Thuật',  title: 'Quản lý ốc bươu vàng trên ruộng lúa sạ', date: '01/04/2026', excerpt: 'Hướng dẫn phòng trừ ốc bươu vàng toàn diện từ khâu chuẩn bị đất đến khi lúa đẻ nhánh, tránh thiệt hại mất trắng.', featured: false, tags: ['ốc-bươu-vàng','lúa','phòng-trừ','kỹ-thuật'] },
  { id: 5, catName: 'Thị Trường', title: 'Giá lúa gạo dự báo tăng trong quý 2/2026', date: '28/03/2026', excerpt: 'Dự báo thị trường xuất khẩu gạo Việt Nam quý 2 năm 2026 tiếp tục khởi sắc nhờ nhu cầu từ các thị trường châu Phi và Trung Đông.', featured: false, tags: ['thị-trường','xuất-khẩu','gạo','2026'] },
  { id: 6, catName: 'Kinh Nghiệm', title: 'Cách pha thuốc trừ sâu đúng kỹ thuật và an toàn', date: '20/03/2026', excerpt: 'Nguyên tắc "4 đúng" trong sử dụng thuốc bảo vệ thực vật giúp tăng hiệu quả phòng trừ và giảm thiểu ô nhiễm môi trường.', featured: false, tags: ['thuốc-trừ-sâu','an-toàn','kỹ-thuật','4-đúng'] },
];

window.DM.DOCS_PAPER = [
  { id: 1, title: 'Hướng Dẫn Sử Dụng Anvil 5SC',              topic: 'Thuốc BVTV', plant: 'Lúa',           date: '01/2026' },
  { id: 2, title: 'Quy Trình Bón Phân Cho Cây Ăn Trái',        topic: 'Kỹ Thuật',   plant: 'Cây ăn trái',   date: '12/2025' },
  { id: 3, title: 'Hướng Dẫn Vận Hành Máy Phun Điện 16L',      topic: 'Máy & TB',   plant: 'Tất cả',        date: '11/2025' },
  { id: 4, title: 'Phòng Trừ Tuyến Trùng Trên Tiêu, Cà Phê',  topic: 'Kỹ Thuật',   plant: 'Tiêu, Cà phê',  date: '10/2025' },
  { id: 5, title: 'Quản Lý Dịch Hại Tổng Hợp IPM Trên Lúa',   topic: 'Kỹ Thuật',   plant: 'Lúa',           date: '09/2025' },
];

window.DM.DOCS_VIDEO = [
  { id: 1, title: 'Demo Máy Phun Điện 16L Ngoài Đồng',               topic: 'Máy & TB',   plant: 'Lúa',           duration: '5:32' },
  { id: 2, title: 'Cách Pha Và Phun Thuốc Trừ Sâu An Toàn',          topic: 'Kỹ Thuật',   plant: 'Tất cả',        duration: '8:15' },
  { id: 3, title: 'Phòng Trừ Ốc Bươu Vàng Hiệu Quả Trên Ruộng Lúa', topic: 'Kỹ Thuật',   plant: 'Lúa',           duration: '6:48' },
  { id: 4, title: 'Hướng Dẫn Sử Dụng Thuốc Kích Thích Ra Hoa',       topic: 'Kỹ Thuật',   plant: 'Cây ăn trái',   duration: '4:20' },
  { id: 5, title: 'Kỹ Thuật Phun Thuốc Đúng Cách – 4 Đúng',          topic: 'Kỹ Thuật',   plant: 'Tất cả',        duration: '7:05' },
];

// User address book (mock)
window.DM.ADDRESSES = [
  { id: 1, name: 'Nguyễn Văn A', phone: '0901 234 567', address: '123 Đường ABC, Phường X, Quận Ninh Kiều, TP. Cần Thơ', isDefault: true,  label: 'Nhà' },
  { id: 2, name: 'Nguyễn Văn A', phone: '0901 234 567', address: '45 Đường Trần Hưng Đạo, Phường Mỹ Phước, TP. Long Xuyên, An Giang', isDefault: false, label: 'Ruộng' },
  { id: 3, name: 'Nguyễn Văn A', phone: '0987 654 321', address: '78 Quốc lộ 1A, Xã Tân Thành, Huyện Bình Tân, Vĩnh Long', isDefault: false, label: 'Kho' },
];

// Admin sample data
window.DM.ADMIN_USERS = [
  { id: 1, name: 'Nguyễn Văn A',  email: 'a@example.com',     phone: '0901 234 567', role: 'Khách hàng', status: 'Hoạt động',   joined: '12/01/2026', orders: 4 },
  { id: 2, name: 'Trần Thị Hà',   email: 'ha@example.com',    phone: '0912 345 678', role: 'Khách hàng', status: 'Hoạt động',   joined: '03/02/2026', orders: 7 },
  { id: 3, name: 'Lê Hoàng Nam',  email: 'nam@example.com',   phone: '0923 456 789', role: 'Đại lý',     status: 'Hoạt động',   joined: '15/12/2025', orders: 24 },
  { id: 4, name: 'Phạm Quốc Bảo', email: 'bao@example.com',   phone: '0934 567 890', role: 'Khách hàng', status: 'Khoá',         joined: '20/03/2026', orders: 1 },
  { id: 5, name: 'Vũ Thị Mai',    email: 'mai@example.com',   phone: '0945 678 901', role: 'Khách hàng', status: 'Hoạt động',   joined: '01/04/2026', orders: 2 },
];

window.DM.ADMIN_ORDERS = [
  { id: 'DM2604001', user: 'Nguyễn Văn A',  date: '26/04/2026', total: 1250000, status: 'Đang giao',  pay: 'COD' },
  { id: 'DM2604002', user: 'Trần Thị Hà',   date: '25/04/2026', total: 540000,  status: 'Chờ xác nhận', pay: 'COD' },
  { id: 'DM2604003', user: 'Lê Hoàng Nam',  date: '24/04/2026', total: 8500000, status: 'Đã giao',     pay: 'Chuyển khoản' },
  { id: 'DM2603002', user: 'Nguyễn Văn A',  date: '15/04/2026', total: 450000,  status: 'Đã giao',     pay: 'COD' },
  { id: 'DM2603012', user: 'Vũ Thị Mai',    date: '12/04/2026', total: 220000,  status: 'Đã giao',     pay: 'COD' },
  { id: 'DM2602008', user: 'Phạm Quốc Bảo', date: '02/03/2026', total: 180000,  status: 'Đã hủy',      pay: 'COD' },
];

window.DM.ADMIN_REVIEWS = [
  { id: 1, product: 'Anvil 5SC',      user: 'Nguyễn Văn A',  rating: 5, date: '15/04/2026', text: 'Sản phẩm chất lượng, hiệu quả rõ rệt sau 2 lần sử dụng.', status: 'Đã duyệt' },
  { id: 2, product: 'Regent 800WG',   user: 'Trần Thị Hà',   rating: 5, date: '08/04/2026', text: 'Giao hàng nhanh, đóng gói cẩn thận. Tư vấn nhiệt tình.', status: 'Đã duyệt' },
  { id: 3, product: 'Auxin 10SL',     user: 'Lê Hoàng Nam',  rating: 4, date: '02/04/2026', text: 'Hiệu quả tốt, giá hơi cao. Mong có khuyến mãi thường xuyên.', status: 'Chờ duyệt' },
  { id: 4, product: 'Deadline 5G',    user: 'Phạm Quốc Bảo', rating: 2, date: '25/03/2026', text: 'Chưa thấy hiệu quả như mong đợi.', status: 'Chờ duyệt' },
  { id: 5, product: 'Tervigo 020SC',  user: 'Vũ Thị Mai',    rating: 5, date: '20/03/2026', text: 'Tuyệt vời, sẽ ủng hộ shop dài hạn.', status: 'Đã duyệt' },
];

window.DM.ADMIN_PROMOS = [
  { id: 1, code: 'XUAN2026',     name: 'Khuyến mãi mùa Xuân 2026', discount: '20%',   start: '01/04/2026', end: '30/04/2026', status: 'Đang chạy', uses: 142 },
  { id: 2, code: 'FREESHIP500',  name: 'Miễn phí vận chuyển ≥500K', discount: 'Free ship', start: '01/03/2026', end: '31/12/2026', status: 'Đang chạy', uses: 487 },
  { id: 3, code: 'NEWUSER',      name: 'Khách mới giảm 50K',        discount: '50.000₫', start: '01/01/2026', end: '31/12/2026', status: 'Đang chạy', uses: 89 },
  { id: 4, code: 'TET2026',      name: 'Mừng Tết 2026',             discount: '15%',     start: '20/01/2026', end: '15/02/2026', status: 'Kết thúc',  uses: 234 },
];

window.DM.ADMIN_BANNERS = [
  { id: 1, title: 'Giải Pháp Thông Minh – Mùa Vụ Bội Thu', sub: 'Giảm 30% thuốc BVTV', active: true,  order: 1, link: '/products' },
  { id: 2, title: 'Sản Phẩm Độc Đáo – Hiệu Quả Vượt Trội',  sub: 'Auxin 10SL chỉ 85K',   active: true,  order: 2, link: '/products' },
  { id: 3, title: 'Dịch Vụ Chuyên Nghiệp – Tận Tâm 24/7',   sub: 'Hotline: 1800 xxxx',   active: false, order: 3, link: '/contact' },
];

window.DM.ADMIN_CONTACTS = [
  { id: 1, key: 'Hotline',    value: '1800 xxxx',  visible: true },
  { id: 2, key: 'Email',      value: 'cskh@duocmua.vn', visible: true },
  { id: 3, key: 'Địa chỉ',    value: '123 Đường ABC, Quận Ninh Kiều, TP. Cần Thơ', visible: true },
  { id: 4, key: 'Zalo OA',    value: '0901 234 567', visible: true },
  { id: 5, key: 'Facebook',   value: 'fb.com/duocmuagah', visible: true },
  { id: 6, key: 'Youtube',    value: 'youtube.com/@duocmuagah', visible: true },
  { id: 7, key: 'Tiktok',     value: 'tiktok.com/@duocmuagah', visible: false },
];
