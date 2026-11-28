import { useState, useEffect } from 'react';

export default function App(){
  const [city,setCity]=useState('Locating...');
  const [block,setBlock]=useState('');
  const [showLoc,setShowLoc]=useState(true);
  const [tab,setTab]=useState('home'); // home | lovers
  const [showPost,setShowPost]=useState(false);
  const [postText,setPostText]=useState('');
  const [postCat,setPostCat]=useState('General');
  const [loversCat,setLoversCat]=useState('All');

  const [posts,setPosts]=useState([]);
  const [loversPosts,setLoversPosts]=useState([]);

  const loversCats = [
    {id:'All', label:'All Lovers'},
    {id:'Crush', label:'💌 Secret Crush'},
    {id:'DateSpot', label:'💑 Date Spots'},
    {id:'Help', label:'🎁 Gift Help'},
  ];

  const getLoc = ()=>{
    if(!navigator.geolocation){ setCity('Madhapur'); setBlock('Madhapur Hills'); setShowLoc(false); return; }
    navigator.geolocation.getCurrentPosition(async (p)=>{
      try{
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.coords.latitude}&lon=${p.coords.longitude}`);
        const d = await r.json();
        setCity(d.address.suburb || d.address.village || d.address.town || 'Madhapur');
        setBlock(d.address.road || 'Main Street');
      }catch{ setCity('Renigunta'); setBlock('RTC Colony'); }
      setShowLoc(false);
    }, ()=>{ setCity('Madhapur'); setBlock('Madhapur Hills'); setShowLoc(false); });
  };
  useEffect(()=>{ getLoc(); }, []);

  const postNow = ()=>{
    if(!postText.trim()) return;
    if(tab==='lovers'){
      const np = {id:Date.now(), anonName:`Neighbor_${Math.floor(Math.random()*99)}`, block, time:'now', cat:postCat, text:postText, likes:0, city, hearts:0};
      setLoversPosts([np, ...loversPosts]);
    }else{
      const np = {id:Date.now(), name:'You', block, time:'now', cat:postCat, text:postText, likes:0, city};
      setPosts([np, ...posts]);
    }
    setPostText(''); setShowPost(false);
  };

  const filteredLovers = loversPosts.filter(p=> loversCat==='All' || p.cat===loversCat);

  return (
    <div style={{minHeight:'100vh', background:'black', color:'white', fontFamily:'Inter, system-ui', paddingBottom:90}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap'); *{font-family:Inter} ::-webkit-scrollbar{display:none}`}</style>

      {showLoc && <div style={{position:'fixed', inset:0, background:'black', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:24}}>
        <div style={{background:'#121212', borderRadius:28, padding:28, maxWidth:340, width:'100%', border:'1px solid #222', textAlign:'center'}}>
          <div style={{fontSize:28}}>💘</div>
          <div style={{fontSize:20, fontWeight:800, marginTop:8}}>Padosi • Lovers</div>
          <div style={{fontSize:12, color:'#888', marginTop:6}}>Neighborhood + Lovers - unique.<br/>Secret crush, date spots, gift help - only {city}.</div>
          <button onClick={getLoc} style={{marginTop:20, width:'100%', background:'white', color:'black', border:'none', padding:14, borderRadius:14, fontWeight:700}}>Allow location</button>
          <button onClick={()=>{setCity('Renigunta'); setBlock('RTC Colony'); setShowLoc(false);}} style={{marginTop:10, width:'100%', background:'#1A1A1A', border:'none', padding:12, borderRadius:14, color:'#888'}}>Skip</button>
        </div>
      </div>}

      <div style={{position:'sticky', top:0, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(20px)', zIndex:20, borderBottom:'1px solid #1A1A1A'}}>
        <div style={{maxWidth:500, margin:'0 auto', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', gap:10, alignItems:'center'}}><div style={{fontSize:20, fontWeight:800, fontStyle:'italic'}}>Padosi</div><span style={{fontSize:10, background:'#FF3040', color:'white', padding:'2px 6px', borderRadius:10}}>💘 Lovers</span></div>
          <div style={{fontSize:11, color:'#888'}}>{city} • {block}</div>
        </div>
        <div style={{maxWidth:500, margin:'0 auto', display:'flex', gap:8, padding:'0 16px 12px'}}>
          <button onClick={()=>setTab('home')} style={{flex:1, padding:'8px', borderRadius:20, border:'none', background:tab==='home'?'white':'#1A1A1A', color:tab==='home'?'black':'#888', fontSize:13, fontWeight:600}}>🏠 Home</button>
          <button onClick={()=>setTab('lovers')} style={{flex:1, padding:'8px', borderRadius:20, border:'none', background:tab==='lovers'?'#FF3040':'#1A1A1A', color:tab==='lovers'?'white':'#888', fontSize:13, fontWeight:600}}>💘 Lovers ({loversPosts.length})</button>
        </div>
        {tab==='lovers' && <div style={{maxWidth:500, margin:'0 auto', display:'flex', gap:6, overflowX:'auto', padding:'0 16px 12px'}}>
          {loversCats.map(c=>{const a=loversCat===c.id; return <button key={c.id} onClick={()=>setLoversCat(c.id)} style={{padding:'6px 12px', borderRadius:20, border:'none', background:a?'#FF3040':'#1A1A1A', color:a?'white':'#888', fontSize:11, whiteSpace:'nowrap'}}>{c.label}</button>})}
        </div>}
      </div>

      <div style={{maxWidth:500, margin:'0 auto', padding:16}}>

        {tab==='home' && (
          posts.length===0 ? <div style={{textAlign:'center', padding:40}}><div style={{fontSize:32}}>🏘️</div><div style={{marginTop:12, fontWeight:700}}>No posts yet in {city}</div><div style={{fontSize:12, color:'#666', marginTop:6}}>Real - be first neighbor to post</div><button onClick={()=>setShowPost(true)} style={{marginTop:16, background:'white', color:'black', border:'none', padding:'10px 20px', borderRadius:20, fontWeight:600}}>Create post</button></div> :
          <div style={{display:'flex', flexDirection:'column', gap:12}}>{posts.map(p=> <div key={p.id} style={{background:'#121212', borderRadius:16, padding:14, border:'1px solid #1E1E1E'}}><div style={{fontSize:11, color:'#888'}}>{p.block} • {p.time}</div><div style={{marginTop:6, fontSize:14}}>{p.text}</div></div>)}</div>
        )}

        {tab==='lovers' && (
          filteredLovers.length===0 ? <div style={{textAlign:'center', padding:30}}>
            <div style={{width:80, height:80, background:'#1A0A0A', borderRadius:24, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, border:'1px solid #2A1515'}}>💌</div>
            <div style={{marginTop:16, fontSize:16, fontWeight:700}}>Lovers - No secrets yet</div>
            <div style={{fontSize:12, color:'#888', marginTop:8, lineHeight:1.5}}>
              Real & anonymous - no fake.<br/>
              <b>Secret Crush:</b> Mana block lo evaraina nachithe anonymous ga cheppu<br/>
              <b>Date Spots:</b> {city} lo best couple places<br/>
              <b>Gift Help:</b> Gift shop, cafe recommendations<br/><br/>
              Exact name hidden - safe for lovers
            </div>
            <button onClick={()=>{setPostCat('Crush'); setShowPost(true);}} style={{marginTop:20, background:'#FF3040', color:'white', border:'none', padding:'12px 20px', borderRadius:20, fontWeight:600}}>💌 Post Secret Crush</button>
            <div style={{marginTop:20, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, textAlign:'left'}}>
              <div style={{background:'#121212', borderRadius:16, padding:12, border:'1px solid #1E1E1E'}}><div style={{fontSize:18}}>☕</div><div style={{fontSize:11, fontWeight:600, marginTop:4}}>Cafe Mocha - {city}</div><div style={{fontSize:10, color:'#666'}}>Best for couples • ₹300</div></div>
              <div style={{background:'#121212', borderRadius:16, padding:12, border:'1px solid #1E1E1E'}}><div style={{fontSize:18}}>🎁</div><div style={{fontSize:11, fontWeight:600, marginTop:4}}>Gift Corner - Main Rd</div><div style={{fontSize:10, color:'#666'}}>Flowers, gifts</div></div>
              <div style={{background:'#121212', borderRadius:16, padding:12, border:'1px solid #1E1E1E'}}><div style={{fontSize:18}}>🌳</div><div style={{fontSize:11, fontWeight:600, marginTop:4}}>Park - {block}</div><div style={{fontSize:10, color:'#666'}}>Evening walk spot</div></div>
              <div style={{background:'#121212', borderRadius:16, padding:12, border:'1px solid #1E1E1E'}}><div style={{fontSize:18}}>🎬</div><div style={{fontSize:11, fontWeight:600, marginTop:4}}>SVC Cinema</div><div style={{fontSize:10, color:'#666'}}>Couple seats</div></div>
            </div>
          </div> :
          <div style={{display:'flex', flexDirection:'column', gap:12}}>{filteredLovers.map(p=>(
            <div key={p.id} style={{background:'linear-gradient(135deg, #1A0A0A 0%, #121212 100%)', borderRadius:20, padding:14, border:'1px solid #2A1515'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><div style={{fontSize:11, color:'#FF8A8A', fontWeight:600}}>{p.cat==='Crush'?'💌 Secret Crush':p.cat==='DateSpot'?'💑 Date Spot':'🎁 Gift Help'} • {p.block}</div><div style={{fontSize:10, color:'#666'}}>{p.time}</div></div>
              <div style={{marginTop:8, fontSize:14, lineHeight:1.5, color:'#FFD6D6'}}>{p.text}</div>
              <div style={{display:'flex', gap:12, marginTop:10}}><button style={{background:'none', border:'none', color:'#FF3040', fontSize:12}}>♥ {p.likes} Hearts</button><span style={{fontSize:11, color:'#555'}}>Anonymous • {p.anonName} • {p.city}</span></div>
            </div>
          ))}</div>
        )}
      </div>

      {showPost && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:90, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}><div style={{background:'#121212', borderRadius:20, padding:20, width:'100%', maxWidth:400, border:'1px solid #222'}}>
        <div style={{display:'flex', justifyContent:'space-between'}}><b>{tab==='lovers'?'💘 Lovers Post':'New Post'} to {city}</b><button onClick={()=>setShowPost(false)} style={{background:'#222', border:'none', borderRadius:50, width:28, height:28, color:'white'}}>✕</button></div>
        {tab==='lovers' && <div style={{display:'flex', gap:6, marginTop:12}}>{loversCats.filter(c=>c.id!=='All').map(c=> <button key={c.id} onClick={()=>setPostCat(c.id)} style={{padding:'6px 10px', borderRadius:20, border:'none', background:postCat===c.id?'#FF3040':'#1A1A1A', color:postCat===c.id?'white':'#888', fontSize:11}}>{c.label}</button>)}</div>}
        <textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder={tab==='lovers'? `Secret crush in ${block}? Anonymous ga cheppu...` : `What's happening in ${city}?`} autoFocus style={{marginTop:12, width:'100%', height:90, background:'black', border:'1px solid #222', borderRadius:12, padding:12, color:'white', outline:'none', resize:'none'}}/>
        <button onClick={postNow} style={{marginTop:12, width:'100%', background:tab==='lovers'?'#FF3040':'white', color:tab==='lovers'?'white':'black', border:'none', padding:12, borderRadius:12, fontWeight:700}}>{tab==='lovers'?'Post Anonymously 💌':'Share to '+city}</button>
        <div style={{textAlign:'center', fontSize:10, color:'#666', marginTop:8}}>{tab==='lovers'?'Anonymous • Exact hidden • Safe for lovers':'Exact hidden • Approx only'}</div>
      </div></div>}

      <div style={{position:'fixed', bottom:16, left:'50%', transform:'translateX(-50%)', background:'#1A1A1A', borderRadius:20, padding:'8px 16px', display:'flex', gap:16, alignItems:'center', border:'1px solid #222', zIndex:50}}>
        <button onClick={()=>setTab('home')} style={{background:'none', border:'none', color:tab==='home'?'white':'#666', fontSize:11}}>🏠 Home</button>
        <button onClick={()=>setTab('lovers')} style={{background:tab==='lovers'?'#FF3040':'none', border:'none', color:tab==='lovers'?'white':'#FF6B7A', fontSize:11, padding:'6px 12px', borderRadius:20, fontWeight:700}}>💘 Lovers</button>
        <button onClick={()=>setShowPost(true)} style={{background:'white', border:'none', width:32, height:32, borderRadius:10, color:'black', fontSize:18}}>+</button>
        <button style={{background:'none', border:'none', color:'#666', fontSize:11}}>🔍 Search</button>
        <button style={{background:'none', border:'none', color:'#666', fontSize:11}}>👤 You</button>
      </div>
    </div>
  );
        }
