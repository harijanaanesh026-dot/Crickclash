import { useState } from 'react';

export default function App() {
  const [city, setCity] = useState('Tirupati');
  const [showCity, setShowCity] = useState(true);
  const [tab, setTab] = useState('home');
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showPost, setShowPost] = useState(false);
  const [postType, setPostType] = useState('General');
  const [postText, setPostText] = useState('');
  const [postImg, setPostImg] = useState(null);
  const [blocked, setBlocked] = useState([]);
  const [reported, setReported] = useState([]);
  const [posts, setPosts] = useState([
    {id:1, city:'Tirupati', type:'Question', icon:'❓', cat:'Help', author:'Suresh K', area:'Tiruchanoor', dist:0.4, text:'నా bike start అవ్వడం లేదు. Nearby mechanic ఎవరికైనా తెలుసా?', img:null, likes:3, liked:false, time:'10m ago', comments:[{id:101, author:'Ravi', text:'Nenu 0.5km lo unna anna', replies:[{author:'Suresh', text:'Thanks'}]}]},
    {id:2, city:'Tirupati', type:'Local Update', icon:'📢', cat:'General', author:'Lakshmi', area:'Renigunta Road', dist:0.8, text:'Tomorrow water supply 2hrs late due to repair work.', img:'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400', likes:12, liked:false, time:'45m ago', comments:[]},
    {id:3, city:'Renigunta', type:'Alert', icon:'🚨', cat:'Alert', author:'Municipal', area:'Renigunta', dist:0.3, text:'Heavy rain alert today evening - be safe.', img:null, likes:32, liked:false, time:'3h ago', comments:[{id:102, author:'Anesh', text:'Thanks for info'}]},
    {id:4, city:'Tirupati', type:'Recommendation', icon:'💡', cat:'Recommendation', author:'Arjun', area:'K.T Road', dist:1.2, text:'Best dosa near station - Lakshmi Tiffin center, try cheyandi!', img:null, likes:9, liked:false, time:'2h ago', comments:[]},
    {id:5, city:'Renigunta', type:'Event', icon:'📅', cat:'Event', author:'College', area:'Renigunta', dist:0.6, text:'College fest Dec 5th - All students invited!', img:null, likes:20, liked:false, time:'5h ago', comments:[]},
  ]);

  const filtered = posts.filter(p => !blocked.includes(p.author) && p.city === city && (filter==='All'||p.cat===filter||p.type===filter) && (search===''||p.text.toLowerCase().includes(search.toLowerCase()))).sort((a,b)=> tab==='trending' ? (b.likes*2+b.comments.length*1.5)-(a.likes*2+a.comments.length*1.5) : 0);

  const addPost = () => {
    if(!postText.trim()) return;
    const icons = {General:'📝', Help:'❓', Alert:'🚨', Event:'📅', Recommendation:'💡'};
    setPosts([{id:Date.now(), city, type:postType==='Help'?'Question':postType==='Alert'?'Alert':postType==='Event'?'Event':postType==='Recommendation'?'Recommendation':'Local Update', icon:icons[postType], cat:postType, author:'You', area:city, dist:0.1, text:postText, img:postImg, likes:0, liked:false, time:'Just now', comments:[]}, ...posts]);
    setPostText(''); setPostImg(null); setShowPost(false); setTab('home');
  };

  const toggleLike = (id) => setPosts(posts.map(p=> p.id===id? {...p, likes:p.liked? p.likes-1:p.likes+1, liked:!p.liked}:p));
  const addComment = (postId, text, replyTo=null) => {
    if(!text.trim()) return;
    setPosts(posts.map(p=>{
      if(p.id!==postId) return p;
      if(replyTo===null) return {...p, comments:[...p.comments, {id:Date.now(), author:'You', text, replies:[]}]};
      return {...p, comments:p.comments.map(c=> c.id===replyTo? {...c, replies:[...(c.replies||[]), {author:'You', text}]}:c)};
    }));
  };

  return (
    <div style={{minHeight:'100vh', background:'#0a0a0a', color:'white', fontFamily:'system-ui', paddingBottom:'70px'}}>
      <div style={{position:'sticky', top:0, zIndex:20, background:'#121212', borderBottom:'1px solid #232323', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}><div style={{width:32, height:32, background:'#00CC99', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'900', color:'black'}}>n</div><div><div style={{fontWeight:800, fontSize:15}}>ManaArea</div><div style={{fontSize:11, color:'#888'}}>{city} <button onClick={()=>setShowCity(true)} style={{color:'#00CC99', background:'none', border:'none', fontSize:11}}>Change</button></div></div></div>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" style={{width:110, background:'#1e1e1e', border:'1px solid #333', borderRadius:20, padding:'6px 12px', color:'white', fontSize:12, outline:'none'}} />
      </div>

      <div style={{maxWidth:600, margin:'0 auto', padding:'12px'}}>
        {tab!=='profile' && <div style={{display:'flex', gap:6, overflowX:'auto', marginBottom:12}}>{['All','General','Help','Alert','Event','Recommendation'].map(f=> <button key={f} onClick={()=>setFilter(f)} style={{padding:'6px 14px', borderRadius:20, border:'none', background:filter===f?'white':'#1e1e1e', color:filter===f?'black':'#aaa', fontSize:12, whiteSpace:'nowrap'}}>{f}</button>)}</div>}

        {(tab==='home'||tab==='trending') && filtered.map(p=> (
          <div key={p.id} style={{background:'#181818', border:'1px solid #232323', borderRadius:16, padding:14, marginBottom:12}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><div><b style={{fontSize:13}}>{p.author}</b><span style={{fontSize:11, color:'#888'}}> • {p.area} • {p.dist}km • {p.time}</span><div style={{fontSize:11, color:'#00CC99'}}>{p.icon} {p.type} • {p.cat}</div></div><div style={{position:'relative'}}><button onClick={()=>{const m=document.getElementById('m'+p.id); m.style.display=m.style.display==='block'?'none':'block'}} style={{background:'#222', border:'none', color:'white', borderRadius:10, padding:'4px 8px'}}>...</button><div id={'m'+p.id} style={{display:'none', position:'absolute', right:0, top:28, background:'#222', border:'1px solid #333', borderRadius:12, width:150, zIndex:10}}><button onClick={()=>{setReported([...reported,p.id]); document.getElementById('m'+p.id).style.display='none'}} style={{width:'100%', textAlign:'left', padding:'8px 12px', background:'none', border:'none', color:'white', fontSize:12}}>Report post</button><button onClick={()=>{setBlocked([...blocked,p.author]); document.getElementById('m'+p.id).style.display='none'}} style={{width:'100%', textAlign:'left', padding:'8px 12px', background:'none', border:'none', color:'white', fontSize:12}}>Block {p.author}</button></div></div></div>
            <p style={{margin:'10px 0', fontSize:14, lineHeight:1.4}}>{p.text}</p>
            {p.img && <img src={p.img} alt="" style={{width:'100%', borderRadius:12, marginBottom:8, maxHeight:300, objectFit:'cover'}} />}
            <div style={{display:'flex', gap:8}}><button onClick={()=>toggleLike(p.id)} style={{background:p.liked?'#00CC99':'#222', color:p.liked?'black':'white', border:'none', padding:'6px 12px', borderRadius:20, fontSize:12}}>{p.liked?'❤️':'🤍'} {p.likes}</button><span style={{fontSize:12, color:'#888', padding:'6px'}}>💬 {p.comments.length}</span>{tab==='trending'&&<span style={{fontSize:12, color:'#ff6b00'}}>🔥 Trending</span>}</div>
            <div style={{marginTop:10}}>{p.comments.map(c=> <div key={c.id} style={{background:'#121212', borderRadius:10, padding:'8px 10px', marginTop:6}}><div style={{display:'flex', justifyContent:'space-between'}}><b style={{fontSize:12}}>{c.author}</b><button onClick={()=>{const t=prompt('Reply to '+c.author); if(t) addComment(p.id,t,c.id)}} style={{fontSize:10, background:'none', border:'none', color:'#00CC99'}}>Reply</button></div><div style={{fontSize:12, marginTop:2}}>{c.text}</div>{c.replies?.map((r,i)=><div key={i} style={{marginLeft:12, marginTop:6, borderLeft:'2px solid #333', paddingLeft:8}}><b style={{fontSize:11}}>{r.author}:</b><span style={{fontSize:11}}> {r.text}</span></div>)}</div>)}<input placeholder="Write comment..." onKeyDown={e=>{if(e.key==='Enter'){addComment(p.id, e.target.value); e.target.value='';}}} style={{width:'100%', marginTop:8, background:'#222', border:'none', borderRadius:20, padding:'8px 12px', color:'white', fontSize:12, outline:'none'}} /></div>
          </div>
        ))}

        {tab==='profile' && <div style={{display:'flex', flexDirection:'column', gap:12}}>
          <div style={{background:'#181818', border:'1px solid #232323', borderRadius:16, padding:16}}><b>My Profile</b><div style={{fontSize:12, color:'#888', marginTop:6}}>City: {city} • Posts: {posts.filter(x=>x.author==='You').length}</div><button onClick={()=>setShowCity(true)} style={{marginTop:10, background:'#222', border:'none', color:'white', padding:'8px 14px', borderRadius:20, fontSize:12}}>Change City/Area</button></div>
          <div style={{background:'#181818', border:'1px solid #232323', borderRadius:16, padding:16}}><b style={{fontSize:14}}>🛡️ Admin - Reported ({reported.length})</b>{reported.length===0?<div style={{fontSize:12, color:'#666', marginTop:6}}>No reports</div>:reported.map(id=>{const rp=posts.find(x=>x.id===id); return rp&&<div key={id} style={{display:'flex', justifyContent:'space-between', marginTop:8, background:'#121212', padding:8, borderRadius:10}}><span style={{fontSize:12}}>{rp.author}: {rp.text.slice(0,30)}...</span><div><button onClick={()=>setPosts(posts.filter(x=>x.id!==id))} style={{background:'#ff4444', border:'none', color:'white', padding:'4px 8px', borderRadius:10, fontSize:10, marginRight:4}}>Remove</button><button onClick={()=>setReported(reported.filter(x=>x!==id))} style={{background:'#333', border:'none', color:'white', padding:'4px 8px', borderRadius:10, fontSize:10}}>Ignore</button></div></div>})}</div>
          <div style={{background:'#181818', border:'1px solid #232323', borderRadius:16, padding:16}}><b style={{fontSize:14}}>Blocked Users ({blocked.length})</b>{blocked.map(b=> <div key={b} style={{display:'flex', justifyContent:'space-between', marginTop:8}}><span style={{fontSize:12}}>{b}</span><button onClick={()=>setBlocked(blocked.filter(x=>x!==b))} style={{background:'none', border:'none', color:'#00CC99', fontSize:12}}>Unblock</button></div>)}</div>
        </div>}
      </div>

      {showCity && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16}}><div style={{background:'#181818', border:'1px solid #333', borderRadius:20, padding:20, width:'100%', maxWidth:320}}><b>📍 Select your area</b><p style={{fontSize:11, color:'#888', marginTop:4}}>Same area users community lo untaru. Exact house hide.</p><div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:14}}>{['Tirupati','Renigunta','Tiruchanoor','Chandragiri','Hyderabad','Bangalore'].map(c=> <button key={c} onClick={()=>{setCity(c); setShowCity(false)}} style={{padding:10, borderRadius:20, border:'none', background:city===c?'#00CC99':'#222', color:city===c?'black':'white', fontSize:13}}>{c}</button>)}</div><button onClick={()=>setShowCity(false)} style={{marginTop:12, width:'100%', background:'#222', border:'none', padding:10, borderRadius:20, color:'white'}}>Close</button></div></div>}

      {showPost && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:100, display:'flex', alignItems:'flex-end', justifyContent:'center'}}><div style={{background:'#181818', borderTop:'1px solid #333', borderRadius:'20px 20px 0 0', padding:20, width:'100%', maxWidth:600}}><div style={{display:'flex', justifyContent:'space-between'}}><b>Create Post</b><button onClick={()=>setShowPost(false)} style={{background:'none', border:'none', color:'white'}}>✕</button></div><div style={{display:'flex', gap:6, marginTop:12, overflowX:'auto'}}>{['General','Help','Alert','Event','Recommendation'].map(t=> <button key={t} onClick={()=>setPostType(t)} style={{padding:'6px 12px', borderRadius:20, border:'none', background:postType===t?'white':'#222', color:postType===t?'black':'white', fontSize:12, whiteSpace:'nowrap'}}>{t}</button>)}</div><textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder="What happened? Me area lo em jarigindi?" style={{marginTop:12, width:'100%', height:90, background:'#222', border:'none', borderRadius:12, padding:12, color:'white', outline:'none'}}/><input type="file" accept="image/*" onChange={e=>{if(e.target.files[0]) setPostImg(URL.createObjectURL(e.target.files[0]))}} style={{marginTop:10, fontSize:12}} />{postImg&&<img src={postImg} alt="" style={{width:'100%', borderRadius:12, marginTop:8, maxHeight:200, objectFit:'cover'}} />}<button onClick={addPost} style={{marginTop:12, width:'100%', background:'#00CC99', border:'none', padding:12, borderRadius:20, fontWeight:700, color:'black'}}>Post to {city}</button><p style={{fontSize:10, color:'#666', textAlign:'center', marginTop:8}}>Exact house/location publicly చూపించకూడదు</p></div></div>}

      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'#121212', borderTop:'1px solid #232323', display:'flex', justifyContent:'space-around', padding:'8px 0', zIndex:30}}>
        {[{id:'home', i:'🏠', l:'Home'},{id:'trending', i:'🔥', l:'Trending'},{id:'post', i:'➕', l:'Post'},{id:'profile', i:'👤', l:'Profile'}].map(b=> <button key={b.id} onClick={()=> b.id==='post'? setShowPost(true):setTab(b.id)} style={{background:'none', border:'none', color:tab===b.id|| (b.id==='post'&&showPost)?'#00CC99':'#888', display:'flex', flexDirection:'column', alignItems:'center', fontSize:11}}><span style={{fontSize:20}}>{b.i}</span>{b.l}</button>)}
      </div>
    </div>
  );
                  }
