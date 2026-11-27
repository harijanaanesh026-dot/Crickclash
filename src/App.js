import { useState } from 'react';

export default function App(){
  const [city,setCity]=useState('Madhapur');
  const [showAreaSetup,setShowAreaSetup]=useState(true);
  const [locPermission,setLocPermission]=useState('pending');
  const [areaConfirm,setAreaConfirm]=useState(false);
  const [privacy,setPrivacy]=useState({approx:true, hideProfile:false, notif:true});
  const [cat,setCat]=useState('All');
  const [sort,setSort]=useState('Latest');
  const [tab,setTab]=useState('home');
  const [search,setSearch]=useState('');
  const [showPost,setShowPost]=useState(false);
  const [postCat,setPostCat]=useState('General');
  const [postText,setPostText]=useState('');
  const [postImg,setPostImg]=useState(null);
  const [showNotif,setShowNotif]=useState(false);
  const [showSearch,setShowSearch]=useState(false);
  const [blocked,setBlocked]=useState([]);
  const [reported,setReported]=useState([]);
  const [showReportMenu,setShowReportMenu]=useState(null);

  const cities = [
    {name:'Madhapur', sub:'Hyderabad · 500081', pop:'2.4k neighbors'},
    {name:'Renigunta', sub:'Tirupati · 517520', pop:'1.8k neighbors'},
    {name:'Tiruchanoor', sub:'Tirupati · 517503', pop:'1.2k neighbors'},
    {name:'Chandragiri', sub:'517101', pop:'890 neighbors'},
  ];

  const categories = [
    {id:'All', icon:'', label:'All'},
    {id:'General', icon:'💬', label:'General'},
    {id:'Help', icon:'🤝', label:'Help'},
    {id:'Alert', icon:'🚨', label:'Alert'},
    {id:'Lost & Found', icon:'🔎', label:'Lost & Found'},
  ];

  const reportReasons = ['Spam','Fake information','Harassment','Wrong category','Inappropriate content'];

  const [posts,setPosts]=useState([
    {id:1, author:'Anesh', letter:'H', time:'27m', area:'Approx. area', exactHide:true, city:'Madhapur', cat:'General', text:'Hi', likes:0, liked:false, comments:[], saved:false, img:null, authorId:'u1'},
    {id:2, author:'Suresh R.', letter:'S', time:'1h', area:'Near main road', exactHide:true, city:'Madhapur', cat:'Alert', text:'Water supply stopped in our street since morning. Tanker booked, expected by 5 PM. Mana street lo water supply morning nundi ledu.', likes:4, liked:false, comments:[{id:101, author:'Ravi', text:'Thanks for update bro', time:'30m'}], saved:false, img:null, authorId:'u2'},
    {id:3, author:'Anitha K.', letter:'A', time:'3h', area:'Approx. area', exactHide:true, city:'Madhapur', cat:'Help', text:'Anyone know a good electrician nearby? Fan wiring issue, need someone today.', likes:1, liked:false, comments:[{id:102, author:'Rahul', text:'Try Kumar Electricals, main road.', time:'1h'}], saved:true, img:null, authorId:'u3'},
    {id:4, author:'Mohammed A.', letter:'M', time:'5h', area:'Main road bus stop', exactHide:true, city:'Madhapur', cat:'Lost & Found', text:'Found keys near bus stop. Contact me if yours.', likes:2, liked:false, comments:[], saved:false, img:null, authorId:'u4'},
    {id:5, author:'Lakshmi', letter:'L', time:'6h', area:'RTC Colony', exactHide:true, city:'Renigunta', cat:'Alert', text:'Power outage - EB line work till 8PM', likes:8, liked:false, comments:[], saved:false, img:null, authorId:'u5'},
  ]);

    const filtered = posts.filter(p=>{
    if(blocked.includes(p.authorId)) return false;
    if(city!=='All' && p.city!==city) return false;
    if(cat!=='All' && p.cat!==cat) return false;
    if(search && !p.text.toLowerCase().includes(search.toLowerCase()) && !p.author.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a,b)=> sort==='Popular'? (b.likes+b.comments.length*2)-(a.likes+a.comments.length*2) : b.id-a.id);

  const alerts = posts.filter(p=> p.cat==='Alert' && p.city===city && !blocked.includes(p.authorId));
  const discoverPosts = posts.filter(p=> p.city===city).slice(0,3);

  const toggleLike = id=> setPosts(posts.map(p=> p.id===id? {...p, liked:!p.liked, likes:p.liked?p.likes-1:p.likes+1}:p));
  const toggleSave = id=> setPosts(posts.map(p=> p.id===id? {...p, saved:!p.saved}:p));
  const deletePost = id=> { 
    const ok = window.confirm('Delete your post?');
    if(ok) setPosts(posts.filter(p=>p.id!==id)); 
  };
  const blockUser = authorId=> { setBlocked([...blocked, authorId]); window.alert('User blocked - posts hidden'); setShowReportMenu(null); };
  const reportPost = (id, reason)=>{ setReported([...reported,{id, reason, time:'Now'}]); window.alert('Reported: '+reason); setShowReportMenu(null); };
  const addComment = (id,txt)=>{ if(!txt.trim()) return; setPosts(posts.map(p=> p.id===id? {...p, comments:[...p.comments,{id:Date.now(), author:'You', text:txt, time:'Just now'}]}:p)); };
  const createPost = ()=>{
    if(!postText.trim()){ window.alert('Write something'); return; }
    const newPost = {id:Date.now(), author:'You', letter:'Y', time:'Just now', area:'Approx. area', exactHide:true, city, cat:postCat, text:postText, likes:0, liked:false, comments:[], saved:false, img:postImg, authorId:'me'};
    setPosts([newPost,...posts]); setPostText(''); setPostImg(null); setShowPost(false); setTab('home'); setCat('All');
  };
  const allowLocation = ()=>{ setLocPermission('granted'); setTimeout(()=>{setAreaConfirm(true);},600); };

  return (
    <div style={{minHeight:'100vh', background:'#0A0A0A', color:'white', fontFamily:'Inter, system-ui', paddingBottom:80}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap'); *{font-family:Inter} ::-webkit-scrollbar{display:none}`}</style>

      {showAreaSetup && <div style={{position:'fixed', inset:0, background:'#0A0A0A', zIndex:200, display:'flex', flexDirection:'column', padding:20}}>
        <div style={{flex:1, display:'flex', flexDirection:'column', justifyContent:'center', maxWidth:380, margin:'0 auto', width:'100%'}}>
          {!areaConfirm ? <>
            <div style={{width:80, height:80, background:'#5EEAD4', borderRadius:24, display:'flex', alignItems:'center', justifyContent:'center', fontSize:40, margin:'0 auto'}}>📍</div>
            <h1 style={{textAlign:'center', marginTop:20, fontSize:24, fontWeight:800}}>Find your neighbourhood</h1>
            <p style={{textAlign:'center', color:'#888', fontSize:14, marginTop:8}}>We use approximate area only. Exact address is never shown.</p>
            <div style={{background:'#1E1E1E', borderRadius:16, padding:16, marginTop:24}}>
              <div style={{display:'flex', alignItems:'center', gap:12}}><span style={{fontSize:24}}>🛰️</span><div><b style={{fontSize:14}}>Location permission</b><div style={{fontSize:12, color:'#888'}}>Detect area automatically</div></div></div>
              <button onClick={allowLocation} style={{marginTop:12, width:'100%', background:locPermission==='granted'?'#1A3A3A':'#5EEAD4', color:locPermission==='granted'?'#5EEAD4':'#0A0A0A', border:'none', padding:12, borderRadius:12, fontWeight:700}}>{locPermission==='granted'?'✓ Detected':'Allow location'}</button>
            </div>
            <button onClick={()=>setAreaConfirm(true)} style={{marginTop:12, background:'transparent', border:'1px solid #2A2A2A', color:'#888', padding:12, borderRadius:12, width:'100%'}}>Skip - Select manually</button>
          </> : <>
            <h2 style={{fontSize:20, fontWeight:700}}>Confirm neighbourhood</h2>
            <p style={{fontSize:13, color:'#888', marginTop:6}}>Goal: Correct local feed. Exact address public ga chupinchakudadhu.</p>
            <div style={{marginTop:20, display:'flex', flexDirection:'column', gap:10}}>
              {cities.map(c=> <button key={c.name} onClick={()=>{setCity(c.name); setShowAreaSetup(false);}} style={{textAlign:'left', padding:'14px', borderRadius:16, border:`1px solid ${city===c.name?'#5EEAD4':'#2A2A2A'}`, background:city===c.name?'#1A3A3A':'#1E1E1E', color:'white', display:'flex', justifyContent:'space-between'}}><div><b style={{fontSize:14}}>{c.name}</b><div style={{fontSize:11, color:'#888'}}>{c.sub} · {c.pop}</div></div><span>→</span></button>)}
            </div>
            <button onClick={()=>{setCity('Madhapur'); setShowAreaSetup(false);}} style={{marginTop:20, width:'100%', background:'#5EEAD4', color:'#0A0A0A', border:'none', padding:14, borderRadius:16, fontWeight:800}}>Continue to {city} feed</button>
          </>}
        </div>
      </div>}

      <div style={{position:'sticky', top:0, zIndex:30, background:'#121212', padding:'12px 14px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid #1E1E1E'}}>
        <div style={{width:36, height:36, background:'#5EEAD4', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'#0A0A0A'}}>प</div>
        <div style={{flex:1}}><div style={{display:'flex', gap:6}}><b style={{fontSize:16}}>Padosi</b><span style={{fontSize:12, color:'#888'}}>• {city}</span></div><div style={{fontSize:11, color:'#888'}}>Your neighbourhood, connected.</div></div>
        <button onClick={()=>setShowSearch(!showSearch)} style={{width:36, height:36, background:'#1E1E1E', border:'none', borderRadius:10, color:'white'}}>🔍</button>
        <button onClick={()=>setShowNotif(!showNotif)} style={{width:36, height:36, background:'#1E1E1E', border:'none', borderRadius:10, color:'white', position:'relative'}}>🔔{alerts.length>0&&<span style={{position:'absolute', top:-4, right:-4, background:'#FF3B30', color:'white', fontSize:9, width:16, height:16, borderRadius:50, display:'flex', alignItems:'center', justifyContent:'center'}}>{alerts.length}</span>}</button>
      </div>

      <div style={{maxWidth:480, margin:'0 auto'}}>
        {showSearch && <div style={{padding:'10px 14px'}}><input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search posts, electrician, places..." style={{width:'100%', background:'#1E1E1E', border:'1px solid #2A2A2A', borderRadius:12, padding:'12px 14px', color:'white', outline:'none'}} /></div>}
        <div style={{display:'flex', gap:8, overflowX:'auto', padding:'10px 14px 6px'}}>
          {categories.map(c=>{const active=cat===c.id; return <button key={c.id} onClick={()=>setCat(c.id)} style={{display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:20, border:'none', background:active?'#5EEAD4':'#1E1E1E', color:active?'#0A0A0A':'#CCC', fontSize:13, fontWeight:600, whiteSpace:'nowrap'}}>{c.icon} {c.label}</button>})}
        </div>
        <div style={{display:'flex', gap:8, padding:'6px 14px 12px'}}>
          {['Latest','Popular'].map(s=> <button key={s} onClick={()=>setSort(s)} style={{padding:'7px 14px', borderRadius:20, border:'none', background:sort===s?'#5EEAD4':'#1E1E1E', color:sort===s?'#0A0A0A':'#AAA', fontSize:13, fontWeight:600}}>{s}</button>)}
        </div>

        <div style={{padding:'0 12px', display:'flex', flexDirection:'column', gap:12}}>
          {tab==='home' && filtered.map(p=>{
            const isAlert = p.cat==='Alert';
            return (
              <div key={p.id} style={{background:'#1C1C1C', border:`1px solid ${isAlert?'#FF3B30':'#2A2A2A'}`, borderRadius:20, padding:14}}>
                {isAlert && <div style={{background:'#FF3B30', color:'white', fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:20, display:'inline-block', marginBottom:8}}>🚨 ALERT</div>}
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div style={{display:'flex', gap:10}}><div style={{width:40, height:40, background:'#1A3A3A', borderRadius:50, display:'flex', alignItems:'center', justifyContent:'center', color:'#5EEAD4', fontWeight:700}}>{p.letter}</div><div><b style={{fontSize:14}}>{p.author}</b><div style={{fontSize:11, color:'#888'}}>{p.time} · {p.area} · {p.city}</div></div></div>
                  <button onClick={()=>setShowReportMenu(showReportMenu===p.id?null:p.id)} style={{background:'#2A2A2A', border:'none', borderRadius:10, width:32, height:32, color:'white'}}>⋯</button>
                </div>
                <div style={{marginTop:6}}><span style={{background:'#1A3A3A', color:'#5EEAD4', fontSize:11, padding:'4px 8px', borderRadius:20, fontWeight:700}}>{categories.find(c=>c.id===p.cat)?.icon} {p.cat}</span></div>
                <p style={{margin:'10px 0 0', fontSize:14, lineHeight:1.5}}>{p.text}</p>
                {p.img && <img src={p.img} alt="" style={{width:'100%', borderRadius:14, marginTop:10, maxHeight:240, objectFit:'cover'}} />}
                <div style={{display:'flex', gap:14, marginTop:12}}>
                  <button onClick={()=>toggleLike(p.id)} style={{display:'flex', gap:6, background:'none', border:'none', color:p.liked?'#5EEAD4':'#888', fontSize:13}}>{p.liked?'♥':'♡'} {p.likes}</button>
                  <button onClick={()=>{const el=document.getElementById('cbox'+p.id); el.style.display=el.style.display==='none'?'flex':'none'}} style={{background:'none', border:'none', color:'#AAA', fontSize:13}}>💬 {p.comments.length}</button>
                  <button onClick={()=>toggleSave(p.id)} style={{background:'none', border:'none', color:p.saved?'#5EEAD4':'#666', fontSize:14}}>{p.saved?'🔖':'📑'} Save</button>
                  {p.author==='You' && <button onClick={()=>deletePost(p.id)} style={{marginLeft:'auto', background:'none', border:'none', color:'#FF3B30', fontSize:12}}>Delete</button>}
                </div>
                {showReportMenu===p.id && <div style={{marginTop:10, background:'#2A2A2A', borderRadius:12, padding:8}}>
                  <div style={{fontSize:12, fontWeight:700, marginBottom:6}}>🚩 Report + Moderation</div>
                  <div style={{display:'flex', flexWrap:'wrap', gap:6}}>{reportReasons.map(r=> <button key={r} onClick={()=>reportPost(p.id,r)} style={{background:'#1E1E1E', border:'none', borderRadius:20, padding:'6px 10px', fontSize:11, color:'white'}}>{r}</button>)}</div>
                  <div style={{display:'flex', gap:6, marginTop:8}}><button onClick={()=>blockUser(p.authorId)} style={{background:'#FF3B30', color:'white', border:'none', borderRadius:20, padding:'6px 12px', fontSize:11}}>Block user</button><button onClick={()=>setShowReportMenu(null)} style={{background:'#1E1E1E', border:'none', borderRadius:20, padding:'6px 12px', fontSize:11, color:'white'}}>Cancel</button></div>
                </div>}
                <div id={'cbox'+p.id} style={{display:'none', marginTop:12, flexDirection:'column', gap:8}}>
                  {p.comments.map(c=> <div key={c.id} style={{background:'#121212', borderRadius:12, padding:'8px 10px'}}><b style={{fontSize:12}}>{c.author} • {c.time}:</b><div style={{fontSize:12, marginTop:2}}>{c.text}</div></div>)}
                  <div style={{display:'flex', gap:6}}><input id={'in'+p.id} placeholder="Reply as local..." onKeyDown={e=>{if(e.key==='Enter'){addComment(p.id,e.target.value); e.target.value='';}}} style={{flex:1, background:'#121212', border:'1px solid #2A2A2A', borderRadius:20, padding:'8px 12px', color:'white', fontSize:12, outline:'none'}} /><button onClick={()=>{const el=document.getElementById('in'+p.id); addComment(p.id,el.value); el.value='';}} style={{background:'#5EEAD4', color:'#0A0A0A', border:'none', borderRadius:20, padding:'8px 14px', fontSize:12, fontWeight:700}}>Send</button></div>
                </div>
              </div>
            );
          })}
          {tab==='discover' && <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <div style={{background:'#1C1C1C', borderRadius:16, padding:14}}><b>Nearby neighborhoods</b><div style={{marginTop:10, display:'flex', flexDirection:'column', gap:8}}>{cities.map(c=> <button key={c.name} onClick={()=>{setCity(c.name); setTab('home');}} style={{textAlign:'left', background:city===c.name?'#5EEAD4':'#121212', color:city===c.name?'#0A0A0A':'white', border:'none', padding:10, borderRadius:12}}><b>{c.name}</b> • {c.pop}</button>)}</div></div>
            <div style={{background:'#1C1C1C', borderRadius:16, padding:14}}><b>🔥 Popular</b>{discoverPosts.map(p=> <div key={p.id} style={{background:'#121212', padding:10, borderRadius:12, marginTop:8, fontSize:12}}>{p.text.slice(0,80)}</div>)}</div>
          </div>}
          {tab==='profile' && <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <div style={{background:'#1C1C1C', borderRadius:20, padding:16, textAlign:'center'}}><div style={{width:64, height:64, background:'#5EEAD4', borderRadius:50, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', color:'#0A0A0A', fontSize:24, fontWeight:800}}>A</div><b style={{display:'block', marginTop:8}}>Anesh - {city}</b><div style={{fontSize:12, color:'#888'}}>Approx area only • Exact hidden</div><div style={{display:'flex', gap:16, justifyContent:'center', marginTop:12}}><div><b>{posts.filter(p=>p.author==='You').length}</b><div style={{fontSize:11, color:'#888'}}>Posts</div></div><div><b>{posts.filter(p=>p.saved).length}</b><div style={{fontSize:11, color:'#888'}}>Saved</div></div></div></div>
            <div style={{background:'#1C1C1C', borderRadius:16, padding:14}}><b>🔐 Privacy Controls</b><div style={{marginTop:10, display:'flex', flexDirection:'column', gap:8}}><label style={{display:'flex', justifyContent:'space-between', fontSize:13}}><span>Show approx area</span><input type="checkbox" checked={privacy.approx} onChange={e=>setPrivacy({...privacy, approx:e.target.checked})} /></label><label style={{display:'flex', justifyContent:'space-between', fontSize:13}}><span>Hide profile</span><input type="checkbox" checked={privacy.hideProfile} onChange={e=>setPrivacy({...privacy, hideProfile:e.target.checked})} /></label></div><div style={{marginTop:12, display:'flex', flexDirection:'column', gap:8}}><button onClick={()=>{const ok=window.confirm('Clear blocked?'); if(ok) setBlocked([])}} style={{background:'#2A2A2A', border:'none', padding:10, borderRadius:12, color:'white', fontSize:12}}>Blocked: {blocked.length} - Clear</button><button onClick={()=>{const ok=window.confirm('Delete my posts?'); if(ok) setPosts(posts.filter(p=>p.author!=='You'))}} style={{background:'#2A2A2A', border:'none', padding:10, borderRadius:12, color:'#FF8A65', fontSize:12}}>Delete my posts</button><button onClick={()=>{const ok=window.confirm('Delete account?'); if(ok) window.alert('Deleted demo')}} style={{background:'#FF3B30', border:'none', padding:10, borderRadius:12, color:'white', fontSize:12}}>Delete account</button></div></div>
            <div style={{background:'#1C1C1C', borderRadius:16, padding:14}}><b>🔖 Saved</b>{posts.filter(p=>p.saved).length===0?<div style={{fontSize:12, color:'#888', marginTop:8}}>Save useful posts</div>: posts.filter(p=>p.saved).map(p=> <div key={p.id} style={{background:'#121212', padding:10, borderRadius:12, marginTop:8, fontSize:12}}>{p.text.slice(0,80)}</div>)}</div>
          </div>}
        </div>
      </div>

      {showPost && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:100, display:'flex', alignItems:'flex-end', justifyContent:'center'}}><div style={{background:'#1E1E1E', borderTop:'1px solid #2A2A2A', borderRadius:'24px 24px 0 0', padding:20, width:'100%', maxWidth:480}}><div style={{display:'flex', justifyContent:'space-between'}}><b>Create in {city}</b><button onClick={()=>setShowPost(false)} style={{width:32, height:32, background:'#2A2A2A', border:'none', borderRadius:50, color:'white'}}>✕</button></div><div style={{display:'flex', gap:6, overflowX:'auto', marginTop:14}}>{categories.filter(c=>c.id!=='All').map(c=> <button key={c.id} onClick={()=>setPostCat(c.id)} style={{padding:'6px 12px', borderRadius:20, border:'none', background:postCat===c.id?'#5EEAD4':'#2A2A2A', color:postCat===c.id?'#0A0A0A':'#CCC', fontSize:12, fontWeight:600, whiteSpace:'nowrap'}}>{c.icon} {c.label}</button>)}</div><textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder="Mana street lo water supply morning nundi ledu..." style={{marginTop:12, width:'100%', height:100, background:'#121212', border:'1px solid #2A2A2A', borderRadius:14, padding:12, color:'white', outline:'none', fontSize:14, resize:'none'}}/><div style={{marginTop:10}}><label style={{background:'#2A2A2A', padding:'8px 12px', borderRadius:20, fontSize:12, cursor:'pointer'}}>📸 Photo<input type="file" accept="image/*" onChange={e=> e.target.files[0]&&setPostImg(URL.createObjectURL(e.target.files[0]))} style={{display:'none'}} /></label></div>{postImg&&<img src={postImg} alt="" style={{width:'100%', borderRadius:12, marginTop:10, maxHeight:200, objectFit:'cover'}} />}<button onClick={createPost} style={{marginTop:14, width:'100%', background:'#5EEAD4', border:'none', padding:14, borderRadius:24, fontWeight:800, color:'#0A0A0A'}}>Post to {city}</button></div></div>}

      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'#121212', borderTop:'1px solid #1E1E1E', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'8px 0 14px', zIndex:50}}>
        <button onClick={()=>setTab('home')} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', color:tab==='home'?'#5EEAD4':'#666', gap:4}}><span style={{fontSize:20}}>⌂</span><span style={{fontSize:10}}>Home</span></button>
        <button onClick={()=>setTab('discover')} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', color:tab==='discover'?'#5EEAD4':'#666', gap:4}}><span style={{fontSize:18}}>🔎</span><span style={{fontSize:10}}>Discover</span></button>
        <button onClick={()=>setShowPost(true)} style={{background:'#5EEAD4', border:'none', width:56, height:56, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'#0A0A0A', marginTop:-20}}>＋</button>
        <button onClick={()=>{setTab('home'); setCat('Alert');}} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', color:cat==='Alert'?'#5EEAD4':'#666', gap:4, position:'relative'}}><span style={{fontSize:20}}>🔔</span>{alerts.length>0&&<span style={{position:'absolute', top:-2, right:6, background:'#FF3B30', width:8, height:8, borderRadius:50}}></span>}<span style={{fontSize:10}}>Alerts</span></button>
        <button onClick={()=>setTab('profile')} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', color:tab==='profile'?'#5EEAD4':'#666', gap:4}}><span style={{fontSize:18}}>👤</span><span style={{fontSize:10}}>Profile</span></button>
      </div>
    </div>
  );
                  }
