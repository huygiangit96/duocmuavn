// dm-components.jsx — Shared UI components for Được Mùa GAH
const { useState, useEffect, useRef } = React;

// ─── Icons ───────────────────────────────────────────────────────────────────
const IC = {
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>,
  CartBase: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
  Menu: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  ChevR: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9,18 15,12 9,6" /></svg>,
  ChevL: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15,18 9,12 15,6" /></svg>,
  ChevD: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6,9 12,15 18,9" /></svg>,
  Star: ({ on }) => <svg width="13" height="13" viewBox="0 0 24 24" fill={on ? "#FFD700" : "none"} stroke="#FFD700" strokeWidth="2"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>,
  Phone: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
  Pin: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
  Trash: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6" /><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a1,1,0,0,1,1-1h4a1,1,0,0,1,1,1v2" /></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Minus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /></svg>,
  Filter: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" /></svg>,
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14,2H6a2,2,0,0,0-2,2V20a2,2,0,0,0,2,2H18a2,2,0,0,0,2-2V8Z" /><polyline points="14,2 14,8 20,8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  Video: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="23,7 16,12 23,17" /><rect x="1" y="5" width="15" height="14" rx="2" /></svg>,
  Download: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7,10 12,15 17,10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  Play: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>,
  Check: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20,6 9,17 4,12" /></svg>,
  Share: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
  Eye: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
  Cart: ({ count }) =>
  <span style={{ position: 'relative', display: 'inline-flex' }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
      {count > 0 &&
    <span style={{ position: 'absolute', top: -7, right: -9, background: '#F07020', color: '#fff', borderRadius: '50%', fontSize: 10, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, lineHeight: 1 }}>{count > 9 ? '9+' : count}</span>
    }
    </span>

};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => n.toLocaleString('vi-VN') + '₫';
const Stars = ({ rating }) =>
<span style={{ display: 'inline-flex', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((i) => <IC.Star key={i} on={i <= Math.round(rating)} />)}
  </span>;


// ─── Product Image Placeholder ────────────────────────────────────────────────
const ProductImg = ({ catId, name, height = 180 }) => {
  const cat = (window.DM.CATS || []).find((c) => c.id === catId) || { color: '#888', bg: '#f0f0f0', name: '' };
  return (
    <div style={{ height, background: cat.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, position: 'relative', overflow: 'hidden' }}>
      <svg width="48" height="60" viewBox="0 0 48 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="2" width="32" height="44" rx="4" fill={cat.color} opacity="0.18" />
        <rect x="12" y="6" width="24" height="32" rx="3" fill={cat.color} opacity="0.3" />
        <rect x="16" y="12" width="16" height="4" rx="2" fill={cat.color} opacity="0.6" />
        <rect x="16" y="20" width="12" height="3" rx="1.5" fill={cat.color} opacity="0.4" />
        <rect x="16" y="26" width="14" height="3" rx="1.5" fill={cat.color} opacity="0.4" />
        <rect x="18" y="50" width="12" height="8" rx="2" fill={cat.color} opacity="0.25" />
      </svg>
      <span style={{ fontSize: 11, color: cat.color, opacity: 0.65, textAlign: 'center', padding: '0 12px', fontFamily: 'monospace', lineHeight: 1.4, maxWidth: '90%' }}>{name}</span>
    </div>);

};

// ─── News Image Placeholder ───────────────────────────────────────────────────
const NewsImg = ({ catName, height = 160 }) =>
<div style={{ height, background: 'linear-gradient(135deg, #e8f0fb 0%, #f0f7e0 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none"><rect x="4" y="6" width="28" height="20" rx="3" fill="#1E5BAA" opacity="0.15" /><rect x="8" y="10" width="20" height="3" rx="1.5" fill="#1E5BAA" opacity="0.3" /><rect x="8" y="16" width="14" height="2" rx="1" fill="#9EC231" opacity="0.5" /><rect x="8" y="21" width="17" height="2" rx="1" fill="#9EC231" opacity="0.4" /></svg>
    <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#aaa' }}>{catName}</span>
  </div>;


// ─── Section Title ────────────────────────────────────────────────────────────
const SectionTitle = ({ title, sub, noMargin }) =>
<div style={{ marginBottom: noMargin ? 0 : 28 }}>
    <h2 style={{ margin: '0 0 6px', fontSize: 'clamp(18px,2.8vw,28px)', fontWeight: 800, color: 'var(--text)', letterSpacing: -0.3 }}>{title}</h2>
    {sub && <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 15, fontWeight: 400 }}>{sub}</p>}
  </div>;


// ─── Product Card ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, onAdd, onView }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => onView(product)}
      style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', border: '1.5px solid', borderColor: hov ? 'var(--green)' : 'var(--border)', boxShadow: hov ? '0 10px 36px rgba(30,91,170,0.13)' : 'var(--shadow)', transform: hov ? 'translateY(-5px)' : 'none', transition: 'all 0.25s ease', position: 'relative' }}>
      
      {(product.tag || product.promo) &&
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 2, display:'flex', flexDirection:'column', gap:5, alignItems:'flex-start' }}>
        {product.tag && <span style={{ background: product.tag === 'Mới' ? 'var(--green)' : 'var(--orange)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 5 }}>{product.tag}</span>}
        {product.promo && <span style={{ background: '#c0392b', color: '#fff', fontSize: 11, fontWeight: 800, padding: '3px 9px', borderRadius: 5, boxShadow:'0 2px 6px rgba(192,57,43,0.35)' }}>🔥 {product.promo}</span>}
      </div>
      }
      <ProductImg catId={product.catId} name={product.name} height={170} />
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{(window.DM.CATS.find((c) => c.id === product.catId) || {}).name}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 6, lineHeight: 1.4, minHeight: 40 }}>{product.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
          <Stars rating={product.rating} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>({product.reviews})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap:8 }}>
          <div style={{ minWidth:0, flex:1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--blue)', lineHeight:1.1 }}>{fmt(product.price)}</div>
            {product.listPrice && product.listPrice > product.price && (
              <div style={{ fontSize: 12, color:'#999', textDecoration:'line-through', marginTop:1 }}>{fmt(product.listPrice)}</div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop:1 }}>{product.unit}</div>
          </div>
          <button onClick={(e) => {e.stopPropagation();onAdd(product);}} style={{ background: 'var(--green)', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 13px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font)', transition: 'background 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--green-dark)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--green)'}>
            <IC.Plus /> Thêm</button>
        </div>
      </div>
    </div>);

};

