import { useState, useEffect } from 'react';

export default function App(){
  const [city,setCity]=useState('Locating...');
  const [block,setBlock]=useState('');
  const [showLoc,setShowLoc]=useState(true);
  const [cat,setCat]=useState('All');
  const [showPost,setShowPost]=useState(false);
  const [postText,setPostText]=useState('');
  const [likedPosts,setLikedPosts]=useState(new Set());
  const [storyView,setStoryView]=useState(null);

  const stories = [
    {id:1, name:'Your Story', img:'Y', mine:true, area:city},
    {id:2, name:'RTC Colony', img:'🏘️', area:'Renigunta', live:true},
    {id:3, name:'Madhapur', img:'🌃', area:'Madhapur', live:false},
    {id:4, name:'Tiruchanoor', img:'🛕', area:'Tiruchanoor'},
    {id:5, name:'Akkarampalle', img:'🏪', area:'Akkarampalle'},
  ];

  const [posts,setPosts]=useState([]);

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

  const toggleLike = id=>{
    const newLiked = new Set(likedPosts);
    if(newLiked.has(id)) newLiked.delete(id); else newLiked.add(id);
    setLikedPosts(newLiked);
    setPosts(posts.map(p=> p.id===id? {...p, likes: newLiked.has(id)? p.likes+1 : p.likes-1}:p));
  };

  const postNow = ()=>{
    if(!postText.trim()) return;
    const np = {id:Date.now(), name:'anesh_'+city.toLowerCase().slice(0,4), fullName:'You', block, time:'now', text:postText, likes:0, comments:0, city, verified:false};
    setPosts([np, ...posts]); setPostText(''); setShowPost(false);
  };

  const filtered = cat==='All'? posts : posts.filter(p=> p.city.toLowerCase().includes(cat.toLowerCase()) || cat==='All');

  return (
    <div style={{minHeight:'100vh', background:'black', color:'white', fontFamily:'Inter, system-ui', paddingBottom:80}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); *{font-family:Inter} ::-webkit-scrollbar{display:none}`}</style>

      {showLoc && <div style={{position:'fixed', inset:0, background:'black', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:24}}>
        <div style={{background:'#121212', borderRadius:28, padding:28, maxWidth:340, width:'100%', border:'1px solid #222', textAlign:'center'}}>
          <div style={{fontSize:32, fontWeight:800, letterSpacing:'-1px'}}>Padosi</div>
          <div style={{fontSize:13, color:'#888', marginTop:4}}>Neighborhood, but make it Instagram</div>
          <div style={{marginTop:20, background:'#1A1A1A', borderRadius:16, padding:14, textAlign:'left'}}>
            <div style={{fontSize:12, fontWeight:600}}>Unique concept:</div>
            <div style={{fontSize:11, color:'#888', marginTop:4, lineHeight:1.5}}>• Instagram la stories, feed, likes<br/>• But only your block {city}<br/>• Real neighbors, not influencers<br/>• No fake posts - all real</div>
          </div>
          <button onClick={getLoc} style={{marginTop:20, width:'100%', background:'white', color:'black', border:'none', padding:14, borderRadius:14, fontWeight:700, fontSize:14}}>Allow location • Join {city}</button>
          <button onClick={()=>{setCity('Renigunta'); setBlock('RTC Colony'); setShowLoc(false);}} style={{marginTop:10, width:'100%', background:'#1A1A1A', border:'none', padding:12, borderRadius:14, fontSize:13, color:'#888'}}>Skip</button>
        </div>
      </div>}

      <div style={{position:'sticky', top:0, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(20px)', zIndex:20, borderBottom:'1px solid #1A1A1A'}}>
        <div style={{maxWidth:500, margin:'0 auto', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{fontSize:22, fontWeight:800, letterSpacing:'-1px', fontStyle:'italic'}}>Padosi</div>
          <div style={{display:'flex', gap:12, alignItems:'center'}}><span style={{fontSize:12, color:'#888'}}>{city} • {block}</span><button onClick={getLoc} style={{background:'#1A1A1A', border:'none', borderRadius:20, width:32, height:32, color:'white'}}>📍</button></div>
        </div>
        
        {/* INSTAGRAM STORIES */}
        <div style={{maxWidth:500, margin:'0 auto', display:'flex', gap:12, overflowX:'auto', padding:'0 16px 12px'}}>
          {stories.map(s=>(
            <button key={s.id} onClick={()=>setStoryView(s)} style={{background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:6, minWidth:60}}>
              <div style={{width:60, height:60, borderRadius:50, padding:2, background: s.mine? '#222' : 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'}}>
                <div style={{width:'100%', height:'100%', borderRadius:50, background:s.mine?'#1A1A1A':'#121212', border:'2px solid black', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20}}>{s.img}</div>
              </div>
              <div style={{fontSize:10, color:'white', maxWidth:60, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{s.name} {s.live && <span style={{background:'#FF3040', color:'white', fontSize:8, padding:'1px 4px', borderRadius:4}}>LIVE</span>}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{maxWidth:500, margin:'0 auto}}>

                          {posts.length===0 ? (
          <div style={{padding:'40px 20px', textAlign:'center'}}>
            <div style={{width:80, height:80, borderRadius:50, border:'2px solid #222', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', fontSize:30}}>📸</div>
            <div style={{marginTop:16, fontSize:18, fontWeight:700}}>Share your block</div>
            <div style={{fontSize:13, color:'#666', marginTop:6, lineHeight:1.5}}>No posts yet - this is real.<br/>Be first to post in {city}.<br/>Like Instagram, but only neighbors see it.</div>
            <button onClick={()=>setShowPost(true)} style={{marginTop:20, background:'white', color:'black', border:'none', padding:'12px 24px', borderRadius:20, fontWeight:600, fontSize:14}}>Create first post</button>
            
            <div style={{marginTop:30, display:'flex', flexDirection:'column', gap:10, textAlign:'left'}}>
              <div style={{background:'#121212', borderRadius:16, padding:14, border:'1px solid #1E1E1E'}}><b style={{fontSize:13}}>Why unique like Instagram?</b><div style={{fontSize:12, color:'#888', marginTop:4}}>Everyone uses Instagram for friends far away. Padosi is Instagram for 500m around you. Same addictive UI, but real neighbors.</div></div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                <div style={{background:'#121212', borderRadius:16, padding:12, border:'1px solid #1E1E1E'}}><div style={{fontSize:20}}>💧</div><div style={{fontSize:11, marginTop:4, fontWeight:600}}>Water alerts</div><div style={{fontSize:10, color:'#666'}}>Real time in {city}</div></div>
                <div style={{background:'#121212', borderRadius:16, padding:12, border:'1px solid #1E1E1E'}}><div style={{fontSize:20}}>🔧</div><div style={{fontSize:11, marginTop:4, fontWeight:600}}>Find help</div><div style={{fontSize:10, color:'#666'}}>Plumber nearby</div></div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column'}}>
            {filtered.map(p=>(
              <div key={p.id} style={{background:'black', borderBottom:'1px solid #1A1A1A', paddingBottom:12}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px'}}>
                  <div style={{display:'flex', gap:10, alignItems:'center'}}>
                    <div style={{width:32, height:32, borderRadius:50, background:'#1A1A1A', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:12}}>{p.name[0].toUpperCase()}</div>
                    <div><div style={{fontSize:13, fontWeight:600, display:'flex', gap:6}}>{p.name} <span style={{fontSize:10, color:'#888'}}>• {p.time}</span></div><div style={{fontSize:11, color:'#888'}}>{p.block} • {p.city}</div></div>
                  </div>
                  <button style={{background:'none', border:'none', color:'white', fontSize:16}}>⋯</button>
                </div>
                <div style={{background:'#121212', margin:'0 0', aspectRatio:'1', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, padding:20, textAlign:'center', color:'#CCC', borderTop:'1px solid #1A1A1A', borderBottom:'1px solid #1A1A1A'}}>{p.text}</div>
                <div style={{padding:'10px 16px 0', display:'flex', gap:14, alignItems:'center'}}>
                  <button onClick={()=>toggleLike(p.id)} style={{background:'none', border:'none', fontSize:22, color:likedPosts.has(p.id)?'#FF3040':'white'}}>{likedPosts.has(p.id)?'♥':'♡'}</button>
                  <button style={{background:'none', border:'none', fontSize:20, color:'white'}}>💬</button>
                  <button style={{background:'none', border:'none', fontSize:20, color:'white', marginLeft:'auto'}}>↗</button>
                </div>
                <div style={{padding:'6px 16px 0'}}><b style={{fontSize:13}}>{p.likes} likes</b><div style={{fontSize:13, marginTop:2}}><b>{p.name}</b> {p.text}</div><div style={{fontSize:11, color:'#666', marginTop:4}}>Add a comment as neighbor...</div></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STORY VIEW */}
      {storyView && <div onClick={()=>setStoryView(null)} style={{position:'fixed', inset:0, background:'black', zIndex:200, display:'flex', flexDirection:'column', padding:20}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><div style={{display:'flex', gap:10, alignItems:'center'}}><div style={{width:32, height:32, borderRadius:50, background:'#1A1A1A', display:'flex', alignItems:'center', justifyContent:'center'}}>{storyView.img}</div><div><b style={{fontSize:13}}>{storyView.name}</b><div style={{fontSize:11, color:'#888'}}>{storyView.area}</div></div></div><button onClick={()=>setStoryView(null)} style={{background:'none', border:'none', color:'white', fontSize:20}}>✕</button></div>
        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center'}}><div><div style={{fontSize:60}}>{storyView.img}</div><div style={{marginTop:16, fontSize:18, fontWeight:700}}>{storyView.area} Story</div><div style={{fontSize:13, color:'#888', marginTop:8}}>Real neighbors • Live in {city}<br/>Tap to add your story - coming soon</div></div></div>
      </div>}

      {showPost && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:90, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}><div style={{background:'#121212', borderRadius:20, padding:20, width:'100%', maxWidth:400, border:'1px solid #222'}}>
        <div style={{display:'flex', justifyContent:'space-between'}}><b>New post</b><button onClick={()=>setShowPost(false)} style={{background:'#222', border:'none', borderRadius:50, width:28, height:28, color:'white'}}>✕</button></div>
        <textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder={`What's happening in ${city}?`} autoFocus style={{marginTop:14, width:'100%', height:100, background:'black', border:'1px solid #222', borderRadius:12, padding:12, color:'white', outline:'none', resize:'none'}}/>
        <button onClick={postNow} style={{marginTop:14, width:'100%', background:'white', color:'black', border:'none', padding:12, borderRadius:12, fontWeight:700}}>Share to {city}</button>
      </div></div>}

      <div style={{position:'fixed', bottom:0, left:0, right:0, background:'black', borderTop:'1px solid #1A1A1A', display:'flex', justifyContent:'space-around', padding:'10px 0 20px', zIndex:50}}>
        <button style={{background:'none', border:'none', color:'white', fontSize:20}}>⌂</button>
        <button style={{background:'none', border:'none', color:'#666', fontSize:20}}>🔍</button>
        <button onClick={()=>setShowPost(true)} style={{background:'white', border:'none', width:28, height:28, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'black', fontSize:20}}>+</button>
        <button style={{background:'none', border:'none', color:'#666', fontSize:20}}>♡</button>
        <button style={{background:'none', border:'none', width:28, height:28, borderRadius:50, backgroundColor:'#222', color:'white', fontWeight:700}}>Y</button>
      </div>
    </div>
  );
}
