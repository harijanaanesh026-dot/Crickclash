import { useState, useEffect } from 'react';

export default function App(){
  const [city,setCity]=useState('Madhapur, Hyderabad');
  const [street,setStreet]=useState('Detecting your block...');
  const [loc,setLoc]=useState(null);
  const [showLoc,setShowLoc]=useState(true);
  const [cat,setCat]=useState('All');
  const [showPost,setShowPost]=useState(false);
  const [postCat,setPostCat]=useState('General');
  const [postText,setPostText]=useState('');
  const [neighborhood,setNeighborhood]=useState('Madhapur Hills');

  const categories = [
    {id:'All', label:'All posts', icon:'🏠'},
    {id:'General', label:'General', icon:'💬'},
    {id:'Safety', label:'Safety & Crime', icon:'🚨'},
    {id:'For Sale', label:'For Sale & Free', icon:'🛒'},
    {id:'Recommendation', label:'Recommendations', icon:'⭐'},
    {id:'Lost & Found', label:'Lost & Found', icon:'🔎'},
    {id:'Events', label:'Events', icon:'📅'},
  ];

  const [posts,setPosts]=useState([
    {id:1, author:'Jennifer M.', avatar:'J', street:'12th Avenue', verified:true, time:'27m ago', cat:'General', title:'', text:'Hi neighbors! Just moved to the block. Any good coffee spots nearby?', likes:8, comments:[{author:'David', text:'Welcome! Try Blue Bottle on Main'}], neighborhood:'Madhapur Hills', city:'Madhapur'},
    {id:2, author:'Mark R.', avatar:'M', street:'Oak Street', verified:true, time:'1h ago', cat:'Safety', title:'Package theft alert', text:'Heads up - packages stolen from porches on Oak St this morning around 10am. Camera footage shows white sedan.', likes:24, comments:[], neighborhood:'Madhapur Hills', urgent:true, city:'Madhapur'},
    {id:3, author:'Sarah K.', avatar:'S', street:'Maple Ave', verified:true, time:'3h ago', cat:'Recommendation', title:'Need electrician?', text:'Anyone know a good electrician nearby? Fan wiring issue, need someone today. Recommendations appreciated!', likes:3, comments:[{author:'Rahul', text:'Kumar Electricals - (555) 010-1234 - great work, fair price'}], neighborhood:'Madhapur Hills', city:'Madhapur'},
    {id:4, author:'Robert A.', avatar:'R', street:'Pine Road', verified:true, time:'5h ago', cat:'For Sale', title:'Selling patio furniture - $150', text:'Moving - selling patio set, good condition. Pickup only. DM if interested. Photos in comments.', likes:6, comments:[], neighborhood:'Madhapur Hills', price:'$150', city:'Madhapur'},
    {id:5, author:'Lisa P.', avatar:'L', street:'Elm Street', verified:true, time:'Yesterday', cat:'Lost & Found', title:'Found dog near park', text:'Found small brown dog near Community Park, no collar. Very friendly. Contact me if yours.', likes:12, comments:[], neighborhood:'Madhapur Hills', city:'Madhapur'},
    {id:6, author:'Anesh', avatar:'A', street:'Renigunta Road', verified:true, time:'2h ago', cat:'Safety', title:'Water supply issue', text:'Mana street lo water supply morning nundi ledu. Evaraina update telusa?', likes:2, comments:[], neighborhood:'Renigunta Village', city:'Renigunta'},
  ]);

  const getRealLocation = ()=>{
    if(!navigator.geolocation){ setCity('Madhapur'); setStreet('Madhapur Block'); setShowLoc(false); return; }
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      const {latitude, longitude} = pos.coords;
      setLoc({lat:latitude, lng:longitude});
      try{
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const addr = data.address;
        const block = addr.road || addr.suburb || addr.neighbourhood || 'Your Block';
        const area = addr.suburb || addr.village || addr.town || addr.city || 'Madhapur';
        const full = `${area}, ${addr.city || addr.state || 'Hyderabad'}`;
        setCity(full);
        setStreet(block);
        if(full.toLowerCase().includes('renigunta') || full.toLowerCase().includes('tirupati')) setNeighborhood('Renigunta Village');
        else setNeighborhood('Madhapur Hills');
      }catch{ setCity('Near You'); setStreet('Your Block'); }
      setShowLoc(false);
    }, ()=>{ setCity('Madhapur, Hyderabad'); setStreet('Madhapur Block'); setShowLoc(false); }, {enableHighAccuracy:true, timeout:10000});
  };
  useEffect(()=>{ getRealLocation(); }, []);

  const filtered = posts.filter(p=>{
    if(cat!=='All' && p.cat!==cat) return false;
    if(city.toLowerCase().includes('renigunta') || city.toLowerCase().includes('tirupati')) return p.city==='Renigunta' || p.neighborhood==='Renigunta Village';
    if(city.toLowerCase().includes('madhapur') || city.toLowerCase().includes('hyderabad')) return true; // USA laaga - same neighborhood lo anni
    return true;
  });

  const toggleLike = id=> setPosts(posts.map(p=> p.id===id? {...p, liked:!p.liked, likes:p.liked?p.likes-1:p.likes+1}:p));
  const createPost = ()=>{
    if(!postText.trim()) return;
    const newPost = {id:Date.now(), author:'You', avatar:'Y', street, verified:true, time:'Just now', cat:postCat, title:'', text:postText, likes:0, liked:false, comments:[], neighborhood, city:city.split(',')[0]};
    setPosts([newPost,...posts]); setPostText(''); setShowPost(false);
  };

  const catColor = c=>{
    if(c==='Safety') return '#FF3B30';
    if(c==='For Sale') return '#00C853';
    if(c==='Recommendation') return '#FFB300';
    return '#8AC43F';
  };

  return (
    <div style={{minHeight:'100vh', background:'#F6F7F3', color:'#1A1A1A', fontFamily:'system-ui', paddingBottom:80}}>
      {showLoc && <div style={{position:'fixed', inset:0, background:'#FFFFFF', zIndex:100, display:'flex', flexDirection:'column', justifyContent:'center', padding:24}}>
        <div style={{maxWidth:360, margin:'0 auto', width:'100%', textAlign:'center'}}>
          <div style={{width:64, height:64, background:'#8AC43F', borderRadius:16, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'white', fontWeight:900}}>n</div>
          <h1 style={{marginTop:16, fontSize:22, fontWeight:800, color:'#1A1A1A'}}>Welcome to Nextdoor</h1>
          <p style={{fontSize:14, color:'#666', marginTop:8}}>The neighborhood hub. Real neighbors, real conversations.<br/>USA style verification - we use your real block, but exact house never public.</p>
          <div style={{background:'#F6F7F3', borderRadius:12, padding:12, marginTop:20, textAlign:'left', fontSize:12}}>
            <div style={{fontWeight:700}}>📍 Real location access</div>
            <div style={{color:'#666', marginTop:4}}>{loc?`Lat ${loc.lat.toFixed(4)}, Lng ${loc.lng.toFixed(4)} - ${city}`:'We will detect your block to join your neighborhood. Like USA Nextdoor postcard verification.'}</div>
          </div>
          <button onClick={getRealLocation} style={{marginTop:20, width:'100%', background:'#8AC43F', color:'white', border:'none', padding:14, borderRadius:8, fontWeight:700, fontSize:15}}>Use my location</button>
          <button onClick={()=>{setCity('Madhapur, Hyderabad'); setStreet('Madhapur Block'); setNeighborhood('Madhapur Hills'); setShowLoc(false);}} style={{marginTop:10, width:'100%', background:'white', border:'1px solid #DDD', padding:12, borderRadius:8}}>Continue with Madhapur</button>
        </div>
      </div>}

      {/* NEXTDOOR HEADER - USA STYLE */}
      <div style={{position:'sticky', top:0, background:'white', borderBottom:'1px solid #E6E6E6', zIndex:30}}>
        <div style={{maxWidth:600, margin:'0 auto', padding:'10px 14px', display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:36, height:36, background:'#8AC43F', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:18}}>n</div>
          <div style={{flex:1}}><div style={{fontWeight:800, fontSize:15, color:'#1A1A1A'}}>Nextdoor</div><div style={{fontSize:11, color:'#666'}}>{neighborhood} • {street} • {city}</div></div>
          <button onClick={getRealLocation} style={{background:'#F6F7F3', border:'none', borderRadius:20, padding:'6px 12px', fontSize:12, fontWeight:600}}>📍 {city.split(',')[0]}</button>
        </div>
        <div style={{maxWidth:600, margin:'0 auto', display:'flex', gap:8, overflowX:'auto', padding:'0 14px 10px'}}>
          {categories.map(c=>{
            const active=cat===c.id;
            return <button key={c.id} onClick={()=>setCat(c.id)} style={{padding:'6px 14px', borderRadius:20, border:`1px solid ${active?'#1A1A1A':'#DDD'}`, background:active?'#1A1A1A':'white', color:active?'white':'#1A1A1A', fontSize:13, fontWeight:600, whiteSpace:'nowrap'}}>{c.icon} {c.label}</button>
          })}
        </div>
      </div>

      <div style={{maxWidth:600, margin:'0 auto'}}>
        {/* USA NEXTDOOR HERO - Neighborhood */}
        <div style={{background:'white', borderBottom:'1px solid #E6E6E6', padding:'14px'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><b style={{fontSize:14}}>{neighborhood} Neighborhood</b><span style={{fontSize:11, background:'#8AC43F', color:'white', padding:'3px 8px', borderRadius:10}}>✔ Verified block</span></div>
          <div style={{fontSize:12, color:'#666', marginTop:4}}>Real neighbors • {filtered.length} nearby posts • Safety alerts • Marketplace • Recommendations • Like USA Nextdoor</div>
          <div style={{display:'flex', gap:8, marginTop:10}}><div style={{flex:1, background:'#F6F7F3', borderRadius:10, padding:10, textAlign:'center'}}><b style={{fontSize:16}}>{filtered.filter(p=>p.cat==='Safety').length}</b><div style={{fontSize:10, color:'#666'}}>Safety</div></div><div style={{flex:1, background:'#F6F7F3', borderRadius:10, padding:10, textAlign:'center'}}><b style={{fontSize:16}}>{filtered.filter(p=>p.cat==='For Sale').length}</b><div style={{fontSize:10, color:'#666'}}>For Sale</div></div><div style={{flex:1, background:'#F6F7F3', borderRadius:10, padding:10, textAlign:'center'}}><b style={{fontSize:16}}>{filtered.filter(p=>p.cat==='Recommendation').length}</b><div style={{fontSize:10, color:'#666'}}>Recommends</div></div></div>
        </div>

        {/* NEXTDOOR FEED - USA STYLE */}
        <div style={{padding:'12px', display:'flex', flexDirection:'column', gap:12}}>
          {filtered.map(p=>(
            <div key={p.id} style={{background:'white', border:'1px solid #E6E6E6', borderRadius:12, padding:12}}>
              {p.urgent && <div style={{background:'#FFE9E9', color:'#FF3B30', fontSize:11, fontWeight:700, padding:'4px 8px', borderRadius:6, display:'inline-block', marginBottom:8}}>🚨 URGENT • SAFETY ALERT - More visible like Nextdoor</div>}
              <div style={{display:'flex', gap:10}}>
                <div style={{width:40, height:40, background:'#EAF4D6', borderRadius:50, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#2E5A00'}}>{p.avatar}</div>
                <div style={{flex:1}}><div style={{display:'flex', gap:6, alignItems:'center'}}><b style={{fontSize:14}}>{p.author}</b>{p.verified && <span style={{fontSize:10, background:'#8AC43F', color:'white', padding:'2px 6px', borderRadius:10}}>✔ Real neighbor</span>}<span style={{fontSize:11, color:'#888'}}>• {p.time}</span></div><div style={{fontSize:11, color:'#666'}}>{p.street} • {p.neighborhood} • Approx area only</div></div>
                <div style={{width:8, height:8, borderRadius:50, background:catColor(p.cat), marginTop:6}}></div>
              </div>
              {p.title && <div style={{fontWeight:700, fontSize:15, marginTop:10}}>{p.title} {p.price && <span style={{color:'#00C853'}}>{p.price}</span>}</div>}
              <p style={{margin:'8px 0 0', fontSize:14, lineHeight:1.4, color:'#222'}}>{p.text}</p>
              <div style={{display:'flex', gap:16, marginTop:12, borderTop:'1px solid #F0F0F0', paddingTop:10}}>
                <button onClick={()=>toggleLike(p.id)} style={{display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:p.liked?'#8AC43F':'#666', fontSize:13, fontWeight:600}}>{p.liked?'♥':'♡'} {p.likes} Helpful</button>
                <button onClick={()=>{const el=document.getElementById('c'+p.id); el.style.display=el.style.display==='none'?'flex':'none'}} style={{background:'none', border:'none', color:'#666', fontSize:13}}>💬 {p.comments.length} Comments</button>
                <button onClick={()=>window.alert('Shared to neighborhood')} style={{background:'none', border:'none', color:'#666', fontSize:13, marginLeft:'auto'}}>↗ Share</button>
              </div>
              <div id={'c'+p.id} style={{display:'none', marginTop:10, flexDirection:'column', gap:8, background:'#F9FAF7', borderRadius:10, padding:10}}>
                {p.comments.map((c,i)=> <div key={i} style={{fontSize:13}}><b style={{fontSize:12}}>{c.author}:</b> <span style={{color:'#333'}}>{c.text}</span></div>)}
                <div style={{display:'flex', gap:6}}><input id={'in'+p.id} placeholder="Reply as neighbor..." onKeyDown={e=>{if(e.key==='Enter'){const txt=e.target.value; if(!txt.trim()) return; setPosts(posts.map(x=> x.id===p.id? {...x, comments:[...x.comments,{author:'You', text:txt}]}:x)); e.target.value='';}}} style={{flex:1, background:'white', border:'1px solid #DDD', borderRadius:20, padding:'8px 12px', fontSize:12}} /><button onClick={()=>{const el=document.getElementById('in'+p.id); const txt=el.value; if(!txt.trim()) return; setPosts(posts.map(x=> x.id===p.id? {...x, comments:[...x.comments,{author:'You', text:txt}]}:x)); el.value='';}} style={{background:'#1A1A1A', color:'white', border:'none', borderRadius:20, padding:'8px 14px', fontSize:12, fontWeight:600}}>Reply</button></div>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div style={{background:'white', borderRadius:12, padding:30, textAlign:'center', color:'#888', fontSize:13}}>No posts yet in {neighborhood}. Be first to welcome neighbors!</div>}
        </div>

        <div style={{padding:'0 12px 20px'}}>
          <div style={{background:'white', borderRadius:12, padding:14, border:'1px solid #E6E6E6'}}>
            <b style={{fontSize:13}}>🇮🇳 Next steps for India</b>
            <div style={{fontSize:12, color:'#666', marginTop:6, lineHeight:1.5}}>
              • USA lo zip code verification, India lo Renigunta/Madhapur area auto detect with real GPS<br/>
              • USA lo Safety & Crime = India lo Water/Power/Road alerts<br/>
              • USA lo For Sale $ = India lo Rs + UPI<br/>
              • Exact house number hidden - both USA & India same privacy
            </div>
          </div>
        </div>
      </div>

      {showPost && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:90, display:'flex', alignItems:'flex-end', justifyContent:'center'}}><div style={{background:'white', borderRadius:'16px 16px 0 0', padding:16, width:'100%', maxWidth:600}}>
        <div style={{display:'flex', justifyContent:'space-between'}}><b>Post to {neighborhood}</b><button onClick={()=>setShowPost(false)} style={{background:'#F0F0F0', border:'none', borderRadius:50, width:28, height:28}}>✕</button></div>
        <div style={{display:'flex', gap:6, overflowX:'auto', marginTop:12}}>{categories.filter(c=>c.id!=='All').map(c=> <button key={c.id} onClick={()=>setPostCat(c.id)} style={{padding:'6px 12px', borderRadius:20, border:`1px solid ${postCat===c.id?'#1A1A1A':'#DDD'}`, background:postCat===c.id?'#1A1A1A':'white', color:postCat===c.id?'white':'#333', fontSize:12, whiteSpace:'nowrap', fontWeight:600}}>{c.icon} {c.label}</button>)}</div>
        <textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder="What's happening in your neighborhood? Share news, ask for help, sell items..." style={{marginTop:10, width:'100%', height:90, background:'#F9FAF7', border:'1px solid #DDD', borderRadius:10, padding:10}}/>
        <button onClick={createPost} style={{marginTop:10, width:'100%', background:'#8AC43F', border:'none', padding:12, borderRadius:8, fontWeight:700, color:'white'}}>Post to {neighborhood}</button>
      </div></div>}

      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'white', borderTop:'1px solid #E6E6E6', display:'flex', justifyContent:'space-around', padding:'8px 0 12px', zIndex:50}}>
        <button onClick={()=>setCat('All')} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', color:cat==='All'?'#8AC43F':'#888', fontSize:10, gap:2}}><span style={{fontSize:18}}>🏠</span>Home</button>
        <button onClick={()=>window.alert('Discover - Nearby neighborhoods like Nextdoor')} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', color:'#888', fontSize:10, gap:2}}><span style={{fontSize:18}}>🔎</span>Discover</button>
        <button onClick={()=>setShowPost(true)} style={{background:'#8AC43F', border:'none', width:52, height:52, borderRadius:14, fontSize:24, color:'white', marginTop:-16, fontWeight:300}}>＋</button>
        <button onClick={()=>setCat('Safety')} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', color:cat==='Safety'?'#FF3B30':'#888', fontSize:10, gap:2}}><span style={{fontSize:18}}>🚨</span>Alerts</button>
        <button onClick={()=>window.alert('Profile - '+city)} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', color:'#888', fontSize:10, gap:2}}><span style={{fontSize:18}}>👤</span>You</button>
      </div>
    </div>
  );
                                                                                                                                                    }