// ─── Shared style objects ─────────────────────────────────────────────────────
const dmBtn = (bg, color = '#fff') => ({
  background: bg, color, border: 'none', borderRadius: 10,
  padding: '10px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font)',
  transition: 'opacity 0.2s, transform 0.15s', lineHeight: 1
});
const dmOutline = (color = 'var(--blue)') => ({
  background: 'transparent', color, border: `2px solid ${color}`, borderRadius: 10,
  padding: '9px 20px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font)',
  transition: 'all 0.2s'
});
const dmInput = {
  border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 14px',
  fontSize: 14, fontFamily: 'var(--font)', color: 'var(--text)', outline: 'none',
  background: '#fff', width: '100%', boxSizing: 'border-box'
};
const dmIcon = { background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: 'var(--text)', display: 'flex', alignItems: 'center', borderRadius: 8 };
const dmQty = { width: 30, height: 30, borderRadius: 7, border: '1.5px solid var(--border)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };

// ─── Cart Panel ───────────────────────────────────────────────────────────────
const CartPanel = ({ cart, setCart, open, setOpen, setPage }) => {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const upd = (id, d) => setCart((p) => p.map((i) => i.id === id ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter((i) => i.qty > 0));
  return (
    <>
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1998 }} />}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, maxWidth: '92vw', background: '#fff', zIndex: 1999, transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 50px rgba(0,0,0,0.18)' }}>
        <div style={{ padding: '18px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--blue)' }}>Giỏ Hàng &nbsp;<span style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 500 }}>({cart.reduce((s, i) => s + i.qty, 0)} sp)</span></h3>
          <button onClick={() => setOpen(false)} style={dmIcon}><IC.X /></button>
        </div>

        {cart.length === 0 ?
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--text-muted)' }}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d0d8c8" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
            <p style={{ margin: 0, fontSize: 15 }}>Giỏ hàng đang trống</p>
            <button onClick={() => {setPage('products');setOpen(false);}} style={dmBtn('var(--green)')}>Mua sắm ngay</button>
          </div> :

        <>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px' }}>
              {cart.map((item) =>
            <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 64, flexShrink: 0, borderRadius: 8, overflow: 'hidden' }}>
                    <ProductImg catId={item.catId} name="" height={64} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, lineHeight: 1.3 }}>{item.name}</div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--blue)', marginBottom: 8 }}>{fmt(item.price)}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => upd(item.id, -1)} style={dmQty}><IC.Minus /></button>
                      <span style={{ fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.qty}</span>
                      <button onClick={() => upd(item.id, +1)} style={dmQty}><IC.Plus /></button>
                      <button onClick={() => upd(item.id, -item.qty)} style={{ ...dmIcon, color: '#c0392b', marginLeft: 'auto', padding: 6 }}><IC.Trash /></button>
                    </div>
                  </div>
                </div>
            )}
            </div>
            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', background: '#fafbf8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 16 }}>
                <span style={{ fontWeight: 600 }}>Tạm tính</span>
                <span style={{ fontWeight: 800, color: 'var(--blue)', fontSize: 20 }}>{fmt(total)}</span>
              </div>
              <button onClick={() => {setPage('checkout');setOpen(false);}} style={{ ...dmBtn('var(--orange)'), width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>Đặt Hàng Ngay</button>
            </div>
          </>
        }
      </div>
    </>);

};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg }) =>
msg ? <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 3000, background: 'var(--green)', color: '#fff', padding: '12px 20px', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.2)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, animation: 'toastIn .3s ease' }}><IC.Check /> {msg}</div> : null;


