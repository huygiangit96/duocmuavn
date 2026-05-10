// dm-extras.jsx — Chat widget + Admin dashboard
const { useState: useStateE, useEffect: useEffectE, useRef: useRefE } = React;

// ════════════════════════════════════════════════════════════════
// CHAT WIDGET (CSKH popup, messenger style)
// ════════════════════════════════════════════════════════════════
const ChatWidget = () => {
  const [open, setOpen] = useStateE(false);
  const [msgs, setMsgs] = useStateE([
    { from:'agent', text:'Xin chào! 👋 Bạn cần hỗ trợ gì? Mình là Mai – tư vấn viên Được Mùa GAH.', time:'10:00' },
    { from:'agent', text:'Bạn có thể nhắn câu hỏi về sản phẩm, đơn hàng hoặc kỹ thuật canh tác.', time:'10:00' },
  ]);
  const [text, setText] = useStateE('');
  const [typing, setTyping] = useStateE(false);
  const [unread, setUnread] = useStateE(2);
  const endRef = useRefE(null);

  useEffectE(() => { if (endRef.current) endRef.current.scrollIntoView({block:'end'}); }, [msgs, typing, open]);
  useEffectE(() => { if (open) setUnread(0); }, [open]);

  const send = () => {
    const t = text.trim(); if (!t) return;
    const now = new Date(); const time = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
    setMsgs(m => [...m, { from:'user', text:t, time }]);
    setText('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      const replies = [
        'Cảm ơn bạn đã liên hệ! Để hỗ trợ chính xác, bạn cho mình xin tên cây trồng và triệu chứng nhé.',
        'Sản phẩm này hiện đang được khuyến mãi. Bạn muốn mình tư vấn thêm về liều dùng không?',
        'Bạn vui lòng để lại số điện thoại, mình sẽ gọi tư vấn ngay trong 5 phút nhé!',
        'Đơn hàng sẽ được giao trong 1-2 ngày làm việc. Phí ship miễn phí cho đơn ≥ 500.000₫.',
      ];
      setMsgs(m => [...m, { from:'agent', text: replies[Math.floor(Math.random()*replies.length)], time }]);
    }, 1100);
  };

  const quickReplies = ['Tư vấn sản phẩm', 'Theo dõi đơn hàng', 'Bảng giá đại lý', 'Liên hệ kỹ thuật'];

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(v=>!v)} aria-label="Chat" style={{ position:'fixed', bottom:24, right:24, zIndex:1500, width:60, height:60, borderRadius:'50%', border:'none', cursor:'pointer', background:'linear-gradient(135deg, var(--blue), var(--blue-dark))', boxShadow:'0 8px 24px rgba(30,91,170,0.5)', display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.2s' }}
        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'}
        onMouseLeave={e=>e.currentTarget.style.transform='none'}
      >
        {open
          ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          : <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff"><path d="M12 2C6.48 2 2 6.21 2 11.4c0 2.94 1.5 5.55 3.83 7.27V22l3.5-1.93c.85.23 1.75.36 2.67.36 5.52 0 10-4.21 10-9.4S17.52 2 12 2z"/></svg>
        }
        {!open && unread > 0 && <span style={{ position:'absolute', top:2, right:2, background:'#e74c3c', color:'#fff', minWidth:20, height:20, borderRadius:10, fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 5px', border:'2px solid #fff' }}>{unread}</span>}
      </button>

      {/* Popup window */}
      {open && (
        <div style={{ position:'fixed', bottom:96, right:24, zIndex:1499, width:'min(360px, calc(100vw - 32px))', height:'min(540px, calc(100vh - 130px))', background:'#fff', borderRadius:18, boxShadow:'0 20px 60px rgba(0,0,0,0.25)', display:'flex', flexDirection:'column', overflow:'hidden', animation:'chatSlide 0.25s ease-out' }}>
          <style>{`@keyframes chatSlide { from { opacity:0; transform: translateY(20px) scale(0.96); } to { opacity:1; transform: none; } }`}</style>
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg, var(--blue), var(--blue-dark))', color:'#fff', padding:'16px 18px', display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:42, height:42, borderRadius:'50%', background:'linear-gradient(135deg,#FFE600,var(--orange))', color:'#fff', fontWeight:800, fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>M</div>
              <div style={{ position:'absolute', bottom:0, right:0, width:11, height:11, borderRadius:'50%', background:'#2ecc71', border:'2px solid var(--blue)' }}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:800, fontSize:15 }}>CSKH Được Mùa GAH</div>
              <div style={{ fontSize:12, opacity:0.9 }}>● Đang trực tuyến</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:'rgba(255,255,255,0.15)', border:'none', borderRadius:8, width:30, height:30, cursor:'pointer', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px 14px', background:'linear-gradient(180deg, #f5f9fc 0%, #fff 100%)' }}>
            {msgs.map((m,i) => (
              <div key={i} style={{ display:'flex', justifyContent:m.from==='user'?'flex-end':'flex-start', marginBottom:8 }}>
                <div style={{ maxWidth:'78%', padding:'9px 13px', borderRadius:m.from==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px', background:m.from==='user'?'var(--blue)':'#fff', color:m.from==='user'?'#fff':'var(--text)', fontSize:13.5, lineHeight:1.5, boxShadow:'0 1px 4px rgba(0,0,0,0.06)', border:m.from==='agent'?'1px solid var(--border)':'none' }}>
                  {m.text}
                  <div style={{ fontSize:10, opacity:0.6, marginTop:3, textAlign:'right' }}>{m.time}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div style={{ display:'flex', gap:4, padding:'10px 14px', background:'#fff', borderRadius:'14px 14px 14px 4px', width:'fit-content', border:'1px solid var(--border)' }}>
                {[0,1,2].map(i => <span key={i} style={{ width:6, height:6, borderRadius:'50%', background:'#aaa', animation:`typing 1.2s infinite ${i*0.15}s` }}/>)}
                <style>{`@keyframes typing { 0%,60%,100% { opacity:0.3; transform:translateY(0); } 30% { opacity:1; transform:translateY(-4px); } }`}</style>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Quick replies */}
          {msgs.length <= 2 && (
            <div style={{ padding:'4px 14px 8px', display:'flex', gap:6, flexWrap:'wrap', borderTop:'1px solid var(--border)' }}>
              {quickReplies.map(q => (
                <button key={q} onClick={() => { setText(q); setTimeout(send, 50); }} style={{ background:'#f5f9fc', border:'1px solid var(--border)', color:'var(--blue)', padding:'5px 11px', borderRadius:14, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font)' }}>{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:'10px 12px', borderTop:'1px solid var(--border)', display:'flex', gap:8, alignItems:'center', background:'#fff' }}>
            <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Nhập tin nhắn..." style={{ flex:1, padding:'10px 14px', border:'1px solid var(--border)', borderRadius:20, fontSize:13.5, outline:'none', fontFamily:'var(--font)', background:'#f5f9fc' }}/>
            <button onClick={send} disabled={!text.trim()} style={{ width:38, height:38, borderRadius:'50%', border:'none', background:text.trim()?'var(--blue)':'#ccc', color:'#fff', cursor:text.trim()?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ════════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ════════════════════════════════════════════════════════════════
const AdminPage = ({ setPage }) => {
  const [section, setSection] = useStateE('dashboard');
  const [search, setSearch] = useStateE('');
  const D = window.DM;

  const sections = [
    ['dashboard',  '📊 Tổng quan'],
    ['products',   '📦 Sản phẩm'],
    ['cats',       '🗂️ Danh mục SP'],
    ['promos',     '🎁 Khuyến mãi'],
    ['orders',     '🛒 Đơn hàng'],
    ['reviews',    '⭐ Bình luận / Đánh giá'],
    ['users',      '👥 Người dùng'],
    ['news',       '📰 Tin tức / Bài viết'],
    ['newscats',   '🏷️ Danh mục bài viết'],
    ['docs-paper', '📄 Tài liệu giấy'],
    ['docs-video', '🎬 Tài liệu video'],
    ['banners',    '🖼️ Banner trang chủ'],
    ['contacts',   '📞 Thông tin liên hệ'],
    ['social',     '💬 Hotline / Zalo / MXH'],
  ];

  const fmt = window.DM_FMT || (n => n.toLocaleString('vi-VN')+'₫');
  const newsCats = [...new Set(D.NEWS.map(n => n.catName))];

  // Reusable table component
  const Table = ({ cols, rows, actions=true }) => (
    <div style={{ background:'#fff', borderRadius:12, border:'1px solid var(--border)', overflow:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
        <thead>
          <tr style={{ background:'#f8faf5' }}>
            {cols.map(c => <th key={c.k} style={{ textAlign:'left', padding:'12px 14px', fontSize:12, fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5, borderBottom:'2px solid var(--border)', whiteSpace:'nowrap' }}>{c.label}</th>)}
            {actions && <th style={{ padding:'12px 14px', borderBottom:'2px solid var(--border)', width:120 }}></th>}
          </tr>
        </thead>
        <tbody>
          {rows.length===0 && <tr><td colSpan={cols.length+(actions?1:0)} style={{ padding:30, textAlign:'center', color:'var(--text-muted)' }}>Không có dữ liệu</td></tr>}
          {rows.map((r,i) => (
            <tr key={i} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.15s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#f8faf5'}
              onMouseLeave={e=>e.currentTarget.style.background='#fff'}
            >
              {cols.map(c => <td key={c.k} style={{ padding:'12px 14px', fontSize:13, verticalAlign:'middle' }}>{c.render?c.render(r):r[c.k]}</td>)}
              {actions && (
                <td style={{ padding:'8px 14px', whiteSpace:'nowrap', textAlign:'right' }}>
                  <button title="Sửa" style={adminIcon('var(--blue)')}>✎</button>
                  <button title="Xoá" style={adminIcon('#c0392b')}>🗑</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const adminIcon = (c) => ({ background:'transparent', border:'1px solid '+c, color:c, width:28, height:28, borderRadius:6, cursor:'pointer', marginLeft:4, fontSize:13 });

  const StatusPill = ({ children, color }) => (
    <span style={{ background: color+'20', color, fontSize:11, fontWeight:700, padding:'3px 9px', borderRadius:12 }}>{children}</span>
  );

  const SectionHeader = ({ title, action='+ Thêm mới' }) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18, gap:12, flexWrap:'wrap' }}>
      <div>
        <h2 style={{ margin:0, fontWeight:800, fontSize:22 }}>{title}</h2>
      </div>
      <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Tìm kiếm..." style={{ padding:'8px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:13, outline:'none', fontFamily:'var(--font)', minWidth:200 }}/>
        <button style={{ background:'var(--green)', color:'#fff', border:'none', padding:'9px 16px', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'var(--font)' }}>{action}</button>
      </div>
    </div>
  );

  const filt = (arr, fn) => search ? arr.filter(fn) : arr;

  // ───── Per-section content ─────
  const renderSection = () => {
    switch(section) {
      case 'dashboard':
        const stats = [
          { label:'Tổng đơn hàng', v:D.ADMIN_ORDERS.length, sub:'+12% so với tuần trước', color:'var(--blue)', icon:'🛒' },
          { label:'Doanh thu (₫)', v:'12.5tr', sub:'+8% so với tháng trước', color:'var(--green)', icon:'💰' },
          { label:'Khách hàng', v:D.ADMIN_USERS.length, sub:'+2 mới hôm nay', color:'var(--orange)', icon:'👥' },
          { label:'Sản phẩm', v:D.PRODUCTS.length, sub:D.PRODUCTS.filter(p=>p.promo).length+' đang KM', color:'#7b5ea7', icon:'📦' },
        ];
        return (
          <>
            <h2 style={{ margin:'0 0 6px', fontWeight:800, fontSize:22 }}>Tổng quan</h2>
            <p style={{ margin:'0 0 22px', color:'var(--text-muted)', fontSize:14 }}>Chào mừng quay lại, Admin! Đây là tình hình hôm nay.</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:14, marginBottom:24 }}>
              {stats.map(s => (
                <div key={s.label} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:18, position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:14, right:14, fontSize:28, opacity:0.25 }}>{s.icon}</div>
                  <div style={{ fontSize:13, color:'var(--text-muted)', fontWeight:600 }}>{s.label}</div>
                  <div style={{ fontSize:30, fontWeight:900, color:s.color, lineHeight:1.1, margin:'6px 0 4px' }}>{s.v}</div>
                  <div style={{ fontSize:12, color:'var(--green-dark)' }}>{s.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }} className="adm-2col">
              <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:18 }}>
                <h3 style={{ margin:'0 0 12px', fontSize:15, fontWeight:800 }}>Đơn hàng gần đây</h3>
                {D.ADMIN_ORDERS.slice(0,5).map(o => (
                  <div key={o.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                    <div><div style={{ fontWeight:700, fontSize:13 }}>#{o.id}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{o.user} · {o.date}</div></div>
                    <div style={{ textAlign:'right' }}><div style={{ fontWeight:800, color:'var(--blue)', fontSize:13 }}>{fmt(o.total)}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{o.status}</div></div>
                  </div>
                ))}
              </div>
              <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:18 }}>
                <h3 style={{ margin:'0 0 12px', fontSize:15, fontWeight:800 }}>Đánh giá chờ duyệt</h3>
                {D.ADMIN_REVIEWS.filter(r=>r.status==='Chờ duyệt').map(r => (
                  <div key={r.id} style={{ padding:'10px 0', borderBottom:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <strong style={{ fontSize:13 }}>{r.user}</strong>
                      <span style={{ color:'var(--orange)' }}>{'★'.repeat(r.rating)}</span>
                    </div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{r.product}: {r.text}</div>
                  </div>
                ))}
                {D.ADMIN_REVIEWS.filter(r=>r.status==='Chờ duyệt').length===0 && <div style={{ color:'var(--text-muted)', fontSize:13 }}>Không có đánh giá chờ duyệt</div>}
              </div>
            </div>
          </>
        );

      case 'products':
        return (<>
          <SectionHeader title="Quản lý sản phẩm" />
          <Table cols={[
            { k:'id', label:'ID' },
            { k:'name', label:'Tên SP', render:r => <strong>{r.name}</strong> },
            { k:'cat', label:'Danh mục', render:r => (D.CATS.find(c=>c.id===r.catId)||{}).name },
            { k:'price', label:'Giá KM', render:r => <span style={{ color:'var(--blue)', fontWeight:700 }}>{fmt(r.price)}</span> },
            { k:'list', label:'Giá gốc', render:r => r.listPrice>r.price?<span style={{ textDecoration:'line-through', color:'#999' }}>{fmt(r.listPrice)}</span>:'—' },
            { k:'promo', label:'Promo', render:r => r.promo?<StatusPill color="#c0392b">{r.promo}</StatusPill>:'—' },
            { k:'tag', label:'Tag', render:r => r.tag?<StatusPill color={r.tag==='Mới'?'var(--green-dark)':'var(--orange)'}>{r.tag}</StatusPill>:'—' },
            { k:'rating', label:'★', render:r => r.rating+' ('+r.reviews+')' },
          ]} rows={filt(D.PRODUCTS, p=>p.name.toLowerCase().includes(search.toLowerCase()))} />
        </>);

      case 'cats':
        return (<>
          <SectionHeader title="Danh mục sản phẩm" />
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:14 }}>
            {D.CATS.map(c => (
              <div key={c.id} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:16, borderLeft:'4px solid '+c.color }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>ID {c.id}</div>
                    <div style={{ fontWeight:800, fontSize:15 }}>{c.name}</div>
                  </div>
                  <div>
                    <button style={adminIcon('var(--blue)')}>✎</button>
                    <button style={adminIcon('#c0392b')}>🗑</button>
                  </div>
                </div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>{c.fullName}</div>
                <div style={{ fontSize:12, color:c.color, fontWeight:700 }}>{D.PRODUCTS.filter(p=>p.catId===c.id).length} sản phẩm</div>
              </div>
            ))}
          </div>
        </>);

      case 'promos':
        return (<>
          <SectionHeader title="Quản lý khuyến mãi" />
          <Table cols={[
            { k:'code', label:'Mã code', render:r => <code style={{ background:'#f0f7e0', color:'var(--green-dark)', padding:'2px 8px', borderRadius:5, fontWeight:700 }}>{r.code}</code> },
            { k:'name', label:'Tên chương trình' },
            { k:'discount', label:'Giảm giá' },
            { k:'period', label:'Thời gian', render:r => r.start+' → '+r.end },
            { k:'uses', label:'Lượt dùng' },
            { k:'status', label:'Trạng thái', render:r => <StatusPill color={r.status==='Đang chạy'?'var(--green-dark)':'#999'}>{r.status}</StatusPill> },
          ]} rows={D.ADMIN_PROMOS} />
        </>);

      case 'orders':
        return (<>
          <SectionHeader title="Quản lý đơn hàng" action="↓ Xuất Excel" />
          <Table cols={[
            { k:'id', label:'Mã ĐH', render:r => <strong style={{ color:'var(--blue)' }}>#{r.id}</strong> },
            { k:'user', label:'Khách hàng' },
            { k:'date', label:'Ngày đặt' },
            { k:'total', label:'Tổng tiền', render:r => <strong>{fmt(r.total)}</strong> },
            { k:'pay', label:'Thanh toán' },
            { k:'status', label:'Trạng thái', render:r => <StatusPill color={r.status==='Đã giao'?'var(--green-dark)':r.status==='Đang giao'?'var(--orange)':r.status==='Đã hủy'?'#c0392b':'#999'}>{r.status}</StatusPill> },
          ]} rows={D.ADMIN_ORDERS} />
        </>);

      case 'reviews':
        return (<>
          <SectionHeader title="Quản lý bình luận, đánh giá" />
          <Table cols={[
            { k:'product', label:'Sản phẩm' },
            { k:'user', label:'Người dùng' },
            { k:'rating', label:'Sao', render:r => <span style={{ color:'var(--orange)' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5-r.rating)}</span> },
            { k:'text', label:'Nội dung', render:r => <span style={{ color:'var(--text-muted)' }}>{r.text}</span> },
            { k:'date', label:'Ngày' },
            { k:'status', label:'Trạng thái', render:r => <StatusPill color={r.status==='Đã duyệt'?'var(--green-dark)':'var(--orange)'}>{r.status}</StatusPill> },
          ]} rows={D.ADMIN_REVIEWS} />
        </>);

      case 'users':
        return (<>
          <SectionHeader title="Quản lý người dùng" />
          <Table cols={[
            { k:'name', label:'Họ tên', render:r => <div style={{ display:'flex', gap:9, alignItems:'center' }}><div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,var(--blue),var(--green))', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13 }}>{r.name[0]}</div><div><div style={{ fontWeight:700 }}>{r.name}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{r.email}</div></div></div> },
            { k:'phone', label:'Điện thoại' },
            { k:'role', label:'Vai trò' },
            { k:'orders', label:'Số đơn' },
            { k:'joined', label:'Tham gia' },
            { k:'status', label:'Trạng thái', render:r => <StatusPill color={r.status==='Hoạt động'?'var(--green-dark)':'#c0392b'}>{r.status}</StatusPill> },
          ]} rows={filt(D.ADMIN_USERS, u=>u.name.toLowerCase().includes(search.toLowerCase())||u.email.includes(search))} />
        </>);

      case 'news':
        return (<>
          <SectionHeader title="Quản lý tin tức / bài viết" />
          <Table cols={[
            { k:'id', label:'ID' },
            { k:'title', label:'Tiêu đề', render:r => <div><strong>{r.title}</strong>{r.featured && <span style={{ marginLeft:8, background:'#FFE600', color:'#856404', fontSize:10, fontWeight:800, padding:'2px 7px', borderRadius:4 }}>NỔI BẬT</span>}<div style={{ fontSize:11, color:'var(--text-muted)', marginTop:3 }}>{(r.tags||[]).map(t=>'#'+t).join(' ')}</div></div> },
            { k:'catName', label:'Danh mục' },
            { k:'date', label:'Ngày đăng' },
          ]} rows={filt(D.NEWS, n=>n.title.toLowerCase().includes(search.toLowerCase()))} />
        </>);

      case 'newscats':
        return (<>
          <SectionHeader title="Danh mục bài viết" />
          <Table cols={[
            { k:'name', label:'Tên danh mục', render:r => <strong>{r.name}</strong> },
            { k:'count', label:'Số bài viết' },
          ]} rows={newsCats.map(n=>({ name:n, count:D.NEWS.filter(x=>x.catName===n).length }))} />
        </>);

      case 'docs-paper':
        return (<>
          <SectionHeader title="Quản lý tài liệu giấy" />
          <Table cols={[
            { k:'id', label:'ID' },
            { k:'title', label:'Tiêu đề', render:r => <strong>📄 {r.title}</strong> },
            { k:'topic', label:'Chủ đề' },
            { k:'plant', label:'Cây trồng' },
            { k:'date', label:'Ngày phát hành' },
          ]} rows={D.DOCS_PAPER} />
        </>);

      case 'docs-video':
        return (<>
          <SectionHeader title="Quản lý tài liệu video" />
          <Table cols={[
            { k:'id', label:'ID' },
            { k:'title', label:'Tiêu đề', render:r => <strong>🎬 {r.title}</strong> },
            { k:'topic', label:'Chủ đề' },
            { k:'plant', label:'Cây trồng' },
            { k:'duration', label:'Thời lượng' },
          ]} rows={D.DOCS_VIDEO} />
        </>);

      case 'banners':
        return (<>
          <SectionHeader title="Quản lý banner trang chủ" />
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {D.ADMIN_BANNERS.map(b => (
              <div key={b.id} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:16, display:'flex', gap:14, alignItems:'center' }}>
                <div style={{ width:120, height:70, borderRadius:8, background:'linear-gradient(135deg, var(--blue), var(--green))', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:24, fontWeight:800, flexShrink:0 }}>#{b.order}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:15 }}>{b.title}</div>
                  <div style={{ fontSize:13, color:'var(--text-muted)', margin:'3px 0' }}>{b.sub}</div>
                  <div style={{ fontSize:11, color:'var(--blue)' }}>🔗 {b.link}</div>
                </div>
                <label style={{ display:'flex', gap:6, alignItems:'center', cursor:'pointer', fontSize:13, fontWeight:600 }}>
                  <input type="checkbox" defaultChecked={b.active} style={{ accentColor:'var(--green)', width:16, height:16 }}/>
                  Hiển thị
                </label>
                <div>
                  <button style={adminIcon('var(--blue)')}>✎</button>
                  <button style={adminIcon('#c0392b')}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        </>);

      case 'contacts':
      case 'social':
        return (<>
          <SectionHeader title={section==='contacts'?'Thông tin liên hệ':'Hotline / Zalo / Mạng xã hội'} action="+ Thêm" />
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:6 }}>
            {(section==='contacts'?D.ADMIN_CONTACTS.filter(c=>['Hotline','Email','Địa chỉ'].includes(c.key)):D.ADMIN_CONTACTS.filter(c=>['Zalo OA','Facebook','Youtube','Tiktok'].includes(c.key))).map(c => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 14px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:90, fontSize:13, fontWeight:700, color:'var(--text-muted)' }}>{c.key}</div>
                <input defaultValue={c.value} style={{ flex:1, padding:'9px 12px', border:'1px solid var(--border)', borderRadius:8, fontSize:13.5, outline:'none', fontFamily:'var(--font)' }}/>
                <label style={{ display:'flex', gap:6, alignItems:'center', cursor:'pointer', fontSize:12, fontWeight:600 }}>
                  <input type="checkbox" defaultChecked={c.visible} style={{ accentColor:'var(--green)', width:15, height:15 }}/>
                  Public
                </label>
                <button style={adminIcon('var(--blue)')}>💾</button>
              </div>
            ))}
          </div>
        </>);

      default:
        return <div>Section: {section}</div>;
    }
  };

  return (
    <div style={{ minHeight:'100vh', background:'#f5f7fa', display:'flex' }}>
      {/* Sidebar */}
      <aside style={{ width:240, background:'#1a2332', color:'#fff', flexShrink:0, position:'sticky', top:0, height:'100vh', overflowY:'auto', display:'flex', flexDirection:'column' }} className="admin-sidebar">
        <div style={{ padding:'18px 20px', borderBottom:'1px solid #2a3446', display:'flex', alignItems:'center', gap:10 }}>
          <img src="logo.png" style={{ width:36, height:36, objectFit:'contain', background:'#fff', borderRadius:8, padding:3 }} alt=""/>
          <div>
            <div style={{ fontWeight:800, fontSize:14 }}>Được Mùa GAH</div>
            <div style={{ fontSize:11, opacity:0.6 }}>Admin Panel</div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'10px 0', overflowY:'auto' }}>
          {sections.map(([k,l]) => (
            <div key={k} onClick={() => { setSection(k); setSearch(''); }} style={{ padding:'11px 20px', cursor:'pointer', fontSize:13, fontWeight:section===k?700:500, background:section===k?'linear-gradient(90deg, var(--green-dark), transparent)':'transparent', color:section===k?'#fff':'#cbd5e0', borderLeft:section===k?'3px solid var(--green)':'3px solid transparent', transition:'all 0.15s' }}>{l}</div>
          ))}
        </nav>
        <div onClick={() => setPage('home')} style={{ padding:'14px 20px', borderTop:'1px solid #2a3446', fontSize:13, fontWeight:600, color:'#cbd5e0', cursor:'pointer' }}>← Về website</div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
        <header style={{ background:'#fff', borderBottom:'1px solid var(--border)', padding:'12px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10 }}>
          <button className="admin-mob-toggle" onClick={() => document.querySelector('.admin-sidebar').classList.toggle('open')} style={{ display:'none', background:'none', border:'none', fontSize:22, cursor:'pointer' }}>☰</button>
          <div style={{ fontSize:13, color:'var(--text-muted)' }}>Trang chủ / Admin / <strong style={{ color:'var(--text)' }}>{(sections.find(s=>s[0]===section)||[])[1]}</strong></div>
          <div style={{ display:'flex', gap:14, alignItems:'center' }}>
            <span style={{ fontSize:20, cursor:'pointer' }}>🔔</span>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,var(--blue),var(--green))', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13 }}>A</div>
          </div>
        </header>
        <main style={{ flex:1, padding:'22px 24px', overflowY:'auto' }}>
          {renderSection()}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar { position: fixed !important; left: 0; top: 0; transform: translateX(-100%); transition: transform 0.25s; z-index:1100; }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-mob-toggle { display: block !important; }
          .adm-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

window.DM_FMT = n => n.toLocaleString('vi-VN')+'₫';
Object.assign(window, { ChatWidget, AdminPage });
