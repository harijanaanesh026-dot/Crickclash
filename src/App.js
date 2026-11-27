import { useState, useEffect } from 'react';

export default function App(){
  const [city,setCity]=useState('Detecting...');
  const [loc,setLoc]=useState(null);
  const [showLoc,setShowLoc]=useState(true);
  const [tab,setTab]=useState('home');
  const [cat,setCat]=useState('All');
  const [showPost,setShowPost]=useState(false);
  const [postCat,setPostCat]=useState('General');
  const [postText,setPostText]=useState('');

  const categories = [
    {id:'All', label:'All'},
    {id:'General', label:'💬 General'},
    {id:'Help', label:'🤝 Help'},
    {id:'Alert', label:'🚨 Alert'},
    {id:'Lost & Found', label:'🔎 Lost & Found'},
  ];

  const [posts,setPosts]=useState([
    {id:1, city:'Madhapur', cat:'General', text:'Hi - Mana area lo evaru unnaru?', time:'27m', likes:0, liked:false, comments:[]},
    {id:2, city:'Renigunta', cat:'Alert', text:'Water supply ledu morning nundi', time:'1h', likes:4, liked:false, comments:[]},
    {id:3, city:'Madhapur', cat:'Help', text:'Good electrician evaraina telusa?', time:'3h', likes:1, liked:false, comments:[{text:'Kumar electricals - main road'}]},
    {id:4, city:'Madhapur', cat:'Lost & Found', text:'Bus stop daggara keys dorikayi', time:'5h', likes:2, liked:false, comments:[]},
  ]);

  // REAL LOCATION ACCESS
  const getRealLocation = ()=>{
    if(!navigator.geolocation){
      window.alert('Location not supported');
      setCity('Madhapur'); setShowLoc(false); return;
    }
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      const {latitude, longitude} = pos.coords;
      setLoc({lat:latitude, lng:longitude});
      try{
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const area = data.address.suburb || data.address.village || data.address.town || data.address.city || 'Your Area';
        setCity(area);
      }catch{
        setCity('Near You');
      }
      setShowLoc(false);
    }, (err)=>{
      window.alert('Location denied: '+err.message);
      setCity('Madhapur');
      setShowLoc(false);
    }, {enableHighAccuracy:true, timeout:10000});
  };

  useEffect(()=>{ getRealLocation(); }, []);

  const filtered = posts.filter(p=>{
    if(cat!=='All' && p.cat!==cat) return false;
    // simple - city lo unde posts matrame - but first 2 secs city detecting lo unte anni chupistu
    if(city!=='Detecting...' && city!=='Near You' && city!=='Your Area' && p.city!==city && city!=='Madhapur' && city!=='Renigunta') return true; // if new area, show all
    if(city==='Madhapur' || city==='Renigunta' || city.includes('Madhapur')) {
      // if real location is Renigunta side, filter renigunta else madhapur
      if(city.toLowerCase().includes('renigunta') || city.toLowerCase().includes('tirupati')) return p.city==='Renigunta' || p.city===city;
      if(city==='Madhapur' || city.toLowerCase().includes('hyderabad')) return p.city==='Madhapur';
    }
    return true;
  });

  const toggleLike = id=> setPosts(posts.map(p=> p.id===id? {...p, liked:!p.liked, likes:p.liked?p.likes-1:p.likes+1}:p));
  const addComment = (id,txt)=>{ if(!txt.trim()) return; setPosts(posts.map(p=> p.id===id? {...p, comments:[...p.comments,{text:txt}]}:p)); };
  const createPost = ()=>{
    if(!postText.trim()) return;
    setPosts([{id:Date.now(), city, cat:postCat, text:postText, time:'Just now', likes:0, liked:false, comments:[]},...posts]);
    setPostText(''); setShowPost(false);
  };

  return (
    <div style={{minHeight:'100vh', background:'#0A0A0A', color:'white', fontFamily:'system-ui', paddingBottom:80}}>
      {/* REAL LOCATION SCREEN */}
      {showLoc && <div style={{position:'fixed', inset:0, background:'#0A0A0A', zIndex:100, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:24, textAlign:'center'}}>
        <div style={{width:80, height:80, background:'#5EEAD4', borderRadius:24, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36}}>📍</div>
        <h2 style={{marginTop:16}}>Real location access</h2>
        <p style={{color:'#888', fontSize:13, marginTop:8}}>App open chesinappudu real location adugutundi.<br/>Exact address public ga chupinchamu.<br/>Approximate area matrame use chestamu.</p>
        {loc && <div style={{marginTop:12, background:'#1E1E1E', padding:10, borderRadius:10, fontSize:12}}>Lat: {loc.lat.toFixed(4)}, Lng: {loc.lng.toFixed(4)}<br/>Detected: {city}</div>}
        <button onClick={getRealLocation} style={{marginTop:20, width:'100%', maxWidth:300, background:'#5EEAD4', color:'#0A0A0A', border:'none', padding:14, borderRadius:14, fontWeight:800}}>📍 Allow Real Location</button>
        <button onClick={()=>{setCity('Madhapur'); setShowLoc(false);}} style={{marginTop:10, background:'transparent', border:'1px solid #2A2A2A', color:'#888', padding:12, borderRadius:12, width:'100%', maxWidth:300}}>Skip - Use Madhapur</button>
      </div>}

      {/* TOP */}
      <div style={{position:'sticky', top:0, background:'#121212', padding:'12px 14px', display:'flex', alignItems:'center', gap:10, borderBottom:'1px solid #1E1E1E'}}>
        <div style={{width:32, height:32, background:'#5EEAD4', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#0A0A0A', fontWeight:900}}>प</div>
        <div style={{flex:1}}><b>Padosi</b> <span style={{fontSize:12, color:'#5EEAD4'}}>• {city} • Live location</span><div style={{fontSize:11, color:'#888'}}>Exact address hidden - Approx only</div></div>
        <button onClick={getRealLocation} style={{background:'#1E1E1E', border:'none', borderRadius:10, padding:'8px 10px', color:'white', fontSize:12}}>📍 Re-locate</button>
      </div>

      <div style={{maxWidth:480, margin:'0 auto'}}>
        {/* SIMPLE FILTERS */}
        <div style={{display:'flex', gap:8, overflowX:'auto', padding:'12px 14px'}}>
          {categories.map(c=> <button key={c.id} onClick={()=>setCat(c.id)} style={{padding:'8px 14px', borderRadius:20, border:'none', background:cat===c.id?'#5EEAD4':'#1E1E1E', color:cat===c.id?'#0A0A0A':'#CCC', fontSize:13, whiteSpace:'nowrap', fontWeight:600}}>{c.label}</button>)}
        </div>

        {/* SIMPLE FEED */}
        <div style={{padding:'0 12px', display:'flex', flexDirection:'column', gap:12}}>
          {filtered.map(p=>(
            <div key={p.id} style={{background:'#1C1C1C', border:`1px solid ${p.cat==='Alert'?'#FF3B30':'#2A2A2A'}`, borderRadius:16, padding:12}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><b style={{fontSize:13}}>{p.city} • {p.cat}</b><span style={{fontSize:11, color:'#888'}}>{p.time}</span></div>
              <p style={{margin:'8px 0', fontSize:14}}>{p.text}</p>
              <div style={{display:'flex', gap:12, marginTop:8}}>
                <button onClick={()=>toggleLike(p.id)} style={{background:'none', border:'none', color:p.liked?'#5EEAD4':'#888', fontSize:13}}>{p.liked?'♥':'♡'} {p.likes} Like</button>
                <button onClick={()=>{const el=document.getElementById('c'+p.id); el.style.display=el.style.display==='none'?'flex':'none'}} style={{background:'none', border:'none', color:'#AAA', fontSize:13}}>💬 {p.comments.length}</button>
              </div>
              <div id={'c'+p.id} style={{display:'none', marginTop:10, flexDirection:'column', gap:6}}>
                {p.comments.map((c,i)=> <div key={i} style={{background:'#121212', padding:'6px 10px', borderRadius:10, fontSize:12}}>{c.text}</div>)}
                <div style={{display:'flex', gap:6}}><input id={'in'+p.id} placeholder="Reply..." onKeyDown={e=>{if(e.key==='Enter'){addComment(p.id,e.target.value); e.target.value='';}}} style={{flex:1, background:'#121212', border:'1px solid #2A2A2A', borderRadius:20, padding:'6px 12px', color:'white', fontSize:12}} /><button onClick={()=>{const el=document.getElementById('in'+p.id); addComment(p.id,el.value); el.value='';}} style={{background:'#5EEAD4', border:'none', borderRadius:20, padding:'6px 12px', fontSize:12, fontWeight:700, color:'#0A0A0A'}}>Send</button></div>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div style={{textAlign:'center', padding:30, color:'#666', fontSize:13}}>No posts in {city} - Be first to post!</div>}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showPost && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:90, display:'flex', alignItems:'flex-end', justifyContent:'center'}}><div style={{background:'#1E1E1E', borderRadius:'20px 20px 0 0', padding:16, width:'100%', maxWidth:480}}>
        <div style={{display:'flex', justifyContent:'space-between'}}><b>Post to {city}</b><button onClick={()=>setShowPost(false)} style={{background:'#2A2A2A', border:'none', borderRadius:50, width:28, height:28, color:'white'}}>✕</button></div>
        <div style={{display:'flex', gap:6, marginTop:12}}>{categories.filter(c=>c.id!=='All').map(c=> <button key={c.id} onClick={()=>setPostCat(c.id)} style={{padding:'6px 10px', borderRadius:20, border:'none', background:postCat===c.id?'#5EEAD4':'#2A2A2A', color:postCat===c.id?'#0A0A0A':'#CCC', fontSize:12}}>{c.label}</button>)}</div>
        <textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder="What's happening in your street?" style={{marginTop:10, width:'100%', height:80, background:'#121212', border:'1px solid #2A2A2A', borderRadius:12, padding:10, color:'white'}}/>
        <button onClick={createPost} style={{marginTop:10, width:'100%', background:'#5EEAD4', border:'none', padding:12, borderRadius:12, fontWeight:800, color:'#0A0A0A'}}>Post</button>
      </div></div>}

      {/* BOTTOM NAV SIMPLE */}
      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'#121212', borderTop:'1px solid #1E1E1E', display:'flex', justifyContent:'space-around', padding:'10px 0 14px'}}>
        <button onClick={()=>setTab('home')} style={{background:'none', border:'none', color:tab==='home'?'#5EEAD4':'#666'}}>⌂ Home</button>
        <button onClick={()=>setShowPost(true)} style={{background:'#5EEAD4', border:'none', width:50, height:50, borderRadius:16, fontSize:24, color:'#0A0A0A', marginTop:-18}}>＋</button>
        <button onClick={getRealLocation} style={{background:'none', border:'none', color:'#666', fontSize:12}}>📍 {city.slice(0,10)}</button>
      </div>
    </div>
  );
        }