// ─── Header ───────────────────────────────────────────────────────────────────
const Header = ({ page, setPage, cart, setCartOpen, user, setPage: _ }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [srchOpen, setSrchOpen] = useState(false);
  const [srchQ, setSrchQ] = useState('');

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const nav = [['home', 'Trang Chủ'], ['products', 'Sản Phẩm'], ['news', 'Tin Tức'], ['docs', 'Tài Liệu'], ['contact', 'Liên Hệ']];

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff', borderBottom: '1px solid var(--border)', boxShadow: scrolled ? '0 4px 24px rgba(30,91,170,0.09)' : 'none', backdropFilter: 'blur(12px)', transition: 'box-shadow 0.3s' }}>
      {/* Top strip */}
      <div style={{ background: 'var(--blue)', padding: '5px 0', fontSize: 12, color: 'rgba(255,255,255,0.9)', backgroundColor: "rgb(30, 107, 170)" }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <span>Hotline: <strong style={{ color: '#FFE600' }}>1800 xxxx</strong> &nbsp;|&nbsp; Zalo: <strong style={{ color: '#FFE600' }}>0909 xxx xxx</strong></span>
          <span className="hide-xs">Giải Pháp Thông Minh – Sản Phẩm Độc Đáo – Dịch Vụ Chuyên Nghiệp</span>
        </div>
      </div>
      {/* Main row */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', padding: '10px 20px', gap: 16 }}>
        <div onClick={() => setPage('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <img src="logo.png" style={{ width: 50, height: 50, objectFit: 'contain' }} alt="Được Mùa GAH" />
          <div className="hide-xs">
            <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--blue)', lineHeight: 1.1 }}>Được Mùa GAH</div>
            <div style={{ fontSize: 11, color: 'var(--green-dark)', fontWeight: 600, letterSpacing: 1.5 }}>NÔNG NGHIỆP VIỆT</div>
          </div>
        </div>

        <nav className="desk-nav" style={{ display: 'flex', flex: 1, justifyContent: 'center', gap: 2 }}>
          {nav.map(([k, l]) =>
          <button key={k} onClick={() => setPage(k)} style={{ background: page === k ? '#e8f4e0' : 'none', border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: 9, fontSize: 14, fontWeight: page === k ? 700 : 500, color: page === k ? 'var(--green-dark)' : 'var(--text)', transition: 'all 0.2s', fontFamily: 'var(--font)' }}>{l}</button>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          <button onClick={() => setSrchOpen((v) => !v)} style={dmIcon}><IC.Search /></button>
          <button onClick={() => setCartOpen(true)} style={dmIcon}><IC.Cart count={cart.reduce((s, i) => s + i.qty, 0)} /></button>
          <button onClick={() => setPage(user ? 'account' : 'login')} style={{ ...dmIcon, background: user ? '#e8f4e0' : 'none', borderRadius: 20, padding: '6px 12px', gap: 6 }}>
            <IC.User />{user && <span className="hide-xs" style={{ fontSize: 13, fontWeight: 700, color: 'var(--green-dark)' }}>{user.name.split(' ').pop()}</span>}
          </button>
          <button className="mob-nav-btn" onClick={() => setMobileOpen((v) => !v)} style={{ ...dmIcon, display: 'none' }}><IC.Menu /></button>
        </div>
      </div>

      {/* Search bar */}
      {srchOpen &&
      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 20px', background: '#f8faf5' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: 8, maxWidth: 600, margin: '0 auto' }}>
              <input autoFocus value={srchQ} onChange={(e) => setSrchQ(e.target.value)} onKeyDown={(e) => {if (e.key === 'Enter') {setPage('products');setSrchOpen(false);}}} placeholder="Tìm sản phẩm, tin tức, tài liệu..." style={{ ...dmInput, flex: 1 }} />
              <button onClick={() => {setPage('products');setSrchOpen(false);}} style={dmBtn('var(--blue)')}>Tìm</button>
            </div>
          </div>
        </div>
      }

      {/* Mobile menu */}
      {mobileOpen &&
      <div style={{ borderTop: '1px solid var(--border)', background: '#fff', padding: '8px 20px 16px' }}>
          {nav.map(([k, l]) =>
        <button key={k} onClick={() => {setPage(k);setMobileOpen(false);}} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '13px 8px', fontSize: 15, fontWeight: page === k ? 700 : 400, color: page === k ? 'var(--green-dark)' : 'var(--text)', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontFamily: 'var(--font)' }}>{l}</button>
        )}
        </div>
      }
    </header>);

};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = ({ setPage }) =>
<footer style={{ background: '#0d1f08', color: '#8ab068', padding: '52px 0 24px' }}>
    <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 36 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <img src="logo.png" style={{ width: 44, height: 44, objectFit: 'contain' }} alt="" />
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', lineHeight: 1.1 }}>Được Mùa GAH</div>
            <div style={{ fontSize: 11, color: '#9EC231', fontWeight: 600, letterSpacing: 1 }}>NÔNG NGHIỆP VIỆT</div>
          </div>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.9, color: '#6a9050', margin: '0 0 18px' }}>Giải Pháp Thông Minh – Sản Phẩm Độc Đáo – Dịch Vụ Chuyên Nghiệp</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="tel:1800xxxx" style={{ ...dmBtn('var(--green)'), fontSize: 13, padding: '8px 14px', textDecoration: 'none' }}><IC.Phone />Hotline</a>
        </div>
      </div>
      <div>
        <h4 style={{ color: '#fff', marginBottom: 14, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Sản Phẩm</h4>
        {window.DM.CATS.map((c) =>
      <div key={c.id} onClick={() => setPage('products')} style={{ marginBottom: 9, fontSize: 13, cursor: 'pointer', color: '#6a9050', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#9EC231'} onMouseLeave={(e) => e.target.style.color = '#6a9050'}>{c.fullName}</div>
      )}
      </div>
      <div>
        <h4 style={{ color: '#fff', marginBottom: 14, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Hỗ Trợ</h4>
        {['Chính sách mua hàng', 'Chính sách vận chuyển', 'Chính sách đổi trả', 'Hướng dẫn đặt hàng', 'Hệ thống đại lý'].map((t) =>
      <div key={t} style={{ marginBottom: 9, fontSize: 13, cursor: 'pointer', color: '#6a9050' }} onMouseEnter={(e) => e.target.style.color = '#9EC231'} onMouseLeave={(e) => e.target.style.color = '#6a9050'}>{t}</div>
      )}
      </div>
      <div>
        <h4 style={{ color: '#fff', marginBottom: 14, fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>Liên Hệ</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: 13, color: '#6a9050' }}>
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}><IC.Pin />123 Đường Nông Nghiệp, TP. Cần Thơ</div>
          <div style={{ display: 'flex', gap: 9 }}><IC.Phone />0292 xxx xxxx</div>
          <div style={{ display: 'flex', gap: 9 }}><IC.Mail />contact@duocmua.vn</div>
        </div>
        <div style={{ marginTop:14, borderRadius:10, overflow:'hidden', border:'1px solid #1c3510', position:'relative', height:140 }}>
          <iframe
            title="Bản đồ Được Mùa GAH"
            src="https://www.openstreetmap.org/export/embed.html?bbox=105.7602%2C10.0252%2C105.7902%2C10.0552&amp;layer=mapnik&amp;marker=10.0402%2C105.7752"
            style={{ border:0, width:'100%', height:'100%', filter:'grayscale(0.2) brightness(0.95)' }}
            loading="lazy"
          />
          <a href="https://www.openstreetmap.org/?mlat=10.0402&mlon=105.7752#map=14/10.0402/105.7752" target="_blank" rel="noopener" style={{ position:'absolute', bottom:6, right:6, background:'rgba(13,31,8,0.85)', color:'#9EC231', padding:'4px 10px', borderRadius:6, fontSize:11, fontWeight:700, textDecoration:'none' }}>Xem bản đồ lớn ↗</a>
        </div>
      </div>
    </div>
    <div style={{ borderTop: '1px solid #1c3510', marginTop: 36, paddingTop: 18, textAlign: 'center', fontSize: 12, color: '#3d5a28' }}>
      © 2026 Được Mùa GAH · Giải Pháp Thông Minh – Sản Phẩm Độc Đáo – Dịch Vụ Chuyên Nghiệp
      {' · '}
      <span onClick={() => setPage('admin')} style={{ cursor:'pointer', color:'#6a9050', textDecoration:'underline' }}
        onMouseEnter={(e) => e.target.style.color = '#9EC231'}
        onMouseLeave={(e) => e.target.style.color = '#6a9050'}
      >Trang quản trị</span>
    </div>
  </footer>;


// Export everything
Object.assign(window, {
  IC, fmt, Stars, ProductImg, NewsImg, SectionTitle, ProductCard,
  dmBtn, dmOutline, dmInput, dmIcon, dmQty,
  CartPanel, Toast, Header, Footer
});