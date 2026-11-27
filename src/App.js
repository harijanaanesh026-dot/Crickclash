import { useState } from 'react';

export default function App(){
  const [dark,setDark]=useState(false);
  const [city,setCity]=useState('Renigunta');
  const [pincode,setPincode]=useState('517520');
  const [showCity,setShowCity]=useState(true);
  const [tab,setTab]=useState('home');
  const [sort,setSort]=useState('Latest');
  const [filter,setFilter]=useState('All');
  const [search,setSearch]=useState('');
  const [lang,setLang]=useState('EN');
  const [showPost,setShowPost]=useState(false);
  const [postType,setPostType]=useState('General');
  const [postText,setPostText]=useState('');
  const [postImg,setPostImg]=useState(null);
  const [blocked,setBlocked]=useState([]);
  const [reported,setReported]=useState([]);
  const [saved,setSaved]=useState([]);
  const [showNotif,setShowNotif]=useState(false);

  const L = {
    EN:{home:'Home', discover:'Discover', alerts:'Alerts', profile:'Profile', what:'What happened?', post:'Post'},
    TE:{home:'హోమ్', discover:'అన్వేషణ', alerts:'అలర్ట్స్', profile:'ప్రొఫైల్', what:'ఏమి జరిగింది?', post:'పోస్ట్'},
    HI:{home:'होम', discover:'खोजें', alerts:'अलर्ट', profile:'प्रोफाइल', what:'क्या हुआ?', post:'पोस्ट'}
  }[lang];

  const localities = [
    {name:'Renigunta', pin:'517520', dist:'0.3km'},
    {name:'Tiruchanoor', pin:'517503', dist:'2.1km'},
    {name:'Tirupati West', pin:'517502', dist:'4.5km'},
    {name:'Chandragiri', pin:'517101', dist:'8km'},
    {name:'Akkarampalle', pin:'517507', dist:'1.2km'},
  ];

  const [posts,setPosts]=useState([
    {id:1, city:'Renigunta', pin:'517520', cat:'Help', type:'Help', icon:'❓', author:'Suresh K', area:'RTC Colony ~0.4km', time:'10m ago', text:'నా bike start అవ్వడం లేదు. Nearby mechanic ఎవరికైనా తెలుసా?', img:null, likes:3, liked:false, comments:[{id:1, author:'Ravi', text:'Nenu 0.5km lo unna', replies:[]}], alert:false, price:null},
    {id:2, city:'Renigunta', pin:'517520', cat:'Alert', type:'Alert', icon:'🚨', author:'Lakshmi', area:'Renigunta Rd ~0.8km', time:'45m ago', text:'Tomorrow water supply 2hrs late due to repair. 10AM-12PM no water.', img:null, likes:12, liked:false, comments:[], alert:true, price:null},
    {id:3, city:'Renigunta', pin:'517520', cat:'Buy/Sell', type:'Buy/Sell', icon:'🛒', author:'Kiran', area:'Station ~0.5km', time:'2h ago', text:'DBMS Textbook for sale - Good condition.', img:'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', likes:5, liked:false, comments:[], alert:false, price:250},
    {id:4, city:'Tiruchanoor', pin:'517503', cat:'Lost & Found', type:'Lost & Found', icon:'🐾', author:'Anesh', area:'Temple ~0.3km', time:'3h ago', text:'Lost white puppy "Lucky" near temple. Contact via Sthalam.', img:'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', likes:21, liked:false, comments:[], alert:false, price:null},
    {id:5, city:'Renigunta', pin:'517520', cat:'General', type:'General', icon:'📝', author:'Municipal', area:'Central ~0.3km', time:'5h ago', text:'Road blockage near main road due to drainage work.', img:null, likes:32, liked:false, comments:[], alert:true, price:null},
  ]);

  const [services,setServices]=useState([
    {id:1, name:'Lakshmi Tiffin', cat:'Food', rating:4.7, rec:124, area:'0.4km', img:'🍛', open:'Open till 10PM'},
    {id:2, name:'Balaji Electricals', cat:'Electrician', rating:4.9, rec:89, area:'0.2km', img:'🔧', open:'Available now'},
    {id:3, name:'Ravi Plumber', cat:'Plumber', rating:4.5, rec:56, area:'0.6km', img:'🚿', open:'Call anytime'},
    {id:4, name:'MedPlus', cat:'Medical', rating:4.8, rec:203, area:'0.3km', img:'💊', open:'24hrs'},
  ]);

  const [events,setEvents]=useState([
    {id:1, title:'Colony Cleaning Drive', date:'Nov 30', time:'7 AM', area:'RTC Colony', going:24, joined:false, desc:'Clean our street'},
    {id:2, title:'Cricket Tournament', date:'Dec 2', time:'4 PM', area:'College Ground', going:45, joined:false, desc:'Inter-street cricket'},
  ]);

  const filtered = posts.filter(p=> !blocked.includes(p.author) && (city==='All'?true:p.city===city) && (filter==='All'||p.cat===filter) && (search===''|| p.text.toLowerCase().includes(search.toLowerCase()))).sort((a,b)=> sort==='Popular'? (b.likes+b.comments.length*2)-(a.likes+a.comments.length*2): b.id-a.id);
  const alerts = posts.filter(p=> p.alert && p.city===city);
  const addPost = ()=>{
    if(!postText.trim()) return;
    const icons={General:'📝',Help:'❓',Alert:'🚨','Lost & Found':'🐾','Buy/Sell':'🛒',Events:'📅',Jobs:'💼'};
    setPosts([{id:Date.now(), city, pin:pincode, cat:postType, type:postType, icon:icons[postType], author:'You', area:city+' ~0.1km', time:'Just now', text:postText, img:postImg, likes:0, liked:false, comments:[], alert:postType==='Alert', price:postType==='Buy/Sell'?500:null},...posts]);
    setPostText(''); setPostImg(null); setShowPost(false); setTab('home');
  };
  const toggleLike = id=> setPosts(posts.map(p=> p.id===id? {...p, likes:p.liked?p.likes-1:p.likes+1, liked:!p.liked}:p));
  const toggleSave = id=> setSaved(saved.includes(id)? saved.filter(x=>x!==id):[...saved,id]);
  const addComment = (pid,text)=>{ if(!text.trim()) return; setPosts(posts.map(p=> p.id===pid? {...p, comments:[...p.comments,{id:Date.now(), author:'You', text, replies:[]}]}:p)); };
  const bg = dark? '#0a0a0a':'#FFFBF6';
  const card = dark? '#181818':'#FFFFFF';
  const border = dark? '#232323':'#F0E6D8';
  const text = dark? 'white':'#1A1A1A';
  const sub = dark? '#888':'#8A7A6A';

  return (
    <div style={{minHeight:'100vh', background:bg, color:text, fontFamily:'Inter, system-ui', paddingBottom:72}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800&display=swap'); *{font-family:Inter} ::-webkit-scrollbar{display:none}`}</style>
      <div style={{position:'sticky', top:0, zIndex:30, background:card, borderBottom:`1px solid ${border}`, padding:'12px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <div style={{width:36, height:36, background:'#0E7A5E', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, color:'white'}}>S</div>
          <div><div style={{fontWeight:800, fontSize:16}}>Sthalam</div><div style={{fontSize:10, color:sub}}>{city} • {pincode} <button onClick={()=>setShowCity(true)} style={{color:'#0E7A5E', background:'none', border:'none', fontSize:10, fontWeight:700}}>Change</button></div></div>
        </div>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <select value={lang} onChange={e=>setLang(e.target.value)} style={{background:dark?'#222':'#F5EFE6', border:`1px solid ${border}`, borderRadius:20, padding:'4px 8px', fontSize:11, color:text}}><option>EN</option><option>TE</option><option>HI</option></select>
          <button onClick={()=>setDark(!dark)} style={{width:32, height:32, background:dark?'#222':'#F5EFE6', border:'none', borderRadius:50}}>{dark?'☀️':'🌙'}</button>
          <button onClick={()=>setShowNotif(!showNotif)} style={{position:'relative', width:32, height:32, background:dark?'#222':'#F5EFE6', border:'none', borderRadius:50}}>🔔{alerts.length>0&&<span style={{position:'absolute', top:-4, right:-4, background:'#FF3B30', color:'white', fontSize:9, width:16, height:16, borderRadius:50, display:'flex', alignItems:'center', justifyContent:'center'}}>{alerts.length}</span>}</button>
        </div>
      </div>

      {showNotif && <div style={{position:'fixed', top:56, right:12, width:300, background:card, border:`1px solid ${border}`, borderRadius:16, zIndex:40}}><div style={{padding:12, display:'flex', justifyContent:'space-between', borderBottom:`1px solid ${border}`}}><b style={{fontSize:13}}>Notifications</b><button onClick={()=>setShowNotif(false)} style={{background:'none', border:'none'}}>✕</button></div>{alerts.map(a=> <div key={a.id} style={{padding:12, fontSize:12, borderBottom:`1px solid ${border}`}}>🚨 {a.text.slice(0,50)}</div>)}</div>}

      <div style={{maxWidth:640, margin:'0 auto', padding:12}}>
        <div style={{display:'flex', gap:8, marginBottom:12}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search posts, pincode..." style={{flex:1, background:card, border:`1px solid ${border}`, borderRadius:24, padding:'10px 16px', fontSize:13, color:text, outline:'none'}} /><select value={sort} onChange={e=>setSort(e.target.value)} style={{background:card, border:`1px solid ${border}`, borderRadius:20, padding:'8px 12px', fontSize:12, color:text}}><option>Latest</option><option>Popular</option></select></div>
        {tab!=='profile' && <div style={{display:'flex', gap:6, overflowX:'auto', marginBottom:12}}>{['All','General','Help','Alert','Lost & Found','Buy/Sell','Events','Jobs'].map(f=> <button key={f} onClick={()=>setFilter(f)} style={{padding:'7px 14px', borderRadius:20, border:`1px solid ${filter===f?'#0E7A5E':border}`, background:filter===f?'#0E7A5E':'transparent', color:filter===f?'white':sub, fontSize:12, whiteSpace:'nowrap', fontWeight:600}}>{f}</button>)}</div>}
        {tab==='home' && <div style={{background:dark?'#0E2A22':'#E8F5E9', borderRadius:12, padding:'8px 12px', marginBottom:12}}><span style={{fontSize:11, color:'#0E7A5E'}}>🔒 Your exact home is never shown - only approx area</span></div>}

        {(tab==='home'||tab==='alerts') && (tab==='alerts'? alerts:filtered).map(p=> (
          <div key={p.id} style={{background:card, border:`1px solid ${p.alert?'#FF3B30':border}`, borderRadius:20, padding:14, marginBottom:12}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><div style={{display:'flex', gap:8}}><div style={{width:36, height:36, background:dark?'#222':'#F0E6D8', borderRadius:50, display:'flex', alignItems:'center', justifyContent:'center'}}>👤</div><div><b style={{fontSize:13}}>{p.author} {p.author!=='You'&&<span style={{fontSize:10, background:'#0E7A5E', color:'white', padding:'1px 5px', borderRadius:10}}>✓</span>}</b><div style={{fontSize:10, color:sub}}>{p.area} • {p.time} • {p.icon} {p.cat}</div></div></div><button onClick={()=>{const el=document.getElementById('mm'+p.id); el.style.display=el.style.display==='block'?'none':'block'}} style={{background:dark?'#222':'#F5EFE6', border:'none', borderRadius:10, width:28, height:28}}>⋯</button></div>
            <p style={{margin:'10px 0', fontSize:14, lineHeight:1.5}}>{p.text}</p>
            {p.price!==null && <div style={{background:'#E8F5E9', borderRadius:12, padding:'8px 12px', marginBottom:8}}><b style={{color:'#0E7A5E'}}>₹{p.price}</b></div>}
            {p.img && <img src={p.img} alt="" style={{width:'100%', borderRadius:14, maxHeight:280, objectFit:'cover', marginBottom:8}} />}
            <div style={{display:'flex', gap:12, marginTop:6}}><button onClick={()=>toggleLike(p.id)} style={{background:dark?'#222':'#F5F0E8', border:'none', borderRadius:20, padding:'6px 12px', fontSize:12, color:p.liked?'#0E7A5E':sub}}>{p.liked?'❤️':'🤍'} {p.likes}</button><span style={{fontSize:12, color:sub}}>💬 {p.comments.length}</span><button onClick={()=>toggleSave(p.id)} style={{fontSize:12, color:saved.includes(p.id)?'#0E7A5E':sub, background:'none', border:'none'}}>{saved.includes(p.id)?'★ Saved':'☆ Save'}</button></div>
            <div style={{marginTop:10}}><div style={{display:'flex', gap:6}}><input id={'c'+p.id} placeholder="Write comment..." onKeyDown={e=>{if(e.key==='Enter'){addComment(p.id, e.target.value); e.target.value='';}}} style={{flex:1, background:dark?'#222':'#F5EFE6', border:'none', borderRadius:20, padding:'8px 14px', fontSize:12, color:text, outline:'none'}} /><button onClick={()=>{const el=document.getElementById('c'+p.id); addComment(p.id, el.value); el.value='';}} style={{background:'#0E7A5E', color:'white', border:'none', borderRadius:20, padding:'8px 14px', fontSize:12}}>Send</button></div>{p.comments.map(c=> <div key={c.id} style={{background:dark?'#121212':'#FFF6EB', borderRadius:12, padding:'8px 10px', marginTop:6, fontSize:12}}><b>{c.author}</b> {c.text}</div>)}</div>
          </div>
        ))}

        {tab==='discover' && <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <div><b>🏘️ Nearby Communities</b><div style={{display:'flex', gap:8, overflowX:'auto', marginTop:8}}>{localities.map(l=> <button key={l.name} onClick={()=>{setCity(l.name); setPincode(l.pin); setTab('home')}} style={{minWidth:120, background:city===l.name?'#0E7A5E':card, color:city===l.name?'white':text, border:`1px solid ${border}`, borderRadius:14, padding:'10px 12px', textAlign:'left'}}><div style={{fontSize:13, fontWeight:700}}>{l.name}</div><div style={{fontSize:10, color:city===l.name?'#C8E6C9':sub}}>{l.pin} • {l.dist}</div></button>)}</div></div>
          <div><b>🔧 Nearby Services</b><div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:8}}>{services.map(s=> <div key={s.id} style={{background:card, border:`1px solid ${border}`, borderRadius:16, padding:12}}><div style={{display:'flex', justifyContent:'space-between'}}><span style={{fontSize:20}}>{s.img}</span><span style={{fontSize:10, background:'#E8F5E9', color:'#0E7A5E', padding:'2px 6px', borderRadius:10}}>★ {s.rating}</span></div><b style={{fontSize:13, marginTop:6, display:'block'}}>{s.name}</b><div style={{fontSize:11, color:sub}}>{s.cat} • {s.area}</div><button onClick={()=>setServices(services.map(x=> x.id===s.id? {...x, rec:x.rec+1}:x))} style={{marginTop:8, width:'100%', background:dark?'#222':'#F5EFE6', border:'none', borderRadius:20, padding:'6px', fontSize:11}}>👍 {s.rec}</button></div>)}</div></div>
          <div><b>📅 Events</b><div style={{display:'flex', flexDirection:'column', gap:8, marginTop:8}}>{events.map(ev=> <div key={ev.id} style={{background:card, border:`1px solid ${border}`, borderRadius:16, padding:12, display:'flex', gap:12}}><div style={{width:50, height:50, background:'#0E7A5E', borderRadius:12, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'white'}}><span style={{fontSize:10}}>{ev.date.split(' ')[0]}</span><span style={{fontWeight:800}}>{ev.date.split(' ')[1]}</span></div><div style={{flex:1}}><b style={{fontSize:13}}>{ev.title}</b><div style={{fontSize:11, color:sub}}>{ev.time} • {ev.area}</div></div><button onClick={()=>setEvents(events.map(x=> x.id===ev.id? {...x, joined:!x.joined, going:x.joined?x.going-1:x.going+1}:x))} style={{background:ev.joined?'#0E7A5E':'white', color:ev.joined?'white':'#0E7A5E', border:'1px solid #0E7A5E', borderRadius:20, padding:'6px 12px', fontSize:11}}>{ev.joined?'Joined':'Join'}</button></div>)}</div></div>
        </div>}

        {tab==='profile' && <div style={{display:'flex', flexDirection:'column', gap:12}}><div style={{background:card, border:`1px solid ${border}`, borderRadius:20, padding:16, textAlign:'center'}}><div style={{width:64, height:64, background:'#0E7A5E', borderRadius:50, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, color:'white'}}>A</div><b style={{display:'block', marginTop:8}}>Anesh - {city}</b><div style={{fontSize:12, color:sub}}>{pincode}</div><div style={{display:'flex', gap:16, justifyContent:'center', marginTop:12}}><div><b>{posts.filter(x=>x.author==='You').length}</b><div style={{fontSize:11, color:sub}}>Posts</div></div><div><b>{saved.length}</b><div style={{fontSize:11, color:sub}}>Saved</div></div></div></div><div style={{background:card, border:`1px solid ${border}`, borderRadius:16, padding:14}}><b>🛡️ Safety</b><div style={{fontSize:12, color:sub}}>Blocked: {blocked.length} • Reported: {reported.length}</div>{blocked.map(b=> <div key={b} style={{display:'flex', justifyContent:'space-between', marginTop:8, fontSize:12}}><span>{b}</span><button onClick={()=>setBlocked(blocked.filter(x=>x!==b))} style={{color:'#0E7A5E', background:'none', border:'none'}}>Unblock</button></div>)}</div></div>}
      </div>

      {showCity && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16}}><div style={{background:card, borderRadius:20, padding:20, width:'100%', maxWidth:360}}><b>📍 Select locality</b><div style={{marginTop:12, display:'flex', flexDirection:'column', gap:6}}>{localities.map(l=> <button key={l.name} onClick={()=>{setCity(l.name); setPincode(l.pin); setShowCity(false)}} style={{padding:'10px 14px', borderRadius:14, border:`1px solid ${city===l.name?'#0E7A5E':border}`, background:city===l.name?'#0E7A5E':'transparent', color:city===l.name?'white':text}}>{l.name} - {l.pin}</button>)}</div><button onClick={()=>setShowCity(false)} style={{marginTop:12, width:'100%', background:dark?'#222':'#F5EFE6', border:'none', padding:10, borderRadius:20, color:text}}>Continue</button></div></div>}

      {showPost && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:100, display:'flex', alignItems:'flex-end', justifyContent:'center'}}><div style={{background:card, borderRadius:'24px 24px 0 0', padding:20, width:'100%', maxWidth:640}}><div style={{display:'flex', justifyContent:'space-between'}}><b>Create Post in {city}</b><button onClick={()=>setShowPost(false)} style={{background:dark?'#222':'#F5EFE6', border:'none', width:32, height:32, borderRadius:50}}>✕</button></div><div style={{display:'flex', gap:6, overflowX:'auto', marginTop:12}}>{['General','Help','Alert','Lost & Found','Buy/Sell','Events','Jobs'].map(t=> <button key={t} onClick={()=>setPostType(t)} style={{padding:'6px 14px', borderRadius:20, border:'none', background:postType===t?'#0E7A5E':'#eee', color:postType===t?'white':text, fontSize:12}}>{t}</button>)}</div><textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder="What happened? Water stopped? Need electrician?" style={{marginTop:12, width:'100%', height:90, background:dark?'#222':'#F5F0E8', border:'none', borderRadius:14, padding:12, color:text, outline:'none'}}/><div style={{marginTop:10}}><label style={{background:dark?'#222':'#F5EFE6', padding:'8px 12px', borderRadius:20, fontSize:12, cursor:'pointer'}}>📸 Add Image<input type="file" accept="image/*" onChange={e=> e.target.files[0]&&setPostImg(URL.createObjectURL(e.target.files[0]))} style={{display:'none'}} /></label></div>{postImg&&<img src={postImg} alt="" style={{width:'100%', borderRadius:12, marginTop:8, maxHeight:200, objectFit:'cover'}} />}<button onClick={addPost} style={{marginTop:14, width:'100%', background:'#0E7A5E', border:'none', padding:12, borderRadius:24, fontWeight:700, color:'white'}}>Post to {city}</button></div></div>}

      <div style={{position:'fixed', bottom:0, left:0, right:0, background:card, borderTop:`1px solid ${border}`, display:'flex', justifyContent:'space-around', padding:'6px 0', zIndex:40}}>
        {[{id:'home', icon:'🏠', label:'Home'},{id:'discover', icon:'🔍', label:'Discover'},{id:'create', icon:'➕'},{id:'alerts', icon:'🚨', label:'Alerts'},{id:'profile', icon:'👤', label:'Profile'}].map(b=> b.id==='create'? <button key={b.id} onClick={()=>setShowPost(true)} style={{background:'#0E7A5E', border:'none', width:48, height:48, borderRadius:50, color:'white', fontSize:20, marginTop:-12}}>＋</button> : <button key={b.id} onClick={()=>setTab(b.id)} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', color:tab===b.id?'#0E7A5E':sub}}><span style={{fontSize:18}}>{b.icon}</span><span style={{fontSize:10}}>{b.label}</span></button>)}
      </div>
    </div>
  );
      }
