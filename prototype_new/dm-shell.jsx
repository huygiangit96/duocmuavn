// dm-shell.jsx — Shared shell + URL navigation for all pages
const { useState: useStateS, useEffect: useEffectS } = React;

// Map URL paths ↔ page keys
const PAGE_TO_FILE = {
  'home': 'index.html',
  'products': 'products.html',
  'product-detail': 'product-detail.html',
  'checkout': 'checkout.html',
  'news': 'news.html',
  'docs': 'documents.html',
  'contact': 'contact.html',
  'login': 'login.html',
  'account': 'account.html',
  'admin': 'admin.html',
};

// Cart persistence (localStorage)
const CART_KEY = 'dm_cart_v1';
const USER_KEY = 'dm_user_v1';
const SEL_KEY  = 'dm_selected_product_v1';

const loadCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
const saveCart = (c) => localStorage.setItem(CART_KEY, JSON.stringify(c));
const loadUser = () => { try { return JSON.parse(localStorage.getItem(USER_KEY)) || null; } catch { return null; } };
const saveUser = (u) => u ? localStorage.setItem(USER_KEY, JSON.stringify(u)) : localStorage.removeItem(USER_KEY);
const loadSel  = () => { try { return JSON.parse(localStorage.getItem(SEL_KEY)) || null; } catch { return null; } };
const saveSel  = (p) => p ? localStorage.setItem(SEL_KEY, JSON.stringify(p)) : localStorage.removeItem(SEL_KEY);

// Shade helper
const shade = (hex, pct) => {
  const h = hex.replace('#','');
  const n = parseInt(h.length===3 ? h.split('').map(c=>c+c).join('') : h, 16);
  let r = (n>>16)&255, g = (n>>8)&255, b = n&255;
  const f = pct < 0 ? 0 : 255;
  const t = Math.abs(pct);
  r = Math.round((f - r) * t + r);
  g = Math.round((f - g) * t + g);
  b = Math.round((f - b) * t + b);
  return '#' + [r,g,b].map(x => x.toString(16).padStart(2,'0')).join('');
};

const TWEAK_DEFAULTS = {
  primaryColor: '#49a035',
  primaryDark: '#367a26',
  accentColor: '#1E5BAA',
  orangeColor: '#F07020',
  baseFontSize: 16,
  showAgriBg: true,
};

const TweaksUI = () => {
  const { useTweaks, TweaksPanel, TweakSection, TweakColor, TweakSlider, TweakToggle } = window;
  if (!useTweaks) return null;
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  useEffectS(() => {
    const root = document.documentElement;
    root.style.setProperty('--green', tweaks.primaryColor);
    root.style.setProperty('--green-dark', tweaks.primaryDark || shade(tweaks.primaryColor, -0.2));
    root.style.setProperty('--blue', tweaks.accentColor);
    root.style.setProperty('--blue-dark', shade(tweaks.accentColor, -0.2));
    root.style.setProperty('--orange', tweaks.orangeColor);
    root.style.fontSize = tweaks.baseFontSize + 'px';
    document.body.classList.toggle('no-agri-bg', !tweaks.showAgriBg);
  }, [tweaks]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Màu sắc">
        <TweakColor label="Màu chủ đạo (xanh lá)" value={tweaks.primaryColor} onChange={v => setTweak({ primaryColor: v, primaryDark: shade(v, -0.2) })} />
        <TweakColor label="Màu nhấn (xanh dương)" value={tweaks.accentColor} onChange={v => setTweak('accentColor', v)} />
        <TweakColor label="Màu cam"               value={tweaks.orangeColor} onChange={v => setTweak('orangeColor', v)} />
      </TweakSection>
      <TweakSection title="Kiểu dáng">
        <TweakSlider label="Cỡ chữ gốc" min={14} max={20} step={1} value={tweaks.baseFontSize} onChange={v => setTweak('baseFontSize', v)} />
        <TweakToggle label="Hiện nền nông nghiệp mờ" value={tweaks.showAgriBg} onChange={v => setTweak('showAgriBg', v)} />
      </TweakSection>
    </TweaksPanel>
  );
};

// PageShell – wraps a single page's content with header/footer/cart/chat etc.
// Receives a `renderPage(ctx)` function that returns the page body.
const PageShell = ({ pageKey, renderPage, hideFooter, hideHeader, fullScreen }) => {
  const [cart, setCart] = useStateS(loadCart);
  const [cartOpen, setCartOpen] = useStateS(false);
  const [user, setUser] = useStateS(loadUser);
  const [toast, setToast] = useStateS('');

  useEffectS(() => saveCart(cart), [cart]);
  useEffectS(() => saveUser(user), [user]);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2600); };

  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
    showToast('Đã thêm vào giỏ hàng!');
  };

  const navTo = (p) => {
    if (p === 'product-detail') {
      // selectedProduct must already be saved by caller
      window.location.href = 'product-detail.html';
      return;
    }
    const f = PAGE_TO_FILE[p];
    if (f) window.location.href = f;
  };

  const setSelectedProduct = (prod) => { saveSel(prod); window.location.href = 'product-detail.html'; };

  const ctx = {
    page: pageKey, setPage: navTo,
    cart, setCart, addToCart,
    user, setUser,
    setSelectedProduct,
    showToast,
  };

  const { Header, Footer, CartPanel, Toast, ChatWidget, AdminPage } = window;

  // Admin page is full-screen
  if (fullScreen) {
    return (<>
      {renderPage(ctx)}
      <TweaksUI />
    </>);
  }

  return (
    <div>
      {!hideHeader && <Header page={pageKey} setPage={navTo} cart={cart} setCartOpen={setCartOpen} user={user} />}
      <main>{renderPage(ctx)}</main>
      {!hideFooter && Footer && <Footer setPage={navTo} />}
      {CartPanel && <CartPanel cart={cart} setCart={setCart} open={cartOpen} setOpen={setCartOpen} setPage={navTo} />}
      {Toast && <Toast msg={toast} />}
      <TweaksUI />
      {ChatWidget && <ChatWidget />}
      <div style={{ position:'fixed', bottom:28, left:24, zIndex:900, display:'flex', flexDirection:'column', gap:10 }}>
        <a href="tel:1800xxxx" title="Gọi hotline" style={{ width:48, height:48, borderRadius:'50%', background:'var(--blue)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(30,91,170,0.35)', textDecoration:'none' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        </a>
        <a href="#" title="Chat Zalo" style={{ width:48, height:48, borderRadius:'50%', background:'#0068ff', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(0,104,255,0.35)', textDecoration:'none' }}>
          <svg width="22" height="22" viewBox="0 0 32 32" fill="#fff"><path d="M16 3C8.8 3 3 8.1 3 14.4c0 4 2.2 7.6 5.6 9.9l-.9 4.3 4.7-2.4c1.1.3 2.3.5 3.6.5 7.2 0 13-5.1 13-11.4C29 8.1 23.2 3 16 3zm1.3 15.3l-3.3-3.5-6.4 3.5 7.1-7.5 3.4 3.5 6.3-3.5-7.1 7.5z"/></svg>
        </a>
      </div>
    </div>
  );
};

window.DM_SHELL = { PageShell, loadSel, saveSel, loadCart, saveCart, loadUser, saveUser };
