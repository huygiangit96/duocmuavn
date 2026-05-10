// dm-pages.jsx — All page components for Được Mùa GAH
const { useState, useEffect, useRef } = React;
const { CATS, PLANTS, PRODUCTS, NEWS, DOCS_PAPER, DOCS_VIDEO } = window.DM;
const { IC, fmt, Stars, ProductImg, NewsImg, SectionTitle, ProductCard, dmBtn, dmOutline, dmInput, dmIcon, dmQty } = window;

// ═══════════════════════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════════════
const HomePage = ({ setPage, addToCart, setSelectedProduct }) => {
  const [heroIdx, setHeroIdx] = useState(0);

  const heroes = [
    { tag: 'Máy & Thiết Bị', title: 'Cơ Giới Hoá Nông Nghiệp Thông Minh', sub: 'Máy phun điện, máy sạ lúa, thiết bị tiên tiến cho nhà nông hiện đại', bg: 'linear-gradient(135deg, #1E5BAA 0%, #0d3878 100%)', accent: '#FFE600' },
    { tag: 'Thuốc Bảo Vệ Thực Vật', title: 'Bảo Vệ Cây Trồng Toàn Diện', sub: 'Thuốc trừ sâu, bệnh, tuyến trùng – hiệu quả cao, an toàn cho môi trường', bg: 'linear-gradient(135deg, #2d6a10 0%, #1a4008 100%)', accent: '#9EC231' },
    { tag: 'Kích Thích Sinh Trưởng', title: 'Năng Suất Vượt Trội Mỗi Mùa Vụ', sub: 'Sản phẩm sinh học kích thích ra rễ, đẻ nhánh, đậu trái vượt trội', bg: 'linear-gradient(135deg, #7a5f00 0%, #4a3800 100%)', accent: '#FFE600' },
  ];

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i+1) % heroes.length), 4500);
    return () => clearInterval(t);
  }, []);

  const h = heroes[heroIdx];
  const featured = PRODUCTS.filter(p => ['Bán chạy','Mới'].includes(p.tag)).slice(0, 8);

  return (
    <div>
      {/* ── Hero ── */}
      <section style={{ background: h.bg, minHeight: 480, display: 'flex', alignItems: 'center', padding: '110px 0 64px', transition: 'background 1.2s ease', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circle */}
        <div style={{ position: 'absolute', right: -80, top: -80, width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 60, top: 60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.14)', color: '#fff', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 20, backdropFilter: 'blur(6px)', letterSpacing: 0.5 }}>{h.tag}</div>
            <h1 style={{ color: '#fff', fontSize: 'clamp(22px,4vw,46px)', fontWeight: 800, margin: '0 0 16px', lineHeight: 1.15, textWrap: 'pretty' }}>{h.title}</h1>
            <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 16, margin: '0 0 36px', lineHeight: 1.7, maxWidth: 480 }}>{h.sub}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => setPage('products')} style={{ ...dmBtn(h.accent, '#1a1a1a'), fontSize: 15, padding: '13px 28px', borderRadius: 12 }}>Xem Sản Phẩm</button>
              <button onClick={() => setPage('contact')} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', backdropFilter: 'blur(4px)', transition: 'background 0.2s' }}>Tư Vấn Ngay</button>
            </div>
          </div>
          <div className="hide-sm" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '3px solid rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="logo.png" style={{ width: 160, height: 160, objectFit: 'contain', filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.3))' }} alt="" />
            </div>
          </div>
        </div>

        {/* Hero dots */}
        <div style={{ position: 'absolute', bottom: 22, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
          {heroes.map((_,i) => (
            <div key={i} onClick={() => setHeroIdx(i)} style={{ width: i===heroIdx ? 28 : 8, height: 8, borderRadius: 4, background: i===heroIdx ? '#fff' : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.35s' }} />
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section style={{ padding: '60px 0', background: 'var(--bg-subtle)' }}>
        <div className="container">
          <SectionTitle title="Danh Mục Sản Phẩm" sub="Đa dạng sản phẩm nông nghiệp chất lượng cao" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 14 }}>
            {CATS.map(cat => (
              <div key={cat.id} onClick={() => setPage('products')}
                style={{ background: '#fff', borderRadius: 14, padding: '22px 14px', textAlign: 'center', cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.25s', boxShadow: 'var(--shadow)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cat.color; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow)'; }}
              >
                <div style={{ width: 52, height: 52, background: cat.bg, borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" fill={cat.color} opacity="0.25"/><circle cx="12" cy="12" r="5" fill={cat.color} opacity="0.5"/><circle cx="12" cy="12" r="2.5" fill={cat.color}/></svg>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}>{cat.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <SectionTitle title="Sản Phẩm Nổi Bật" sub="Được nông dân tin dùng nhiều nhất" noMargin />
            <button onClick={() => setPage('products')} style={{ ...dmOutline(), padding: '8px 16px', fontSize: 13 }}>Xem tất cả <IC.ChevR /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 18 }}>
            {featured.map(p => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} onView={p => { setSelectedProduct(p); setPage('product-detail'); }} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: 'var(--blue)', padding: '48px 0' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 24, textAlign: 'center' }}>
          {[['15+','Năm kinh nghiệm'],['200+','Sản phẩm'],['5.000+','Khách hàng tin dùng'],['50+','Đại lý toàn quốc']].map(([n,l]) => (
            <div key={l}>
              <div style={{ fontSize: 40, fontWeight: 900, color: '#FFE600', lineHeight: 1 }}>{n}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── News ── */}
      <section style={{ padding: '60px 0', background: 'var(--bg-subtle)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <SectionTitle title="Tin Tức & Kiến Thức" sub="Cập nhật kỹ thuật nông nghiệp mới nhất" noMargin />
            <button onClick={() => setPage('news')} style={{ ...dmOutline(), padding: '8px 16px', fontSize: 13 }}>Xem tất cả <IC.ChevR /></button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))', gap: 18 }}>
            {NEWS.slice(0,3).map(n => (
              <div key={n.id} onClick={() => setPage('news')} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', transition: 'transform 0.25s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <NewsImg catName={n.catName} />
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    <span style={{ background: 'var(--green)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 5 }}>{n.catName}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{n.date}</span>
                  </div>
                  <h3 style={{ margin: '0 0 7px', fontSize: 14, fontWeight: 700, lineHeight: 1.45, color: 'var(--text)', textWrap: 'pretty' }}>{n.title}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{n.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '64px 0', background: 'linear-gradient(135deg, #1a3f06 0%, #0d2203 100%)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#fff', fontSize: 'clamp(20px,3vw,34px)', fontWeight: 800, margin: '0 0 10px' }}>Cần Tư Vấn Kỹ Thuật?</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 16, margin: '0 0 32px' }}>Đội ngũ kỹ sư nông nghiệp luôn sẵn sàng hỗ trợ bạn mọi lúc</p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="tel:1800xxxx" style={{ ...dmBtn('#9EC231', '#1a1a1a'), fontSize: 15, padding: '13px 28px', borderRadius: 12, textDecoration: 'none' }}><IC.Phone />Gọi Hotline</a>
            <button onClick={() => setPage('contact')} style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.35)', color: '#fff', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>Gửi Yêu Cầu</button>
          </div>
        </div>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PRODUCTS PAGE
// ═══════════════════════════════════════════════════════════════
const ProductsPage = ({ addToCart, setSelectedProduct, setPage }) => {
  const [selCat, setSelCat] = useState(null);
  const [selPlant, setSelPlant] = useState(null);
  const [sort, setSort] = useState('default');
  const [q, setQ] = useState('');
  const [showMobFilter, setShowMobFilter] = useState(false);

  let list = PRODUCTS;
  if (selCat) list = list.filter(p => p.catId === selCat);
  if (selPlant) list = list.filter(p => p.plants && p.plants.includes(selPlant));
  if (q) list = list.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  if (sort === 'asc') list = [...list].sort((a,b) => a.price - b.price);
  if (sort === 'desc') list = [...list].sort((a,b) => b.price - a.price);
  if (sort === 'rating') list = [...list].sort((a,b) => b.rating - a.rating);

  const FilterSidebar = () => (
    <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: 'var(--shadow)', border: '1px solid var(--border)', position: 'sticky', top: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Danh Mục</h3>
        {(selCat || selPlant) && <button onClick={() => { setSelCat(null); setSelPlant(null); }} style={{ ...dmIcon, fontSize: 12, color: 'var(--orange)', padding: '2px 6px', fontFamily: 'var(--font)', fontWeight: 600, background: '#fff3ed', borderRadius: 6 }}>Xóa lọc</button>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 22 }}>
        {[{id:null, name:'Tất cả', color:'var(--text)'},...CATS].map(c => (
          <div key={c.id ?? 'all'} onClick={() => setSelCat(c.id)} style={{ padding: '9px 12px', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: selCat===c.id||(c.id==null&&!selCat) ? 700 : 400, background: selCat===c.id||(c.id==null&&!selCat) ? (c.color || 'var(--blue)') : 'transparent', color: selCat===c.id||(c.id==null&&!selCat) ? '#fff' : 'var(--text)', transition: 'all 0.2s' }}>
            {c.fullName || c.name}
          </div>
        ))}
      </div>
      <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800 }}>Cây Trồng</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {PLANTS.map(p => (
          <div key={p} onClick={() => setSelPlant(selPlant===p ? null : p)} style={{ padding: '5px 11px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, border: '1.5px solid', borderColor: selPlant===p ? 'var(--green)' : 'var(--border)', background: selPlant===p ? 'var(--green)' : '#fff', color: selPlant===p ? '#fff' : 'var(--text)', transition: 'all 0.2s' }}>{p}</div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding: '96px 0 56px', minHeight: '100vh' }}>
      <div className="container">
        {/* Top bar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, flex: 1, minWidth: 120 }}>Sản Phẩm</h1>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm sản phẩm..." style={{ ...dmInput, width: 200 }} />
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ ...dmInput, width: 'auto', cursor: 'pointer' }}>
            <option value="default">Mặc định</option>
            <option value="asc">Giá tăng dần</option>
            <option value="desc">Giá giảm dần</option>
            <option value="rating">Đánh giá cao</option>
          </select>
          <button className="mob-filter-btn" onClick={() => setShowMobFilter(v=>!v)} style={{ ...dmBtn(showMobFilter ? 'var(--blue)' : 'var(--bg-subtle)', showMobFilter ? '#fff' : 'var(--text)'), padding: '10px 14px', display: 'none' }}><IC.Filter /></button>
        </div>

        {/* Mobile filter drawer */}
        {showMobFilter && (
          <div style={{ marginBottom: 16 }}><FilterSidebar /></div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '230px 1fr', gap: 22 }} className="prod-layout">
          <div className="prod-sidebar"><FilterSidebar /></div>
          <div>
            <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{list.length} sản phẩm</div>
            {list.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: '#fff', borderRadius: 14 }}>
                <p style={{ marginBottom: 16 }}>Không tìm thấy sản phẩm phù hợp</p>
                <button onClick={() => { setSelCat(null); setSelPlant(null); setQ(''); }} style={dmBtn('var(--green)')}>Xóa bộ lọc</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(188px,1fr))', gap: 16 }}>
                {list.map(p => (
                  <ProductCard key={p.id} product={p} onAdd={addToCart} onView={p => { setSelectedProduct(p); setPage('product-detail'); }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// PRODUCT DETAIL PAGE
// ═══════════════════════════════════════════════════════════════
const ProductDetailPage = ({ product, addToCart, setPage }) => {
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState('desc');
  if (!product) { setPage('products'); return null; }
  const cat = CATS.find(c => c.id === product.catId) || {};
  const related = PRODUCTS.filter(p => p.catId === product.catId && p.id !== product.id).slice(0,4);

  return (
    <div style={{ padding: '96px 0 56px' }}>
      <div className="container">
        <div style={{ display: 'flex', gap: 7, fontSize: 13, color: 'var(--text-muted)', marginBottom: 22, alignItems: 'center', flexWrap: 'wrap' }}>
          <span onClick={() => setPage('home')} style={{ cursor:'pointer', color:'var(--blue)', fontWeight:600 }}>Trang chủ</span>
          <IC.ChevR />
          <span onClick={() => setPage('products')} style={{ cursor:'pointer', color:'var(--blue)', fontWeight:600 }}>Sản phẩm</span>
          <IC.ChevR />
          <span>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 40 }} className="detail-grid">
          {/* Image */}
          <div style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <ProductImg catId={product.catId} name={product.name} height={320} />
            <div style={{ display: 'flex', gap: 8, padding: '12px 16px', background: '#fafbf8' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 60, height: 60, borderRadius: 8, border: `2px solid ${i===0?'var(--blue)':'var(--border)'}`, overflow: 'hidden', cursor: 'pointer', opacity: i===0?1:0.5 }}>
                  <ProductImg catId={product.catId} name="" height={60} />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            {product.tag && <span style={{ background: product.tag==='Mới'?'var(--green)':'var(--orange)', color:'#fff', fontSize:12, fontWeight:700, padding:'4px 10px', borderRadius:5, display:'inline-block', marginBottom:10 }}>{product.tag}</span>}
            <div style={{ fontSize:12, fontWeight:700, color:cat.color, letterSpacing:1, textTransform:'uppercase', marginBottom:8 }}>{cat.fullName}</div>
            <h1 style={{ fontSize:'clamp(20px,3vw,26px)', fontWeight:800, margin:'0 0 12px', lineHeight:1.3 }}>{product.name}</h1>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <Stars rating={product.rating} />
              <span style={{ fontSize:13, color:'var(--text-muted)' }}>{product.rating} ({product.reviews} đánh giá)</span>
            </div>

            <div style={{ fontSize:34, fontWeight:900, color:'var(--blue)', letterSpacing:-1, marginBottom:3, display:'flex', alignItems:'baseline', gap:12, flexWrap:'wrap' }}>
              {fmt(product.price)}
              {product.listPrice && product.listPrice > product.price && (
                <>
                  <span style={{ fontSize:18, color:'#999', textDecoration:'line-through', fontWeight:600 }}>{fmt(product.listPrice)}</span>
                  <span style={{ fontSize:13, background:'#c0392b', color:'#fff', padding:'4px 10px', borderRadius:5, fontWeight:800, letterSpacing:0 }}>{product.promo || `Giảm ${Math.round((1-product.price/product.listPrice)*100)}%`}</span>
                </>
              )}
            </div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:20 }}>/{product.unit}</div>

            {product.plants && product.plants.length > 0 && (
              <div style={{ marginBottom:18, display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)' }}>Cây trồng:</span>
                {product.plants.map(p => <span key={p} style={{ background:'#f0f7e0', color:'var(--green-dark)', fontSize:12, fontWeight:700, padding:'3px 9px', borderRadius:5 }}>{p}</span>)}
              </div>
            )}

            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:22 }}>
              <div style={{ display:'flex', alignItems:'center', border:'1.5px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
                <button onClick={() => setQty(Math.max(1,qty-1))} style={{ ...dmQty, border:'none', width:38, height:38, borderRadius:0 }}><IC.Minus /></button>
                <span style={{ width:44, textAlign:'center', fontWeight:800, fontSize:16 }}>{qty}</span>
                <button onClick={() => setQty(qty+1)} style={{ ...dmQty, border:'none', width:38, height:38, borderRadius:0 }}><IC.Plus /></button>
              </div>
              <span style={{ fontSize:13, color:'#27ae60', fontWeight:600 }}>Còn hàng</span>
            </div>

            <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:20 }}>
              <button onClick={() => addToCart(product, qty)} style={{ ...dmBtn('var(--green)'), fontSize:15, padding:'13px 26px', borderRadius:11 }}><IC.Plus />Thêm vào giỏ</button>
              <button style={{ ...dmBtn('var(--blue)'), fontSize:15, padding:'13px 26px', borderRadius:11 }}>Mua ngay</button>
            </div>

            <div style={{ background:'var(--bg-subtle)', borderRadius:10, padding:'14px 16px', display:'flex', alignItems:'center', gap:10, fontSize:13, color:'var(--text-muted)' }}>
              <IC.Phone />
              <span>Hotline tư vấn: <strong style={{ color:'var(--blue)' }}>1800 xxxx</strong> (miễn phí)</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background:'#fff', borderRadius:14, border:'1.5px solid var(--border)', marginBottom:40, boxShadow:'var(--shadow)' }}>
          <div style={{ display:'flex', borderBottom:'1px solid var(--border)', overflowX:'auto' }}>
            {[['desc','Mô Tả Sản Phẩm'],['usage','Hướng Dẫn Sử Dụng'],['reviews',`Đánh Giá (${product.reviews})`],['docs','Tài Liệu Đính Kèm']].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)} style={{ padding:'14px 22px', background:'none', border:'none', cursor:'pointer', fontWeight:tab===k?800:500, fontSize:14, color:tab===k?'var(--blue)':'var(--text-muted)', borderBottom:tab===k?'3px solid var(--blue)':'3px solid transparent', transition:'all 0.2s', fontFamily:'var(--font)', whiteSpace:'nowrap' }}>{l}</button>
            ))}
          </div>
          <div style={{ padding:'22px 24px', lineHeight:1.85, color:'var(--text)', fontSize:14 }}>
            {tab==='desc' && <div>
              <p>{product.desc}</p>
              <p style={{ marginTop:14 }}>Sản phẩm đạt tiêu chuẩn chất lượng theo quy định của Bộ Nông nghiệp và PTNT Việt Nam. Được kiểm tra nghiêm ngặt trước khi đưa ra thị trường, đảm bảo hiệu lực và an toàn sử dụng.</p>
            </div>}
            {tab==='usage' && <div>
              <p><strong>Liều lượng:</strong> Theo hướng dẫn ghi trên nhãn bao bì sản phẩm.</p>
              <p><strong>Thời điểm phun:</strong> Buổi sáng sớm (trước 9h) hoặc chiều mát (sau 16h), tránh phun lúc trời nắng gắt và sắp mưa.</p>
              <p><strong>Phương pháp pha:</strong> Pha theo tỷ lệ khuyến cáo, khuấy đều trước khi phun.</p>
              <p><strong>Lưu ý an toàn:</strong> Mang đầy đủ đồ bảo hộ (khẩu trang, kính, găng tay). Rửa tay sạch sau khi sử dụng. Bảo quản nơi thoáng mát, tránh xa tầm tay trẻ em.</p>
            </div>}
            {tab==='reviews' && <div>
              {/* Rating summary */}
              <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:24, padding:'14px 0 22px', borderBottom:'1px solid var(--border)', marginBottom:18, alignItems:'center' }} className="rev-summary">
                <div style={{ textAlign:'center', paddingRight:24, borderRight:'1px solid var(--border)' }}>
                  <div style={{ fontSize:42, fontWeight:900, color:'var(--blue)', lineHeight:1 }}>{product.rating}</div>
                  <div style={{ margin:'6px 0' }}><Stars rating={product.rating} /></div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{product.reviews} đánh giá</div>
                </div>
                <div>
                  {[5,4,3,2,1].map(s => {
                    const pct = s===5?68:s===4?22:s===3?7:s===2?2:1;
                    return (
                      <div key={s} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:5, fontSize:12 }}>
                        <span style={{ width:42, display:'flex', gap:2, alignItems:'center' }}>{s}<IC.Star on={true} /></span>
                        <div style={{ flex:1, height:7, background:'var(--bg-subtle)', borderRadius:4, overflow:'hidden' }}>
                          <div style={{ width:pct+'%', height:'100%', background:'var(--green)', borderRadius:4 }} />
                        </div>
                        <span style={{ width:32, color:'var(--text-muted)', textAlign:'right' }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Individual reviews */}
              {[
                { name:'Nguyễn Văn Tâm', loc:'Cần Thơ', rating:5, date:'15/04/2026', text:'Sản phẩm chất lượng, hiệu quả rõ rệt sau 2 lần sử dụng. Cây trồng phát triển tốt, ít sâu bệnh hơn hẳn. Sẽ tiếp tục mua lại.', verified:true },
                { name:'Trần Thị Hà', loc:'An Giang', rating:5, date:'08/04/2026', text:'Giao hàng nhanh, đóng gói cẩn thận. Hướng dẫn sử dụng rõ ràng. Tư vấn viên rất nhiệt tình giải đáp thắc mắc.', verified:true },
                { name:'Lê Hoàng Nam', loc:'Đồng Tháp', rating:4, date:'02/04/2026', text:'Hiệu quả tốt, tuy nhiên giá hơi cao so với mặt bằng. Mong shop có nhiều chương trình khuyến mãi cho khách hàng thân thiết.', verified:true },
                { name:'Phạm Quốc Bảo', loc:'Tiền Giang', rating:5, date:'25/03/2026', text:'Đã sử dụng nhiều lần, sản phẩm đáng tin cậy. Tôi giới thiệu cho bà con trong xóm cùng dùng.', verified:false },
              ].map((r,i) => (
                <div key={i} style={{ padding:'16px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', gap:12, marginBottom:8 }}>
                    <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg, var(--blue), var(--green))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:800, fontSize:14, flexShrink:0 }}>{r.name[0]}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                        <strong style={{ fontSize:14 }}>{r.name}</strong>
                        {r.verified && <span style={{ background:'#e8f4e0', color:'var(--green-dark)', fontSize:10, fontWeight:700, padding:'2px 7px', borderRadius:4, display:'inline-flex', alignItems:'center', gap:3 }}><IC.Check />Đã mua</span>}
                      </div>
                      <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{r.loc} · {r.date}</div>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  <p style={{ margin:0, fontSize:13.5, lineHeight:1.7, color:'var(--text)' }}>{r.text}</p>
                </div>
              ))}
              <div style={{ marginTop:20, display:'flex', gap:10, justifyContent:'center' }}>
                <button style={dmOutline()}>Xem thêm đánh giá</button>
                <button style={dmBtn('var(--green)')}>Viết đánh giá</button>
              </div>
            </div>}
            {tab==='docs' && <div>
              {DOCS_PAPER.slice(0,2).map(d => (
                <div key={d.id} style={{ display:'flex', gap:12, alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                  <div style={{ color:'var(--blue)' }}><IC.FileText /></div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:14 }}>{d.title}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{d.topic} · {d.date}</div>
                  </div>
                  <button style={{ ...dmOutline(), padding:'7px 13px', fontSize:12 }}><IC.Download />Tải về</button>
                </div>
              ))}
            </div>}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <SectionTitle title="Sản Phẩm Liên Quan" />
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(188px,1fr))', gap:16 }}>
              {related.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} onView={p => { setPage('product-detail'); window.DM._selProduct = p; }} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CHECKOUT PAGE
// ═══════════════════════════════════════════════════════════════
const CheckoutPage = ({ cart, setCart, setPage }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:'', phone:'', address:'', city:'', note:'', pay:'cod' });
  const [done, setDone] = useState(false);
  const total = cart.reduce((s,i) => s+i.price*i.qty, 0);
  const shipping = total > 500000 ? 0 : 30000;
  const upd = (k,v) => setForm(f => ({...f, [k]:v}));

  if (done) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'100px 20px 40px', gap:16 }}>
      <div style={{ width:80, height:80, borderRadius:'50%', background:'#f0f7e0', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
      </div>
      <h2 style={{ fontWeight:800, color:'var(--green)', fontSize:26, textAlign:'center' }}>Đặt Hàng Thành Công!</h2>
      <p style={{ color:'var(--text-muted)', textAlign:'center', maxWidth:360 }}>Cảm ơn bạn đã tin tưởng Được Mùa GAH. Chúng tôi sẽ liên hệ xác nhận trong vòng 30 phút.</p>
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
        <button onClick={() => { setPage('home'); setCart([]); }} style={dmBtn('var(--green)')}>Về Trang Chủ</button>
        <button onClick={() => { setDone(false); setPage('account'); }} style={dmOutline()}>Xem Đơn Hàng</button>
      </div>
    </div>
  );

  const steps = ['Giao hàng','Thanh toán','Xác nhận'];
  return (
    <div style={{ padding:'96px 0 56px', background:'var(--bg-subtle)', minHeight:'100vh' }}>
      <div className="container" style={{ maxWidth:920 }}>
        <h1 style={{ fontSize:26, fontWeight:800, marginBottom:28 }}>Đặt Hàng</h1>

        {/* Step indicator */}
        <div style={{ display:'flex', alignItems:'center', marginBottom:30 }}>
          {steps.map((s,i) => (
            <React.Fragment key={i}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:30, height:30, borderRadius:'50%', background:step>i+1?'var(--green)':step===i+1?'var(--blue)':'#dde', color:step>=i+1?'#fff':'var(--text-muted)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, flexShrink:0 }}>
                  {step>i+1?'✓':i+1}
                </div>
                <span style={{ fontSize:13, fontWeight:step===i+1?700:400, color:step===i+1?'var(--blue)':'var(--text-muted)', whiteSpace:'nowrap' }}>{s}</span>
              </div>
              {i<2 && <div style={{ flex:1, height:2, background:step>i+1?'var(--green)':'#dde', margin:'0 10px' }} />}
            </React.Fragment>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:22, alignItems:'start' }} className="checkout-grid">
          <div style={{ background:'#fff', borderRadius:14, padding:26, boxShadow:'var(--shadow)' }}>
            {step===1 && <>
              <h3 style={{ margin:'0 0 20px', fontWeight:800 }}>Thông Tin Giao Hàng</h3>
              {[['name','Họ tên *'],['phone','Số điện thoại *'],['address','Địa chỉ giao hàng *'],['city','Tỉnh / Thành phố *']].map(([k,l]) => (
                <div key={k} style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>{l}</label>
                  <input value={form[k]} onChange={e => upd(k,e.target.value)} style={dmInput} />
                </div>
              ))}
              <div style={{ marginBottom:22 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>Ghi chú</label>
                <textarea value={form.note} onChange={e => upd('note',e.target.value)} placeholder="Yêu cầu đặc biệt..." style={{ ...dmInput, height:80, resize:'vertical' }} />
              </div>
              <button onClick={() => setStep(2)} style={{ ...dmBtn('var(--blue)'), width:'100%', justifyContent:'center', padding:14 }}>Tiếp theo <IC.ChevR /></button>
            </>}

            {step===2 && <>
              <h3 style={{ margin:'0 0 20px', fontWeight:800 }}>Phương Thức Thanh Toán</h3>
              {[['cod','Thanh toán khi nhận hàng (COD)'],['bank','Chuyển khoản ngân hàng'],['momo','Ví MoMo'],['vnpay','VNPay']].map(([v,l]) => (
                <label key={v} style={{ display:'flex', gap:12, alignItems:'center', padding:'14px 16px', borderRadius:10, border:'2px solid', borderColor:form.pay===v?'var(--blue)':'var(--border)', background:form.pay===v?'#e8f0fb':'#fff', cursor:'pointer', marginBottom:10, transition:'all 0.2s' }}>
                  <input type="radio" name="pay" value={v} checked={form.pay===v} onChange={() => upd('pay',v)} style={{ accentColor:'var(--blue)', width:18, height:18 }} />
                  <span style={{ fontWeight:600, fontSize:14 }}>{l}</span>
                </label>
              ))}
              <div style={{ display:'flex', gap:10, marginTop:22 }}>
                <button onClick={() => setStep(1)} style={{ ...dmOutline(), flex:1, justifyContent:'center' }}><IC.ChevL />Quay lại</button>
                <button onClick={() => setStep(3)} style={{ ...dmBtn('var(--blue)'), flex:1, justifyContent:'center' }}>Tiếp theo <IC.ChevR /></button>
              </div>
            </>}

            {step===3 && <>
              <h3 style={{ margin:'0 0 20px', fontWeight:800 }}>Xác Nhận Đơn Hàng</h3>
              <div style={{ background:'var(--bg-subtle)', borderRadius:10, padding:16, marginBottom:20, fontSize:14, lineHeight:2 }}>
                <div><strong>Người nhận:</strong> {form.name||'—'}</div>
                <div><strong>Điện thoại:</strong> {form.phone||'—'}</div>
                <div><strong>Địa chỉ:</strong> {form.address}{form.city?`, ${form.city}`:''}</div>
                <div><strong>Thanh toán:</strong> {form.pay.toUpperCase()}</div>
                {form.note && <div><strong>Ghi chú:</strong> {form.note}</div>}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setStep(2)} style={{ ...dmOutline(), flex:1, justifyContent:'center' }}><IC.ChevL />Quay lại</button>
                <button onClick={() => setDone(true)} style={{ ...dmBtn('var(--orange)'), flex:1, justifyContent:'center', padding:14 }}>Xác Nhận Đặt Hàng</button>
              </div>
            </>}
          </div>

          {/* Summary */}
          <div style={{ background:'#fff', borderRadius:14, padding:22, boxShadow:'var(--shadow)' }}>
            <h3 style={{ margin:'0 0 14px', fontWeight:800, fontSize:15 }}>Đơn hàng ({cart.reduce((s,i)=>s+i.qty,0)} sp)</h3>
            {cart.map(item => (
              <div key={item.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:13 }}>
                <span style={{ flex:1, paddingRight:8 }}>{item.name} <span style={{ color:'var(--text-muted)' }}>x{item.qty}</span></span>
                <span style={{ fontWeight:700, flexShrink:0 }}>{fmt(item.price*item.qty)}</span>
              </div>
            ))}
            <div style={{ paddingTop:12, fontSize:14 }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0' }}>
                <span>Tạm tính</span><span>{fmt(total)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'5px 0' }}>
                <span>Vận chuyển</span><span style={{ color:shipping===0?'var(--green)':'inherit' }}>{shipping===0?'Miễn phí':fmt(shipping)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'12px 0 4px', fontWeight:800, fontSize:17, color:'var(--blue)', borderTop:'2px solid var(--border)', marginTop:6 }}>
                <span>Tổng cộng</span><span>{fmt(total+shipping)}</span>
              </div>
              {shipping===0 && <div style={{ fontSize:12, color:'var(--green)', fontWeight:600 }}>Miễn phí giao hàng cho đơn &gt; 500.000₫</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// NEWS PAGE
// ═══════════════════════════════════════════════════════════════
const NewsPage = ({ setPage }) => {
  const [selCat, setSelCat] = useState(null);
  const [q, setQ] = useState('');
  const cats = [...new Set(NEWS.map(n => n.catName))];
  const list = NEWS.filter(n => (!selCat||n.catName===selCat) && (!q||n.title.toLowerCase().includes(q.toLowerCase())));

  return (
    <div style={{ padding:'96px 0 56px' }}>
      <div className="container">
        <div style={{ marginBottom:32 }}>
          <h1 style={{ fontSize:28, fontWeight:800, margin:'0 0 5px' }}>Tin Tức & Kiến Thức</h1>
          <p style={{ margin:0, color:'var(--text-muted)' }}>Cập nhật kỹ thuật nông nghiệp và thị trường mới nhất</p>
        </div>

        {/* Featured 2-up */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:36 }} className="news-2up">
          {NEWS.filter(n => n.featured).map(n => (
            <div key={n.id} style={{ background:'linear-gradient(135deg, var(--blue) 0%, #0d3878 100%)', borderRadius:16, padding:30, color:'#fff', cursor:'pointer', position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-30, right:-30, width:160, height:160, background:'rgba(255,255,255,0.05)', borderRadius:'50%' }} />
              <span style={{ background:'var(--green)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:5, display:'inline-block', marginBottom:12 }}>{n.catName}</span>
              <h3 style={{ margin:'0 0 10px', fontSize:18, fontWeight:800, lineHeight:1.4 }}>{n.title}</h3>
              <p style={{ margin:'0 0 14px', opacity:0.78, fontSize:13, lineHeight:1.65 }}>{n.excerpt}</p>
              <div style={{ fontSize:12, opacity:0.55 }}>{n.date}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap', alignItems:'center' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm bài viết..." style={{ ...dmInput, width:220 }} />
          {[null,...cats].map(c => (
            <div key={c||'all'} onClick={() => setSelCat(c)} style={{ padding:'7px 15px', borderRadius:20, cursor:'pointer', fontSize:13, fontWeight:600, border:'1.5px solid', borderColor:selCat===c?'var(--blue)':'var(--border)', background:selCat===c?'#e8f0fb':'#fff', color:selCat===c?'var(--blue)':'var(--text)', transition:'all 0.2s' }}>{c||'Tất cả'}</div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(258px,1fr))', gap:18 }}>
          {list.map(n => (
            <div key={n.id} style={{ background:'#fff', borderRadius:14, overflow:'hidden', cursor:'pointer', boxShadow:'var(--shadow)', border:'1px solid var(--border)', transition:'transform 0.25s' }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform='none'}
            >
              <NewsImg catName={n.catName} />
              <div style={{ padding:16 }}>
                <div style={{ display:'flex', gap:8, marginBottom:8, alignItems:'center' }}>
                  <span style={{ background:'var(--green)', color:'#fff', fontSize:11, fontWeight:700, padding:'3px 8px', borderRadius:5 }}>{n.catName}</span>
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>{n.date}</span>
                </div>
                <h3 style={{ margin:'0 0 7px', fontSize:14, fontWeight:700, lineHeight:1.45 }}>{n.title}</h3>
                <p style={{ margin:'0 0 12px', fontSize:13, color:'var(--text-muted)', lineHeight:1.6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{n.excerpt}</p>
                <div style={{ display:'flex', gap:8 }}>
                  <button style={{ ...dmOutline(), padding:'6px 12px', fontSize:12 }}>Đọc tiếp</button>
                  <button style={{ ...dmIcon, padding:6, color:'var(--text-muted)' }}><IC.Share /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS PAGE
// ═══════════════════════════════════════════════════════════════
const DocumentsPage = () => {
  const [tab, setTab] = useState('paper');
  const [q, setQ] = useState('');
  const [plant, setPlant] = useState(null);
  const allPlants = [...new Set([...DOCS_PAPER.map(d=>d.plant),...DOCS_VIDEO.map(d=>d.plant)])];

  return (
    <div style={{ padding:'96px 0 56px' }}>
      <div className="container">
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:28, fontWeight:800, margin:'0 0 5px' }}>Tài Liệu Kỹ Thuật</h1>
          <p style={{ margin:0, color:'var(--text-muted)' }}>Hướng dẫn sử dụng sản phẩm và kỹ thuật canh tác</p>
        </div>

        <div style={{ display:'flex', gap:0, borderBottom:'2px solid var(--border)', marginBottom:22 }}>
          {[['paper',<IC.FileText />,'Tài Liệu Giấy'],['video',<IC.Video />,'Video Hướng Dẫn']].map(([k,icon,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ display:'flex', gap:8, alignItems:'center', padding:'12px 22px', background:'none', border:'none', cursor:'pointer', fontWeight:tab===k?800:500, fontSize:14, color:tab===k?'var(--blue)':'var(--text-muted)', borderBottom:tab===k?'3px solid var(--blue)':'3px solid transparent', marginBottom:-2, fontFamily:'var(--font)', transition:'all 0.2s' }}>{icon}{l}</button>
          ))}
        </div>

        <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm tài liệu..." style={{ ...dmInput, width:220 }} />
          {allPlants.map(p => (
            <div key={p} onClick={() => setPlant(plant===p?null:p)} style={{ padding:'6px 13px', borderRadius:20, cursor:'pointer', fontSize:12, fontWeight:600, border:'1.5px solid', borderColor:plant===p?'var(--green)':'var(--border)', background:plant===p?'#f0f7e0':'#fff', color:plant===p?'var(--green-dark)':'var(--text)', transition:'all 0.2s' }}>{p}</div>
          ))}
        </div>

        {tab==='paper' && (
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {DOCS_PAPER.filter(d => (!q||d.title.toLowerCase().includes(q.toLowerCase()))&&(!plant||d.plant===plant)).map(d => (
              <div key={d.id} style={{ background:'#fff', borderRadius:12, padding:'16px 20px', display:'flex', gap:14, alignItems:'center', boxShadow:'var(--shadow)', border:'1px solid var(--border)' }}>
                <div style={{ width:48, height:48, background:'#e8f0fb', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--blue)', flexShrink:0 }}><IC.FileText /></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{d.title}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{d.topic} · Cây trồng: {d.plant} · {d.date}</div>
                </div>
                <div style={{ display:'flex', gap:8, flexShrink:0 }}>
                  <button style={{ ...dmOutline(), padding:'8px 13px', fontSize:12 }}><IC.Eye />Xem</button>
                  <button style={{ ...dmBtn('var(--green)'), padding:'8px 13px', fontSize:12 }}><IC.Download />Tải</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==='video' && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(270px,1fr))', gap:18 }}>
            {DOCS_VIDEO.filter(d => (!q||d.title.toLowerCase().includes(q.toLowerCase()))&&(!plant||d.plant===plant)).map(d => (
              <div key={d.id} style={{ background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'var(--shadow)', border:'1px solid var(--border)', cursor:'pointer', transition:'transform 0.25s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='none'}
              >
                <div style={{ height:158, background:'linear-gradient(135deg, #0d1f3c 0%, #1a3a5a 100%)', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                  <div style={{ width:54, height:54, borderRadius:'50%', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', backdropFilter:'blur(4px)', border:'2px solid rgba(255,255,255,0.3)' }}><IC.Play /></div>
                  <div style={{ position:'absolute', bottom:9, right:10, background:'rgba(0,0,0,0.65)', color:'#fff', padding:'2px 8px', borderRadius:4, fontSize:12, fontWeight:700 }}>{d.duration}</div>
                </div>
                <div style={{ padding:14 }}>
                  <div style={{ fontWeight:700, fontSize:14, marginBottom:5, lineHeight:1.4 }}>{d.title}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>{d.topic} · {d.plant}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// CONTACT PAGE
// ═══════════════════════════════════════════════════════════════
const ContactPage = () => {
  const [form, setForm] = useState({ name:'', phone:'', email:'', msg:'' });
  const [sent, setSent] = useState(false);
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  return (
    <div style={{ padding:'96px 0 56px' }}>
      <div className="container">
        <div style={{ marginBottom:36 }}>
          <h1 style={{ fontSize:28, fontWeight:800, margin:'0 0 5px' }}>Liên Hệ & Hỗ Trợ</h1>
          <p style={{ margin:0, color:'var(--text-muted)' }}>Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40 }} className="contact-grid">
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:22 }}>
              {[
                { bg:'var(--blue)', color:'#fff', icon:<IC.Phone />, label:'Hotline', val:'1800 xxxx', href:'tel:1800xxxx' },
                { bg:'#0068ff', color:'#fff', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.1 2 11.1c0 3.1 1.6 5.9 4.1 7.7V22l3.8-2.1c.7.2 1.4.3 2.1.3 5.52 0 10-4.1 10-9.1S17.52 2 12 2zm1 12.3l-2.6-2.7-5 2.7 5.5-5.9 2.7 2.7 5-2.7-5.6 5.9z"/></svg>, label:'Zalo', val:'Chat tư vấn', href:'#' },
                { bg:'#f0f7e0', color:'var(--green-dark)', icon:<IC.Pin />, label:'Địa chỉ', val:'123 Đường NN, TP. Cần Thơ', href:null },
                { bg:'#fef0e6', color:'var(--orange)', icon:<IC.Mail />, label:'Email', val:'contact@duocmua.vn', href:'mailto:contact@duocmua.vn' },
              ].map(item => (
                <a key={item.label} href={item.href||'#'} style={{ background:item.bg, borderRadius:12, padding:'18px 14px', textDecoration:'none', display:'block', transition:'transform 0.2s, box-shadow 0.2s', boxShadow:'var(--shadow)' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='var(--shadow)';}}
                >
                  <div style={{ color:item.color, marginBottom:8 }}>{item.icon}</div>
                  <div style={{ fontSize:11, color:item.color, opacity:0.75, marginBottom:4, fontWeight:600, letterSpacing:0.3, textTransform:'uppercase' }}>{item.label}</div>
                  <div style={{ fontWeight:700, color:item.color, fontSize:13, lineHeight:1.4 }}>{item.val}</div>
                </a>
              ))}
            </div>

            {/* Map placeholder */}
            <div style={{ height:230, background:'linear-gradient(135deg, #e8f0fb 0%, #f0f7e0 100%)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)', flexDirection:'column', gap:8 }}>
              <IC.Pin />
              <span style={{ fontFamily:'monospace', fontSize:12, color:'#aaa', textAlign:'center' }}>[ Bản đồ Google Maps ]<br/>123 Đường Nông Nghiệp, TP. Cần Thơ</span>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ background:'#fff', borderRadius:16, padding:30, boxShadow:'var(--shadow)', border:'1px solid var(--border)' }}>
            {sent ? (
              <div style={{ textAlign:'center', padding:'40px 0' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:'#f0f7e0', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12"/></svg>
                </div>
                <h3 style={{ fontWeight:800, color:'var(--green)', marginBottom:8 }}>Gửi thành công!</h3>
                <p style={{ color:'var(--text-muted)', marginBottom:20 }}>Chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.</p>
                <button onClick={() => setSent(false)} style={dmBtn('var(--green)')}>Gửi thêm yêu cầu</button>
              </div>
            ) : (<>
              <h3 style={{ margin:'0 0 20px', fontWeight:800, fontSize:17 }}>Gửi Yêu Cầu Tư Vấn</h3>
              {[['name','Họ tên *','text'],['phone','Số điện thoại *','tel'],['email','Email','email']].map(([k,l,t]) => (
                <div key={k} style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>{l}</label>
                  <input type={t} value={form[k]} onChange={e=>upd(k,e.target.value)} style={dmInput} />
                </div>
              ))}
              <div style={{ marginBottom:22 }}>
                <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>Nội dung *</label>
                <textarea value={form.msg} onChange={e=>upd('msg',e.target.value)} placeholder="Mô tả câu hỏi hoặc yêu cầu tư vấn của bạn..." style={{ ...dmInput, height:100, resize:'vertical' }} />
              </div>
              <button onClick={() => setSent(true)} style={{ ...dmBtn('var(--green)'), width:'100%', justifyContent:'center', padding:14, fontSize:15 }}>Gửi Yêu Cầu</button>
            </>)}
          </div>
        </div>

        {/* Policy links */}
        <div style={{ marginTop:44, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:14 }}>
          {['Chính sách mua hàng','Chính sách vận chuyển','Chính sách đổi trả','Hệ thống đại lý'].map(t => (
            <div key={t} style={{ background:'#fff', borderRadius:12, padding:18, border:'1px solid var(--border)', cursor:'pointer', textAlign:'center', fontSize:14, fontWeight:700, color:'var(--blue)', boxShadow:'var(--shadow)', transition:'all 0.2s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='var(--blue)';e.currentTarget.style.color='#fff';}}
              onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.color='var(--blue)';}}
            >{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// LOGIN PAGE
// ═══════════════════════════════════════════════════════════════
const LoginPage = ({ setUser, setPage }) => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', phone:'', email:'', pass:'', pass2:'' });
  const [err, setErr] = useState('');
  const [showPass, setShowPass] = useState(false);
  const upd = (k,v) => setForm(f=>({...f,[k]:v}));

  const submit = () => {
    if (!form.email) { setErr('Vui lòng nhập email'); return; }
    if (!form.pass) { setErr('Vui lòng nhập mật khẩu'); return; }
    if (mode==='register') {
      if (!form.name) { setErr('Vui lòng nhập họ tên'); return; }
      if (form.pass.length < 6) { setErr('Mật khẩu phải từ 6 ký tự'); return; }
      if (form.pass !== form.pass2) { setErr('Mật khẩu xác nhận không khớp'); return; }
    }
    setUser({ name: form.name || 'Nguyễn Văn A', email: form.email });
    setPage('account');
  };

  const socialLogin = (provider) => {
    setUser({ name: provider==='google'?'Google User':'Facebook User', email:`user@${provider}.com`, provider });
    setPage('account');
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #e8f0fb 0%, #f0f7e0 100%)', padding:'100px 20px 40px' }}>
      <div style={{ background:'#fff', borderRadius:20, padding:38, width:'100%', maxWidth:420, boxShadow:'0 24px 64px rgba(30,91,170,0.14)' }}>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <img src="logo.png" style={{ width:68, height:68, objectFit:'contain' }} alt="" />
          <h2 style={{ margin:'12px 0 4px', fontWeight:800, fontSize:22, color:'var(--text)' }}>{mode==='login'?'Đăng Nhập':'Đăng Ký'}</h2>
          <p style={{ margin:0, color:'var(--text-muted)', fontSize:14 }}>Được Mùa GAH</p>
        </div>

        <div style={{ display:'flex', background:'var(--bg-subtle)', borderRadius:10, padding:4, marginBottom:24 }}>
          {[['login','Đăng Nhập'],['register','Đăng Ký']].map(([m,l]) => (
            <button key={m} onClick={() => { setMode(m); setErr(''); }} style={{ flex:1, padding:'10px', border:'none', cursor:'pointer', borderRadius:8, fontWeight:700, fontSize:14, background:mode===m?'#fff':'transparent', color:mode===m?'var(--blue)':'var(--text-muted)', boxShadow:mode===m?'0 2px 8px rgba(0,0,0,0.08)':'none', transition:'all 0.2s', fontFamily:'var(--font)' }}>{l}</button>
          ))}
        </div>

        {mode==='register' && <>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>Họ tên *</label>
            <input value={form.name} onChange={e=>upd('name',e.target.value)} placeholder="Nguyễn Văn A" style={dmInput} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>Số điện thoại</label>
            <input value={form.phone} onChange={e=>upd('phone',e.target.value)} placeholder="0901 234 567" style={dmInput} />
          </div>
        </>}

        <div style={{ marginBottom:14 }}>
          <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>Email *</label>
          <input type="email" value={form.email} onChange={e=>upd('email',e.target.value)} placeholder="email@example.com" style={dmInput} />
        </div>
        <div style={{ marginBottom:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <label style={{ fontSize:13, fontWeight:600, color:'var(--text-muted)' }}>Mật khẩu *</label>
            {mode==='login' && <span style={{ fontSize:13, color:'var(--blue)', cursor:'pointer', fontWeight:600 }}>Quên mật khẩu?</span>}
          </div>
          <div style={{ position:'relative' }}>
            <input type={showPass?'text':'password'} value={form.pass} onChange={e=>upd('pass',e.target.value)} placeholder="••••••••" style={{ ...dmInput, paddingRight:42 }} onKeyDown={e=>e.key==='Enter'&&submit()} />
            <button type="button" onClick={() => setShowPass(v=>!v)} style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:6, color:'var(--text-muted)' }}><IC.Eye /></button>
          </div>
        </div>

        {mode==='register' && (
          <div style={{ marginBottom:14 }}>
            <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>Xác nhận mật khẩu *</label>
            <input type={showPass?'text':'password'} value={form.pass2} onChange={e=>upd('pass2',e.target.value)} placeholder="••••••••" style={dmInput} onKeyDown={e=>e.key==='Enter'&&submit()} />
            {form.pass2 && form.pass!==form.pass2 && <div style={{ fontSize:12, color:'#c0392b', marginTop:5, fontWeight:600 }}>Mật khẩu không khớp</div>}
            {form.pass2 && form.pass===form.pass2 && form.pass.length>=6 && <div style={{ fontSize:12, color:'var(--green-dark)', marginTop:5, fontWeight:600, display:'flex', gap:4, alignItems:'center' }}><IC.Check />Mật khẩu khớp</div>}
          </div>
        )}

        {mode==='register' && (
          <label style={{ display:'flex', gap:8, alignItems:'flex-start', fontSize:12, color:'var(--text-muted)', marginBottom:14, cursor:'pointer', lineHeight:1.5 }}>
            <input type="checkbox" defaultChecked style={{ accentColor:'var(--green)', marginTop:2 }} />
            <span>Tôi đồng ý với <a style={{ color:'var(--blue)', fontWeight:600 }}>Điều khoản sử dụng</a> và <a style={{ color:'var(--blue)', fontWeight:600 }}>Chính sách bảo mật</a></span>
          </label>
        )}

        {err && <div style={{ color:'#c0392b', fontSize:13, marginBottom:14, fontWeight:600, padding:'8px 12px', background:'#fce8ea', borderRadius:8 }}>{err}</div>}

        <button onClick={submit} style={{ ...dmBtn('var(--blue)'), width:'100%', justifyContent:'center', padding:14, fontSize:16, borderRadius:12 }}>
          {mode==='login'?'Đăng Nhập':'Tạo Tài Khoản'}
        </button>

        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:10, margin:'20px 0 16px' }}>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
          <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:500 }}>Hoặc {mode==='login'?'đăng nhập':'đăng ký'} với</span>
          <div style={{ flex:1, height:1, background:'var(--border)' }} />
        </div>

        {/* Social */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <button onClick={() => socialLogin('google')} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px', borderRadius:10, border:'1.5px solid var(--border)', background:'#fff', cursor:'pointer', fontSize:14, fontWeight:600, color:'var(--text)', fontFamily:'var(--font)', transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#f8faf5';e.currentTarget.style.borderColor='var(--blue)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.borderColor='var(--border)';}}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Google
          </button>
          <button onClick={() => socialLogin('facebook')} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'11px', borderRadius:10, border:'1.5px solid var(--border)', background:'#fff', cursor:'pointer', fontSize:14, fontWeight:600, color:'var(--text)', fontFamily:'var(--font)', transition:'all 0.2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#f8faf5';e.currentTarget.style.borderColor='#1877F2';}}
            onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.borderColor='var(--border)';}}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </button>
        </div>

        <div style={{ marginTop:18, textAlign:'center', fontSize:13, color:'var(--text-muted)' }}>
          {mode==='login'?'Chưa có tài khoản? ':'Đã có tài khoản? '}
          <span onClick={() => { setMode(mode==='login'?'register':'login'); setErr(''); }} style={{ color:'var(--blue)', fontWeight:700, cursor:'pointer' }}>
            {mode==='login'?'Đăng ký ngay':'Đăng nhập'}
          </span>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// ACCOUNT PAGE
// ═══════════════════════════════════════════════════════════════
const AccountPage = ({ user, setUser, setPage, addToCart }) => {
  const [tab, setTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState(null);
  if (!user) { setTimeout(() => setPage('login'), 0); return null; }

  const orders = [
    { id:'DM2604001', date:'26/04/2026', status:'Đang giao', statusStep:3, total:1250000,
      items:[{catId:3,name:'Anvil 5SC',qty:2,price:95000},{catId:5,name:'Regent 800WG',qty:1,price:88000}],
      address:'123 Đường ABC, Phường X, Quận Y, TP. Cần Thơ', phone:'0901 234 567', pay:'COD',
      tracking:[
        {time:'26/04 09:15', text:'Đơn hàng đã được tạo', done:true},
        {time:'26/04 11:30', text:'Đã xác nhận và đóng gói', done:true},
        {time:'27/04 07:45', text:'Đang giao đến bạn', done:true},
        {time:'Dự kiến 27/04', text:'Giao hàng thành công', done:false},
      ]},
    { id:'DM2603002', date:'15/04/2026', status:'Đã giao', statusStep:4, total:450000,
      items:[{catId:4,name:'Deadline 5G',qty:3,price:45000}],
      address:'123 Đường ABC, Phường X, Quận Y, TP. Cần Thơ', phone:'0901 234 567', pay:'COD',
      tracking:[
        {time:'15/04 08:00', text:'Đơn hàng đã được tạo', done:true},
        {time:'15/04 10:00', text:'Đã xác nhận và đóng gói', done:true},
        {time:'16/04 07:00', text:'Đang giao đến bạn', done:true},
        {time:'16/04 14:30', text:'Giao hàng thành công', done:true},
      ]},
    { id:'DM2602003', date:'02/03/2026', status:'Đã giao', statusStep:4, total:2500000,
      items:[{catId:1,name:'Máy Phun Điện 16L',qty:1,price:2500000}],
      address:'123 Đường ABC, Phường X, Quận Y, TP. Cần Thơ', phone:'0901 234 567', pay:'Chuyển khoản',
      tracking:[
        {time:'02/03 09:00', text:'Đơn hàng đã được tạo', done:true},
        {time:'02/03 12:00', text:'Đã xác nhận và đóng gói', done:true},
        {time:'03/03 08:00', text:'Đang giao đến bạn', done:true},
        {time:'03/03 16:00', text:'Giao hàng thành công', done:true},
      ]},
    { id:'DM2601004', date:'18/02/2026', status:'Đã hủy', statusStep:0, total:180000,
      items:[{catId:2,name:'GA3 10% SL',qty:1,price:120000}],
      address:'123 Đường ABC, Phường X, Quận Y, TP. Cần Thơ', phone:'0901 234 567', pay:'COD',
      tracking:[
        {time:'18/02 10:00', text:'Đơn hàng đã được tạo', done:true},
        {time:'18/02 11:00', text:'Đơn hàng đã bị hủy', done:true},
      ]},
  ];
  const statusColor = s => s==='Đang giao'?'var(--orange)':s==='Đã giao'?'var(--green)':s==='Đã hủy'?'#c0392b':'#999';

  const wishlist = PRODUCTS.slice(0, 4);
  const notifications = [
    { id:1, type:'order', text:'Đơn hàng #DM2604001 đang được giao đến bạn', time:'2 giờ trước', unread:true },
    { id:2, type:'promo', text:'Khuyến mãi 20% cho thuốc trừ sâu - Áp dụng đến 30/04', time:'1 ngày trước', unread:true },
    { id:3, type:'news', text:'Bài viết mới: Phòng trừ sâu keo mùa thu hại ngô', time:'3 ngày trước', unread:false },
    { id:4, type:'order', text:'Đơn hàng #DM2603002 đã giao thành công', time:'12 ngày trước', unread:false },
  ];

  const stats = [
    { label:'Tổng đơn hàng', val:orders.length, color:'var(--blue)' },
    { label:'Đang giao', val:orders.filter(o=>o.status==='Đang giao').length, color:'var(--orange)' },
    { label:'Đã giao', val:orders.filter(o=>o.status==='Đã giao').length, color:'var(--green)' },
    { label:'Yêu thích', val:wishlist.length, color:'#7b5ea7' },
  ];

  const tabs = [
    ['dashboard','Tổng quan'],
    ['orders','Đơn hàng'],
    ['wishlist','Sản phẩm yêu thích'],
    ['notifications','Thông báo'],
    ['profile','Thông tin'],
    ['address','Địa chỉ'],
    ['password','Đổi mật khẩu'],
  ];

  // Order detail view
  if (selectedOrder) {
    const o = selectedOrder;
    return (
      <div style={{ padding:'96px 0 56px', background:'var(--bg-subtle)', minHeight:'100vh' }}>
        <div className="container" style={{ maxWidth:900 }}>
          <button onClick={() => setSelectedOrder(null)} style={{ ...dmIcon, marginBottom:16, color:'var(--blue)', fontWeight:700, fontSize:14, fontFamily:'var(--font)' }}><IC.ChevL />Quay lại danh sách</button>

          <div style={{ background:'#fff', borderRadius:14, padding:26, boxShadow:'var(--shadow)', marginBottom:18 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18, flexWrap:'wrap', gap:12 }}>
              <div style={{ flex:'1 1 240px', minWidth:0 }}>
                <h2 style={{ margin:'0 0 4px', fontWeight:800, fontSize:22, lineHeight:1.3, wordBreak:'break-word' }}>Đơn hàng #{o.id}</h2>
                <div style={{ fontSize:13, color:'var(--text-muted)' }}>Đặt ngày {o.date}</div>
              </div>
              <span style={{ background:statusColor(o.status)+'20', color:statusColor(o.status), padding:'8px 18px', borderRadius:20, fontSize:13, fontWeight:700 }}>{o.status}</span>
            </div>

            {/* Tracking */}
            <h3 style={{ margin:'0 0 16px', fontSize:15, fontWeight:800 }}>Theo dõi đơn hàng</h3>
            <div style={{ marginBottom:24 }}>
              {o.tracking.map((t,i) => (
                <div key={i} style={{ display:'flex', gap:14, paddingBottom:14, position:'relative' }}>
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:t.done?'var(--green)':'#dde', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>{t.done?<IC.Check />:''}</div>
                    {i<o.tracking.length-1 && <div style={{ position:'absolute', top:24, left:11, width:2, height:'calc(100% + 4px)', background:t.done?'var(--green)':'#dde' }} />}
                  </div>
                  <div style={{ flex:1, paddingTop:2 }}>
                    <div style={{ fontSize:14, fontWeight:t.done?700:500, color:t.done?'var(--text)':'var(--text-muted)' }}>{t.text}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{t.time}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Items */}
            <h3 style={{ margin:'0 0 12px', fontSize:15, fontWeight:800 }}>Sản phẩm ({o.items.reduce((s,i)=>s+i.qty,0)})</h3>
            {o.items.map((it,i) => (
              <div key={i} style={{ display:'flex', gap:12, padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:60, borderRadius:8, overflow:'hidden', flexShrink:0 }}><ProductImg catId={it.catId} name="" height={60} /></div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{it.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>SL: {it.qty} · {fmt(it.price)}</div>
                </div>
                <div style={{ fontWeight:800, color:'var(--blue)' }}>{fmt(it.price*it.qty)}</div>
              </div>
            ))}

            {/* Info */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginTop:22, fontSize:13 }} className="contact-grid">
              <div><div style={{ color:'var(--text-muted)', marginBottom:5, fontWeight:600 }}>Địa chỉ giao hàng</div><div style={{ lineHeight:1.6 }}>{o.address}<br/>{o.phone}</div></div>
              <div><div style={{ color:'var(--text-muted)', marginBottom:5, fontWeight:600 }}>Thanh toán</div><div>{o.pay}</div></div>
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:22, paddingTop:18, borderTop:'2px solid var(--border)' }}>
              <span style={{ fontSize:15, fontWeight:600 }}>Tổng cộng</span>
              <span style={{ fontSize:22, fontWeight:900, color:'var(--blue)' }}>{fmt(o.total)}</span>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:22, flexWrap:'wrap' }}>
              {o.status==='Đã giao' && <button style={dmBtn('var(--green)')}>Mua lại</button>}
              {o.status==='Đã giao' && <button style={dmOutline()}>Đánh giá sản phẩm</button>}
              {o.status==='Đang giao' && <button style={dmOutline('#c0392b')}>Hủy đơn</button>}
              <button style={dmOutline()}><IC.Phone />Liên hệ hỗ trợ</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:'96px 0 56px', background:'var(--bg-subtle)', minHeight:'100vh' }}>
      <div className="container">
        <div style={{ display:'grid', gridTemplateColumns:'240px 1fr', gap:22 }} className="account-grid">
          {/* Sidebar */}
          <div>
            <div style={{ background:'#fff', borderRadius:14, padding:22, boxShadow:'var(--shadow)', marginBottom:14, textAlign:'center' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg, var(--blue), var(--green))', margin:'0 auto 12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, fontWeight:800, color:'#fff' }}>{user.name[0].toUpperCase()}</div>
              <div style={{ fontWeight:800, fontSize:15, marginBottom:3 }}>{user.name}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{user.email}</div>
              <div style={{ marginTop:10, padding:'4px 10px', background:'#f0f7e0', color:'var(--green-dark)', fontSize:11, fontWeight:700, borderRadius:20, display:'inline-block' }}>Khách hàng VIP</div>
            </div>
            <div style={{ background:'#fff', borderRadius:14, overflow:'hidden', boxShadow:'var(--shadow)' }}>
              {tabs.map(([k,l]) => (
                <div key={k} onClick={() => setTab(k)} style={{ padding:'13px 18px', cursor:'pointer', borderBottom:'1px solid var(--border)', background:tab===k?'#e8f4e0':'#fff', color:tab===k?'var(--green-dark)':'var(--text)', fontWeight:tab===k?700:400, fontSize:14, transition:'all 0.2s', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span>{l}</span>
                  {k==='notifications' && notifications.filter(n=>n.unread).length>0 && <span style={{ background:'var(--orange)', color:'#fff', fontSize:10, fontWeight:800, padding:'1px 7px', borderRadius:10 }}>{notifications.filter(n=>n.unread).length}</span>}
                </div>
              ))}
              <div onClick={() => { setUser(null); setPage('home'); }} style={{ padding:'13px 18px', cursor:'pointer', color:'#c0392b', fontWeight:600, fontSize:14 }}>Đăng xuất</div>
            </div>
          </div>

          {/* Content */}
          <div style={{ background:'#fff', borderRadius:14, padding:26, boxShadow:'var(--shadow)' }}>
            {tab==='dashboard' && <>
              <h3 style={{ margin:'0 0 6px', fontWeight:800, fontSize:20 }}>Xin chào, {user.name}! 👋</h3>
              <p style={{ margin:'0 0 22px', color:'var(--text-muted)', fontSize:14 }}>Chào mừng bạn quay lại. Đây là tổng quan tài khoản của bạn.</p>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px,1fr))', gap:12, marginBottom:26 }}>
                {stats.map(s => (
                  <div key={s.label} style={{ background:'linear-gradient(135deg, '+s.color+'15 0%, '+s.color+'05 100%)', border:'1.5px solid '+s.color+'30', borderRadius:12, padding:'16px 14px' }}>
                    <div style={{ fontSize:30, fontWeight:900, color:s.color, lineHeight:1 }}>{s.val}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:6, fontWeight:600 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <h4 style={{ margin:'0 0 12px', fontWeight:800, fontSize:15 }}>Đơn hàng gần đây</h4>
              {orders.slice(0,2).map(o => (
                <div key={o.id} onClick={() => setSelectedOrder(o)} style={{ border:'1px solid var(--border)', borderRadius:12, padding:14, marginBottom:10, cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8, transition:'background 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-subtle)'}
                  onMouseLeave={e=>e.currentTarget.style.background='#fff'}
                >
                  <div>
                    <div style={{ fontWeight:800, color:'var(--blue)', fontSize:14 }}>#{o.id}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{o.date} · {o.items.length} sản phẩm</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ background:statusColor(o.status)+'20', color:statusColor(o.status), padding:'3px 10px', borderRadius:15, fontSize:11, fontWeight:700 }}>{o.status}</span>
                    <span style={{ fontWeight:800, color:'var(--blue)' }}>{fmt(o.total)}</span>
                  </div>
                </div>
              ))}
              <button onClick={() => setTab('orders')} style={{ ...dmOutline(), marginTop:8, padding:'8px 16px', fontSize:13 }}>Xem tất cả đơn hàng <IC.ChevR /></button>
            </>}

            {tab==='orders' && <>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18, alignItems:'center', flexWrap:'wrap', gap:10 }}>
                <h3 style={{ margin:0, fontWeight:800, fontSize:18 }}>Lịch Sử Đơn Hàng</h3>
                <select style={{ ...dmInput, width:'auto', cursor:'pointer', padding:'8px 12px' }}>
                  <option>Tất cả ({orders.length})</option>
                  <option>Đang giao</option>
                  <option>Đã giao</option>
                  <option>Đã hủy</option>
                </select>
              </div>
              {orders.map(o => (
                <div key={o.id} style={{ border:'1px solid var(--border)', borderRadius:12, padding:18, marginBottom:14, transition:'border-color 0.2s' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor='var(--blue)'}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8 }}>
                    <div><span style={{ fontWeight:800, color:'var(--blue)', fontSize:15 }}>#{o.id}</span><span style={{ fontSize:12, color:'var(--text-muted)', marginLeft:12 }}>{o.date}</span></div>
                    <span style={{ background:statusColor(o.status)+'20', color:statusColor(o.status), padding:'4px 12px', borderRadius:20, fontSize:12, fontWeight:700 }}>{o.status}</span>
                  </div>
                  <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:12 }}>{o.items.map(it => `${it.name} x${it.qty}`).join(' · ')}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                    <span style={{ fontWeight:900, color:'var(--blue)', fontSize:17 }}>{fmt(o.total)}</span>
                    <div style={{ display:'flex', gap:8 }}>
                      {o.status==='Đã giao' && <button onClick={() => o.items.forEach(it => addToCart && addToCart({...it, id:'r'+it.name, catId:it.catId}, it.qty))} style={{ ...dmBtn('var(--green)'), padding:'7px 14px', fontSize:13 }}>Mua lại</button>}
                      <button onClick={() => setSelectedOrder(o)} style={{ ...dmOutline(), padding:'7px 14px', fontSize:13 }}>Theo dõi</button>
                    </div>
                  </div>
                </div>
              ))}
            </>}

            {tab==='wishlist' && <>
              <h3 style={{ margin:'0 0 18px', fontWeight:800, fontSize:18 }}>Sản Phẩm Yêu Thích ({wishlist.length})</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))', gap:14 }}>
                {wishlist.map(p => (
                  <ProductCard key={p.id} product={p} onAdd={addToCart || (()=>{})} onView={()=>{ window.DM._selProduct=p; setPage('product-detail'); }} />
                ))}
              </div>
            </>}

            {tab==='notifications' && <>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18, alignItems:'center' }}>
                <h3 style={{ margin:0, fontWeight:800, fontSize:18 }}>Thông Báo</h3>
                <button style={{ ...dmIcon, fontSize:13, color:'var(--blue)', fontWeight:600, fontFamily:'var(--font)' }}>Đánh dấu đã đọc</button>
              </div>
              {notifications.map(n => (
                <div key={n.id} style={{ display:'flex', gap:12, padding:'14px 16px', borderRadius:10, background:n.unread?'#f0f7e0':'#fafbf8', marginBottom:8, border:'1px solid', borderColor:n.unread?'var(--green)':'var(--border)', cursor:'pointer', transition:'all 0.2s' }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:n.type==='order'?'#e8f0fb':n.type==='promo'?'#fef0e6':'#f0ebf8', color:n.type==='order'?'var(--blue)':n.type==='promo'?'var(--orange)':'#7b5ea7', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:18 }}>
                    {n.type==='order'?'📦':n.type==='promo'?'🎁':'📰'}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:14, fontWeight:n.unread?700:500, lineHeight:1.5 }}>{n.text}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:3 }}>{n.time}</div>
                  </div>
                  {n.unread && <div style={{ width:8, height:8, borderRadius:'50%', background:'var(--orange)', flexShrink:0, marginTop:8 }} />}
                </div>
              ))}
            </>}
            {tab==='profile' && <>
              <h3 style={{ margin:'0 0 20px', fontWeight:800, fontSize:18 }}>Thông Tin Cá Nhân</h3>
              {[['Họ tên',user.name],['Email',user.email],['Điện thoại','0901 234 567'],['Ngày sinh','01/01/1990']].map(([l,v]) => (
                <div key={l} style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>{l}</label>
                  <input defaultValue={v} style={dmInput} />
                </div>
              ))}
              <button style={dmBtn('var(--green)')}>Lưu thay đổi</button>
            </>}

            {tab==='address' && <>
              <h3 style={{ margin:'0 0 20px', fontWeight:800, fontSize:18 }}>Địa Chỉ Giao Hàng</h3>
              <div style={{ border:'2px solid var(--blue)', borderRadius:12, padding:18, marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontWeight:800 }}>{user.name}</span>
                  <span style={{ background:'#e8f0fb', color:'var(--blue)', fontSize:11, fontWeight:700, padding:'2px 9px', borderRadius:4 }}>Mặc định</span>
                </div>
                <div style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.7 }}>0901 234 567<br/>123 Đường ABC, Phường X, Quận Y, TP. Cần Thơ</div>
              </div>
              <button style={dmOutline()}><IC.Plus />Thêm địa chỉ mới</button>
            </>}

            {tab==='password' && <>
              <h3 style={{ margin:'0 0 20px', fontWeight:800, fontSize:18 }}>Đổi Mật Khẩu</h3>
              {['Mật khẩu hiện tại','Mật khẩu mới','Xác nhận mật khẩu mới'].map(l => (
                <div key={l} style={{ marginBottom:16 }}>
                  <label style={{ display:'block', fontSize:13, fontWeight:600, marginBottom:6, color:'var(--text-muted)' }}>{l}</label>
                  <input type="password" placeholder="••••••••" style={dmInput} />
                </div>
              ))}
              <button style={dmBtn('var(--green)')}>Cập nhật mật khẩu</button>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
};

// Export all pages
Object.assign(window, {
  HomePage, ProductsPage, ProductDetailPage, CheckoutPage,
  NewsPage, DocumentsPage, ContactPage, LoginPage, AccountPage,
});
