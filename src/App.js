import { useState } from 'react';

export default function App(){
  const [city,setCity]=useState('Madhapur');
  const [showCity,setShowCity]=useState(false);
  const [cat,setCat]=useState('All');
  const [sort,setSort]=useState('Latest');
  const [tab,setTab]=useState('home');
  const [showPost,setShowPost]=useState(false);
  const [postCat,setPostCat]=useState('General');
  const [postText,setPostText]=useState('');
  const [postImg,setPostImg]=useState(null);
  const [showNotif,setShowNotif]=useState(false);

  const cities = [
    {name:'Madhapur', sub:'Hyderabad'},
    {name:'Renigunta', sub:'Tirupati'},
    {name:'Tiruchanoor', sub:'Tirupati'},
    {name:'Chandragiri', sub:'Tirupati'},
    {name:'Akkarampalle', sub:'Tirupati'},
  ];

  const cats = [
    {id:'All', icon:'', label:'All'},
    {id:'General', icon:'💬', label:'General'},
    {id:'Help', icon:'🤝', label:'Help'},
    {id:'Alert', icon:'🚨', label:'Alert'},
    {id:'Lost & Found', icon:'🔍', label:'Lost & Found'},
    {id:'Buy/Sell', icon:'🛒', label:'Buy/Sell'},
  ];

  const [posts,setPosts]=useState([
    {id:1, author:'H Anesh', letter:'H', time:'27m', area:'Approx. area', cat:'General', text:'Hi', likes:0, liked:false, comments:[], saved:false, img:null},
    {id:2, author:'Suresh R.', letter:'S', time:'1h', area:'Near main road', cat:'Alert', text:'Water supply stopped in our street since morning. Tanker booked, expected by 5 PM.', likes:4, liked:true, comments:[{id:101, author:'Ravi', text:'Thanks for update'}], saved:false, img:null},
    {id:3, author:'Anitha K.', letter:'A', time:'3h', area:'Approx. area', cat:'Help', text:'Anyone know a good electrician nearby? Fan wiring issue, need someone today.', likes:1, liked:false, comments:[{id:102, author:'Balaji', text:'Call 98765'}], saved:false, img:null},
    {id:4, author:'Mohammed A.', letter:'M', time:'5h', area:'Main road bus stop', cat:'Lost & Found', text:'Found keys near bus stop. Contact me if yours.', likes:2, liked:false, comments:[], saved:false, img:null},
    {id:5, author:'Kiran B.', letter:'K', time:'6h', area:'Renigunta Road', cat:'Buy/Sell', text:'Selling cycle - Rs 3500, good condition. DM if interested.', likes:3, liked:false, comments:[], saved:false, img:'https://images.unsplash.com/photo-1484156818044-c0402b43b4ae?w=400'},
  ]);

  const filtered = posts.filter(p=> (cat==='All'||p.cat===cat)).sort((a,b)=> sort==='Popular'? (b.likes+b.comments.length)- (a.likes+a.comments.length) : b.id-a.id);
  const alerts = posts.filter(p=> p.cat==='Alert');

  const toggleLike = id=> setPosts(posts.map(p=> p.id===id? {...p, liked:!p.liked, likes:p.liked?p.likes-1:p.likes+1}:p));
  const toggleSave = id=> setPosts(posts.map(p=> p.id===id? {...p, saved:!p.saved}:p));
  const addComment = (id,txt)=>{ if(!txt.trim()) return; setPosts(posts.map(p=> p.id===id? {...p, comments:[...p.comments,{id:Date.now(), author:'You', text:txt}]}:p)); };
  const createPost = ()=>{
    if(!postText.trim()) return;
    setPosts([{id:Date.now(), author:'You', letter:'Y', time:'Just now', area:'Approx. area', cat:postCat, text:postText, likes:0, liked:false, comments:[], saved:false, img:postImg},...posts]);
    setPostText(''); setPostImg(null); setShowPost(false); setTab('home'); setCat('All');
  };

  const catColor = c=>{
    if(c==='Alert') return {bg:'#FF3B30', color:'white', border:'#FF3B30', icon:'🚨'};
    if(c==='Help') return {bg:'#1A3A3A', color:'#5EEAD4', border:'#1A3A3A', icon:'🤝'};
    if(c==='Lost & Found') return {bg:'#1A3A3A', color:'#5EEAD4', border:'#1A3A3A', icon:'🔍'};
    if(c==='Buy/Sell') return {bg:'#1A3A3A', color:'#5EEAD4', border:'#1A3A3A', icon:'🛒'};
    return {bg:'#1A3A3A', color:'#5EEAD4', border:'#1A3A3A', icon:'💬'};
  };

    return (
    <div style={{minHeight:'100vh', background:'#0A0A0A', color:'white', fontFamily:'system-ui', paddingBottom:80}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap'); *{font-family:Inter} ::-webkit-scrollbar{display:none}`}</style>

      {/* TOP BAR - like screenshot */}
      <div style={{position:'sticky', top:0, zIndex:30, background:'#121212', padding:'12px 14px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid #1E1E1E'}}>
        <button onClick={()=>{}} style={{width:32, height:32, background:'transparent', border:'none', color:'white', fontSize:24}}>✕</button>
        <div style={{flex:1, fontWeight:600, fontSize:16, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>Padosi - Your neighbourho...</div>
        <button onClick={()=>setShowNotif(!showNotif)} style={{width:36, height:36, background:'transparent', border:'none', color:'white', fontSize:20, position:'relative'}}>💬{alerts.length>0&&<span style={{position:'absolute', top:0, right:0, width:8, height:8, background:'#FF3B30', borderRadius:50}}></span>}</button>
        <button style={{width:32, height:32, background:'transparent', border:'none', color:'white', fontSize:22}}>⋮</button>
      </div>

      <div style={{maxWidth:480, margin:'0 auto'}}>
        {/* HEADER - प logo */}
        <div style={{padding:'14px 14px 6px', display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:44, height:44, background:'#5EEAD4', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#0A0A0A', fontSize:22}}>प</div>
          <div style={{flex:1}}>
            <div style={{display:'flex', alignItems:'center', gap:6}}><b style={{fontSize:18}}>Padosi</b><button onClick={()=>setShowCity(true)} style={{background:'transparent', border:'none', color:'#888', fontSize:12}}>▼</button></div>
            <div style={{fontSize:13, color:'#888'}}>{city} · Your neighbourhood, connected.</div>
          </div>
        </div>

        {/* CATEGORY FILTERS - screenshot style */}
        <div style={{display:'flex', gap:8, overflowX:'auto', padding:'10px 14px 6px'}}>
          {cats.map(c=>{
            const active = cat===c.id;
            return <button key={c.id} onClick={()=>setCat(c.id)} style={{display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:20, border:'none', background:active?'#5EEAD4':'#1E1E1E', color:active?'#0A0A0A':'#CCCCCC', fontSize:13, fontWeight:600, whiteSpace:'nowrap', flexShrink:0}}>{c.icon&&<span>{c.icon}</span>}{c.label}</button>
          })}
        </div>

        {/* SORT - Latest Popular */}
        <div style={{display:'flex', gap:8, padding:'6px 14px 12px'}}>
          {['Latest','Popular'].map(s=> <button key={s} onClick={()=>setSort(s)} style={{padding:'7px 14px', borderRadius:20, border:'none', background:sort===s?'#5EEAD4':'#1E1E1E', color:sort===s?'#0A0A0A':'#AAA', fontSize:13, fontWeight:600}}>{s}</button>)}
        </div>

        {/* NOTIF PANEL */}
        {showNotif && <div style={{margin:'0 14px 12px', background:'#1E1E1E', border:'1px solid #2A2A2A', borderRadius:16, overflow:'hidden'}}><div style={{padding:12, display:'flex', justifyContent:'space-between', borderBottom:'1px solid #2A2A2A'}}><b style={{fontSize:13}}>Alerts ({alerts.length})</b><button onClick={()=>setShowNotif(false)} style={{background:'none', border:'none', color:'white'}}>✕</button></div>{alerts.map(a=> <div key={a.id} style={{padding:'10px 12px', fontSize:12, borderBottom:'1px solid #2A2A2A'}}>🚨 {a.text}</div>)}</div>}

        {/* FEED - exact screenshot cards */}
        <div style={{padding:'0 12px', display:'flex', flexDirection:'column', gap:12}}>
          {filtered.map(p=>{
            const isAlert = p.cat==='Alert';
            const cc = catColor(p.cat);
            return (
              <div key={p.id} style={{background:'#1C1C1C', border:`1px solid ${isAlert?'#FF3B30':'#2A2A2A'}`, borderRadius:20, padding:14}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                  <div style={{display:'flex', gap:10}}>
                    <div style={{width:40, height:40, background:'#1A3A3A', borderRadius:50, display:'flex', alignItems:'center', justifyContent:'center', color:'#5EEAD4', fontWeight:700}}>{p.letter}</div>
                    <div><b style={{fontSize:14, display:'block'}}>{p.author}</b><span style={{fontSize:12, color:'#888'}}>{p.time} · {p.area}</span></div>
                  </div>
                  <div style={{background:cc.bg, color:cc.color, borderRadius:20, padding:'5px 10px', fontSize:12, fontWeight:700, display:'flex', gap:4, alignItems:'center'}}><span>{cc.icon}</span>{p.cat}</div>
                </div>
                <p style={{margin:'12px 0 0', fontSize:15, lineHeight:1.5, whiteSpace:'pre-wrap'}}>{p.text}</p>
                {p.img && <img src={p.img} alt="" style={{width:'100%', borderRadius:14, marginTop:10, maxHeight:240, objectFit:'cover'}} />}
                <div style={{display:'flex', alignItems:'center', gap:16, marginTop:14}}>
                  <button onClick={()=>toggleLike(p.id)} style={{display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:p.liked?'#5EEAD4':'#888', fontSize:14}}><span style={{fontSize:18}}>{p.liked?'♥':'♡'}</span><span style={{fontWeight:600, color:p.liked?'#5EEAD4':'#AAA'}}>{p.likes}</span></button>
                  <button onClick={()=>{const el=document.getElementById('cbox'+p.id); if(el) el.style.display=el.style.display==='none'?'flex':'none'}} style={{display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'#AAA', fontSize:14}}>💬 <span>{p.comments.length}</span></button>
                  <button onClick={()=>toggleSave(p.id)} style={{background:'none', border:'none', color:p.saved?'#5EEAD4':'#666', fontSize:18}}>{p.saved?'★':'☆'}</button>
                  <button onClick={()=>{const m=document.getElementById('menu'+p.id); m.style.display=m.style.display==='block'?'none':'block'}} style={{marginLeft:'auto', background:'none', border:'none', color:'#666', fontSize:18}}>⋯</button>
                </div>
                <div id={'menu'+p.id} style={{display:'none', marginTop:8, background:'#2A2A2A', borderRadius:12, overflow:'hidden'}}><button onClick={()=>{toggleSave(p.id); document.getElementById('menu'+p.id).style.display='none'}} style={{width:'100%', textAlign:'left', padding:'10px 12px', background:'none', border:'none', color:'white', fontSize:12}}>{p.saved?'★ Unsave':'☆ Save post'}</button><button onClick={()=>{document.getElementById('menu'+p.id).style.display='none'; alert('Reported');}} style={{width:'100%', textAlign:'left', padding:'10px 12px', background:'none', border:'none', color:'white', fontSize:12}}>🚩 Report</button></div>
                <div id={'cbox'+p.id} style={{display:'none', marginTop:12, flexDirection:'column', gap:8}}>{p.comments.map(c=> <div key={c.id} style={{background:'#121212', borderRadius:12, padding:'8px 10px'}}><b style={{fontSize:12}}>{c.author}:</b><span style={{fontSize:12, marginLeft:6}}>{c.text}</span></div>)}<div style={{display:'flex', gap:6}}><input id={'in'+p.id} placeholder="Write a comment..." onKeyDown={e=>{if(e.key==='Enter'){addComment(p.id, e.target.value); e.target.value='';}}} style={{flex:1, background:'#121212', border:'1px solid #2A2A2A', borderRadius:20, padding:'8px 12px', color:'white', fontSize:12, outline:'none'}} /><button onClick={()=>{const el=document.getElementById('in'+p.id); addComment(p.id, el.value); el.value='';}} style={{background:'#5EEAD4', color:'#0A0A0A', border:'none', borderRadius:20, padding:'8px 14px', fontSize:12, fontWeight:700}}>Send</button></div></div>
              </div>
            );
          })}
          {filtered.length===0 && <div style={{textAlign:'center', padding:40, color:'#666'}}>No posts in {cat}</div>}
        </div>
      </div>

      {/* CITY SELECTOR */}
      {showCity && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16}}><div style={{background:'#1E1E1E', border:'1px solid #2A2A2A', borderRadius:20, padding:20, width:'100%', maxWidth:360}}><b>📍 Select locality</b><div style={{marginTop:12, display:'flex', flexDirection:'column', gap:8}}>{cities.map(c=> <button key={c.name} onClick={()=>{setCity(c.name); setShowCity(false)}} style={{display:'flex', justifyContent:'space-between', padding:'12px 14px', borderRadius:14, border:`1px solid ${city===c.name?'#5EEAD4':'#2A2A2A'}`, background:city===c.name?'#5EEAD4':'transparent', color:city===c.name?'#0A0A0A':'white', textAlign:'left'}}><span><b style={{fontSize:14}}>{c.name}</b><div style={{fontSize:11, color:city===c.name?'#0A0A0A':'#888'}}>{c.sub}</div></span><span style={{fontSize:12}}>→</span></button>)}</div><button onClick={()=>setShowCity(false)} style={{marginTop:12, width:'100%', background:'#2A2A2A', border:'none', padding:10, borderRadius:20, color:'white'}}>Close</button></div></div>}

      {/* CREATE MODAL - + button */}
      {showPost && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, display:'flex', alignItems:'flex-end', justifyContent:'center'}}><div style={{background:'#1E1E1E', borderTop:'1px solid #2A2A2A', borderRadius:'24px 24px 0 0', padding:20, width:'100%', maxWidth:480}}><div style={{display:'flex', justifyContent:'space-between'}}><b>Create post in {city}</b><button onClick={()=>setShowPost(false)} style={{width:32, height:32, background:'#2A2A2A', border:'none', borderRadius:50, color:'white'}}>✕</button></div><div style={{display:'flex', gap:6, overflowX:'auto', marginTop:14}}>{cats.filter(x=>x.id!=='All').map(c=> <button key={c.id} onClick={()=>setPostCat(c.id)} style={{display:'flex', alignItems:'center', gap:4, padding:'6px 12px', borderRadius:20, border:'none', background:postCat===c.id?'#5EEAD4':'#2A2A2A', color:postCat===c.id?'#0A0A0A':'#CCC', fontSize:12, whiteSpace:'nowrap', fontWeight:600}}>{c.icon} {c.label}</button>)}</div><textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder="What's happening in your street? Water issue? Need electrician? Found something?" style={{marginTop:12, width:'100%', height:100, background:'#121212', border:'1px solid #2A2A2A', borderRadius:14, padding:12, color:'white', outline:'none', fontSize:14, resize:'none'}}/><div style={{marginTop:10, display:'flex', gap:8}}><label style={{background:'#2A2A2A', padding:'8px 12px', borderRadius:20, fontSize:12, cursor:'pointer'}}>📸 Photo<input type="file" accept="image/*" onChange={e=> e.target.files[0]&&setPostImg(URL.createObjectURL(e.target.files[0]))} style={{display:'none'}} /></label><span style={{fontSize:11, color:'#888', alignSelf:'center'}}>🔒 Approx. area only</span></div>{postImg&&<div style={{position:'relative', marginTop:10}}><img src={postImg} alt="" style={{width:'100%', borderRadius:12, maxHeight:200, objectFit:'cover'}} /><button onClick={()=>setPostImg(null)} style={{position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.7)', color:'white', border:'none', borderRadius:50, width:28, height:28}}>✕</button></div>}<button onClick={createPost} style={{marginTop:14, width:'100%', background:'#5EEAD4', border:'none', padding:14, borderRadius:24, fontWeight:800, color:'#0A0A0A', fontSize:14}}>Post to {city}</button></div></div>}

      {/* BOTTOM NAV - exact screenshot */}
      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'#121212', borderTop:'1px solid #1E1E1E', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 0 14px', zIndex:50}}>
        <button onClick={()=>setTab('home')} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', color:tab==='home'?'#5EEAD4':'#666', gap:4}}><span style={{fontSize:22}}>⌂</span><span style={{fontSize:10, fontWeight:tab==='home'?700:400}}>Home</span></button>
        <button onClick={()=>{setTab('discover'); alert('Discover: Search communities, services')}} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', color:tab==='discover'?'#5EEAD4':'#666', gap:4}}><span style={{fontSize:20}}>⌕</span><span style={{fontSize:10}}>Discover</span></button>
        <button onClick={()=>setShowPost(true)} style={{background:'#5EEAD4', border:'none', width:56, height:56, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'#0A0A0A', fontWeight:300, marginTop:-28, boxShadow:'0 8px 20px rgba(94,234,212,0.4)'}}>＋</button>
        <button onClick={()=>{setTab('home'); setCat('Alert');}} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', color:cat==='Alert'?'#5EEAD4':'#666', gap:4, position:'relative'}}><span style={{fontSize:22}}>🔔</span>{alerts.length>0&&<span style={{position:'absolute', top:-2, right:6, background:'#FF3B30', color:'white', fontSize:9, width:16, height:16, borderRadius:50, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700}}>{alerts.length}</span>}<span style={{fontSize:10}}>Alerts</span></button>
        <button onClick={()=>{setTab('profile'); alert('Profile: Saved, Blocked, Settings')}} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', color:tab==='profile'?'#5EEAD4':'#666', gap:4}}><span style={{fontSize:20}}>☺</span><span style={{fontSize:10}}>Profile</span></button>
      </div>
    </div>
  );
        }
