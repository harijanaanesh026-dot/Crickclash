import { useState, useEffect } from 'react';

export default function App(){
  const [city,setCity]=useState('Detecting...');
  const [block,setBlock]=useState('Your block');
  const [loc,setLoc]=useState(null);
  const [showLoc,setShowLoc]=useState(true);
  const [cat,setCat]=useState('All');
  const [showPost,setShowPost]=useState(false);
  const [postCat,setPostCat]=useState('General');
  const [postText,setPostText]=useState('');

  const cats = [
    {id:'All', label:'All', icon:'🏠'},
    {id:'General', label:'General', icon:'💬'},
    {id:'Safety', label:'Alerts', icon:'🚨'},
    {id:'For Sale', label:'Buy/Sell', icon:'🛒'},
    {id:'Help', label:'Help', icon:'🤝'},
    {id:'Lost & Found', label:'Lost', icon:'🔎'},
  ];

  const [posts,setPosts]=useState([
    {id:1, name:'Jennifer Akka', letter:'J', block:'12th Street, Madhapur', time:'27m', cat:'General', text:'Hi neighbors! Mana street lo evaru unnaru? New ga vachanu.', likes:3, liked:false, comments:[], city:'Madhapur', verified:true},
    {id:2, name:'Ramesh Anna', letter:'R', block:'RTC Colony, Renigunta', time:'1h', cat:'Safety', text:'⚠️ Water supply ledu morning nundi. Tanker vachindi - 5 PM ki vastundi. Mana street lo water problem.', likes:12, liked:false, comments:[{name:'Suresh', text:'Thanks anna update ki'}], city:'Renigunta', urgent:true},
    {id:3, name:'Anitha', letter:'A', block:'Tiruchanoor Road', time:'3h', cat:'Help', text:'Manaki manchi electrician telusa? Fan repair kavali today. Evaraina unte cheppandi.', likes:1, liked:false, comments:[{name:'Rahul', text:'Kumar Electricals - main road, Rs 200 ki chestadu, number: 98xxx'}], city:'Renigunta'},
    {id:4, name:'Kiran', letter:'K', block:'Akkarampalle', time:'5h', cat:'For Sale', text:'Cycle ammutunna - Rs 3500, good condition. 2 years old. DM cheyyandi.', likes:2, liked:false, comments:[], city:'Renigunta', price:'₹3,500'},
    {id:5, name:'Lakshmi', letter:'L', block:'Madhapur Hills', time:'6h', cat:'Safety', text:'Current ledu - EB work 8 PM varaku. Power cut announcement.', likes:8, liked:false, comments:[], city:'Madhapur', urgent:true},
    {id:6, name:'Mohammed', letter:'M', block:'Main Road Bus Stop', time:'Yesterday', cat:'Lost & Found', text:'Bus stop daggara keys dorikayi. Evaridaina pothe cheppandi.', likes:1, liked:false, comments:[], city:'Renigunta'},
  ]);

  const getLocation = ()=>{
    if(!navigator.geolocation){ setCity('Madhapur'); setBlock('Madhapur Hills'); setShowLoc(false); return; }
    navigator.geolocation.getCurrentPosition(async (pos)=>{
      const {latitude, longitude} = pos.coords;
      setLoc({lat:latitude, lng:longitude});
      try{
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const a = data.address;
        const b = a.road || a.suburb || a.neighbourhood || a.village || 'Your Street';
        const c = a.suburb || a.village || a.town || a.city || 'Madhapur';
        setCity(c); setBlock(b);
      }catch{ setCity('Renigunta'); setBlock('RTC Colony'); }
      setShowLoc(false);
    }, ()=>{ setCity('Madhapur'); setBlock('Madhapur Hills'); setShowLoc(false); }, {enableHighAccuracy:true, timeout:10000});
  };
  useEffect(()=>{ getLocation(); }, []);

    const filtered = posts.filter(p=>{
    if(cat!=='All' && p.cat!==cat) return false;
    if(city.toLowerCase().includes('renigunta') || city.toLowerCase().includes('tirupati') || city.toLowerCase().includes('akkarampalle')) return p.city==='Renigunta';
    if(city.toLowerCase().includes('madhapur') || city.toLowerCase().includes('hyderabad')) return p.city==='Madhapur';
    return true;
  });

  const toggleLike = id=> setPosts(posts.map(p=> p.id===id? {...p, liked:!p.liked, likes:p.liked?p.likes-1:p.likes+1}:p));
  const addComment = (id,txt)=>{ if(!txt.trim()) return; setPosts(posts.map(p=> p.id===id? {...p, comments:[...p.comments,{name:'You', text:txt}]}:p)); };
  const createPost = ()=>{
    if(!postText.trim()) return;
    const np = {id:Date.now(), name:'You', letter:'Y', block, time:'Just now', cat:postCat, text:postText, likes:0, liked:false, comments:[], city:city, verified:true};
    setPosts([np,...posts]); setPostText(''); setShowPost(false);
  };

  return (
    <div style={{minHeight:'100vh', background:'#F6F7F3', color:'#1A1A1A', paddingBottom:80, fontFamily:'system-ui'}}>
      {showLoc && <div style={{position:'fixed', inset:0, background:'white', zIndex:100, display:'flex', flexDirection:'column', justifyContent:'center', padding:24}}>
        <div style={{maxWidth:340, margin:'0 auto', width:'100%', textAlign:'center'}}>
          <div style={{width:56, height:56, background:'#2E7D32', borderRadius:14, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900, fontSize:24}}>प</div>
          <h2 style={{marginTop:14, fontSize:20, fontWeight:800}}>Padosi - Nextdoor for India</h2>
          <p style={{fontSize:13, color:'#666', marginTop:6}}>USA Nextdoor laga, kani mana India problems ki taggattu.<br/>Water, Current, Plumber, Electrician - anni local.<br/><b>Exact address public kaadu - Approximate area matrame.</b></p>
          {loc && <div style={{marginTop:12, background:'#F6F7F3', padding:10, borderRadius:10, fontSize:11}}>📍 {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}<br/>{city} - {block}</div>}
          <button onClick={getLocation} style={{marginTop:18, width:'100%', background:'#2E7D32', color:'white', border:'none', padding:14, borderRadius:10, fontWeight:700}}>📍 Allow Location - Join {city}</button>
          <button onClick={()=>{setCity('Madhapur'); setBlock('Madhapur Hills'); setShowLoc(false);}} style={{marginTop:10, width:'100%', background:'white', border:'1px solid #DDD', padding:12, borderRadius:10}}>Skip - Madhapur</button>
          <div style={{marginTop:14, fontSize:11, color:'#999', textAlign:'left', background:'#FFF9C4', padding:10, borderRadius:10}}>
            🇮🇳 India adaptation:<br/>• $ → ₹ Rupees • Zip → Pincode<br/>• Porch theft → Water/Current alerts<br/>• Nextdoor green → Padosi green
          </div>
        </div>
      </div>}

      <div style={{position:'sticky', top:0, background:'white', borderBottom:'1px solid #E0E0E0', zIndex:30}}>
        <div style={{maxWidth:520, margin:'0 auto', padding:'10px 14px', display:'flex', alignItems:'center', gap:10}}>
          <div style={{width:34, height:34, background:'#2E7D32', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:900}}>प</div>
          <div style={{flex:1}}><b style={{fontSize:14}}>Padosi</b><span style={{fontSize:11, color:'#2E7D32', background:'#E8F5E9', padding:'2px 6px', borderRadius:10, marginLeft:6}}>✔ {city}</span><div style={{fontSize:10, color:'#777'}}>{block} • Approx area only • Real neighbors</div></div>
          <button onClick={getLocation} style={{background:'#F1F8E9', border:'none', borderRadius:20, padding:'6px 10px', fontSize:11}}>📍 Re-locate</button>
        </div>
        <div style={{maxWidth:520, margin:'0 auto', display:'flex', gap:6, overflowX:'auto', padding:'0 14px 10px'}}>
          {cats.map(c=>{const a=cat===c.id; return <button key={c.id} onClick={()=>setCat(c.id)} style={{padding:'6px 12px', borderRadius:20, border:`1px solid ${a?'#2E7D32':'#DDD'}`, background:a?'#2E7D32':'white', color:a?'white':'#333', fontSize:12, fontWeight:600, whiteSpace:'nowrap'}}>{c.icon} {c.label}</button>})}
        </div>
      </div>

      <div style={{maxWidth:520, margin:'0 auto'}}>
        <div style={{background:'#E8F5E9', margin:12, borderRadius:12, padding:12, display:'flex', gap:10, alignItems:'center'}}>
          <div style={{width:36, height:36, background:'#2E7D32', borderRadius:50, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700}}>{city[0]}</div>
          <div style={{flex:1}}><b style={{fontSize:13}}>{city} Neighbors</b><div style={{fontSize:11, color:'#555'}}>{filtered.length} posts today • Real location verified • USA Nextdoor style but for India</div></div>
          <div style={{fontSize:10, background:'#2E7D32', color:'white', padding:'4px 8px', borderRadius:10}}>INDIA</div>
        </div>


        <div style={{padding:'0 12px', display:'flex', flexDirection:'column', gap:10}}>
          {filtered.map(p=>(
            <div key={p.id} style={{background:'white', border:`1px solid ${p.urgent?'#FF3B30':'#E0E0E0'}`, borderRadius:12, padding:12}}>
              {p.urgent && <div style={{background:'#FFEBEE', color:'#D32F2F', fontSize:10, fontWeight:700, padding:'4px 8px', borderRadius:6, display:'inline-block', marginBottom:8}}>🚨 ALERT • Mana area important - More visible</div>}
              <div style={{display:'flex', gap:10}}>
                <div style={{width:38, height:38, background:'#E8F5E9', borderRadius:50, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'#2E7D32'}}>{p.letter}</div>
                <div><div style={{display:'flex', gap:6}}><b style={{fontSize:13}}>{p.name}</b>{p.verified && <span style={{fontSize:9, background:'#E8F5E9', color:'#2E7D32', padding:'2px 6px', borderRadius:10}}>✔ Neighbor</span>}</div><div style={{fontSize:11, color:'#666'}}>{p.block} • {p.time} • {p.price?` ${p.price}`:''}</div></div>
              </div>
              <p style={{margin:'8px 0 0', fontSize:14, lineHeight:1.4}}>{p.text}</p>
              <div style={{display:'flex', gap:14, marginTop:10, borderTop:'1px solid #F0F0F0', paddingTop:8}}>
                <button onClick={()=>toggleLike(p.id)} style={{background:'none', border:'none', color:p.liked?'#2E7D32':'#666', fontSize:12, fontWeight:600}}>{p.liked?'♥':'♡'} {p.likes} Helpful</button>
                <button onClick={()=>{const el=document.getElementById('c'+p.id); el.style.display=el.style.display==='none'?'flex':'none'}} style={{background:'none', border:'none', color:'#666', fontSize:12}}>💬 {p.comments.length} Reply</button>
                <button onClick={()=>window.alert('Shared to '+city)} style={{background:'none', border:'none', color:'#666', fontSize:12, marginLeft:'auto'}}>↗ Share</button>
              </div>
              <div id={'c'+p.id} style={{display:'none', marginTop:8, flexDirection:'column', gap:6, background:'#FAFAFA', borderRadius:10, padding:8}}>
                {p.comments.map((c,i)=> <div key={i} style={{fontSize:12}}><b style={{fontSize:11}}>{c.name}:</b> {c.text}</div>)}
                <div style={{display:'flex', gap:6}}><input id={'in'+p.id} placeholder="Mana local language lo reply ivvandi..." onKeyDown={e=>{if(e.key==='Enter'){addComment(p.id,e.target.value); e.target.value='';}}} style={{flex:1, background:'white', border:'1px solid #DDD', borderRadius:20, padding:'6px 12px', fontSize:11}} /><button onClick={()=>{const el=document.getElementById('in'+p.id); addComment(p.id,el.value); el.value='';}} style={{background:'#2E7D32', color:'white', border:'none', borderRadius:20, padding:'6px 12px', fontSize:11}}>Send</button></div>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div style={{background:'white', borderRadius:12, padding:30, textAlign:'center', color:'#888', fontSize:12}}>No posts in {city} - First post nuvve pettu!</div>}
        </div>
      </div>

      {showPost && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', zIndex:90, display:'flex', alignItems:'flex-end', justifyContent:'center'}}><div style={{background:'white', borderRadius:'16px 16px 0 0', padding:14, width:'100%', maxWidth:520}}>
        <div style={{display:'flex', justifyContent:'space-between'}}><b>Post to {city}</b><button onClick={()=>setShowPost(false)} style={{background:'#F0F0F0', border:'none', borderRadius:50, width:26, height:26}}>✕</button></div>
        <div style={{display:'flex', gap:6, overflowX:'auto', marginTop:10}}>{cats.filter(c=>c.id!=='All').map(c=> <button key={c.id} onClick={()=>setPostCat(c.id)} style={{padding:'6px 10px', borderRadius:20, border:`1px solid ${postCat===c.id?'#2E7D32':'#DDD'}`, background:postCat===c.id?'#2E7D32':'white', color:postCat===c.id?'white':'#333', fontSize:11, whiteSpace:'nowrap'}}>{c.icon} {c.label}</button>)}</div>
        <textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder="Mana street lo enti jarugutundi? Water, current, electrician kavala? Cheppandi..." style={{marginTop:10, width:'100%', height:80, background:'#FAFAFA', border:'1px solid #DDD', borderRadius:10, padding:10, fontSize:13}}/>
        <button onClick={createPost} style={{marginTop:10, width:'100%', background:'#2E7D32', border:'none', padding:12, borderRadius:10, fontWeight:700, color:'white'}}>Post to {city} - Approx area only</button>
      </div></div>}

      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'white', borderTop:'1px solid #E0E0E0', display:'flex', justifyContent:'space-around', padding:'8px 0 12px'}}>
        <button onClick={()=>setCat('All')} style={{background:'none', border:'none', color:cat==='All'?'#2E7D32':'#888', fontSize:10}}><div style={{fontSize:18}}>🏠</div>Home</button>
        <button onClick={()=>setCat('Help')} style={{background:'none', border:'none', color:cat==='Help'?'#2E7D32':'#888', fontSize:10}}><div style={{fontSize:18}}>🤝</div>Help</button>
        <button onClick={()=>setShowPost(true)} style={{background:'#2E7D32', border:'none', width:48, height:48, borderRadius:14, color:'white', fontSize:22, marginTop:-14}}>＋</button>
        <button onClick={()=>setCat('Safety')} style={{background:'none', border:'none', color:cat==='Safety'?'#D32F2F':'#888', fontSize:10}}><div style={{fontSize:18}}>🚨</div>Alerts</button>
        <button onClick={()=>window.alert('Profile - '+city+' - Exact hidden')} style={{background:'none', border:'none', color:'#888', fontSize:10}}><div style={{fontSize:18}}>👤</div>You</button>
      </div>
    </div>
  );
        }
