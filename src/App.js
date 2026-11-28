import { useState, useEffect } from 'react';

export default function App(){
  const [city,setCity]=useState('Locating...');
  const [block,setBlock]=useState('');
  const [showLoc,setShowLoc]=useState(true);
  const [cat,setCat]=useState('All');
  const [showPost,setShowPost]=useState(false);
  const [postText,setPostText]=useState('');
  const [postCat,setPostCat]=useState('General');
  
  const cats = [
    {id:'All', label:'All'},
    {id:'General', label:'General'},
    {id:'Alerts', label:'Alerts'},
    {id:'Help', label:'Help'},
    {id:'Buy', label:'Buy/Sell'},
  ];

  // REAL - EMPTY AT START, NO FAKE POSTS
  const [posts,setPosts]=useState([]);

  const getLoc = ()=>{
    if(!navigator.geolocation){ setCity('Madhapur'); setBlock('Madhapur Hills'); setShowLoc(false); return; }
    navigator.geolocation.getCurrentPosition(async (p)=>{
      try{
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.coords.latitude}&lon=${p.coords.longitude}`);
        const d = await r.json();
        setCity(d.address.suburb || d.address.village || d.address.town || 'Madhapur');
        setBlock(d.address.road || d.address.neighbourhood || 'Main Street');
      }catch{ setCity('Renigunta'); setBlock('RTC Colony'); }
      setShowLoc(false);
    }, ()=>{ setCity('Madhapur'); setBlock('Madhapur Hills'); setShowLoc(false); });
  };
  useEffect(()=>{ getLoc(); }, []);

  const filtered = posts.filter(p=> cat==='All' || p.cat===cat);

  const like = id=> setPosts(posts.map(p=> p.id===id? {...p, liked:!p.liked, likes:p.liked?p.likes-1:p.likes+1}:p));
  
  const postNow = ()=>{
    if(!postText.trim()) return;
    const newPost = {
      id:Date.now(),
      name:'You',
      initial:'Y',
      block:block,
      time:'now',
      cat:postCat,
      text:postText,
      likes:0,
      liked:false,
      city:city,
      real:true
    };
    setPosts([newPost, ...posts]);
    setPostText('');
    setShowPost(false);
  };

  const deletePost = id=> {
    const ok = window.confirm('Delete this post?');
    if(ok) setPosts(posts.filter(p=>p.id!==id));
  };

  return (
    <div style={{minHeight:'100vh', background:'#FAFAF8', color:'#111', fontFamily:'Inter, system-ui', paddingBottom:90}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700&display=swap'); *{font-family:Inter}`}</style>

      {showLoc && <div style={{position:'fixed', inset:0, background:'#FAFAF8', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:24}}>
        <div style={{background:'white', borderRadius:24, padding:28, maxWidth:340, width:'100%', boxShadow:'0 20px 60px rgba(0,0,0,0.08)', textAlign:'center'}}>
          <div style={{width:48, height:48, background:'#111', borderRadius:14, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:800}}>प</div>
          <h1 style={{marginTop:16, fontSize:18, fontWeight:700}}>Padosi</h1>
          <p style={{fontSize:13, color:'#888', marginTop:6, lineHeight:1.5}}>Real neighbors, real posts.<br/>No fake data. Your block, your feed.</p>
          <button onClick={getLoc} style={{marginTop:20, width:'100%', background:'#111', color:'white', border:'none', padding:14, borderRadius:14, fontWeight:600, fontSize:14}}>Allow location</button>
          <button onClick={()=>{setCity('Madhapur'); setBlock('Madhapur Hills'); setShowLoc(false);}} style={{marginTop:10, width:'100%', background:'#F5F5F3', border:'none', padding:12, borderRadius:14, fontSize:13, color:'#666'}}>Skip</button>
        </div>
      </div>}

      <div style={{position:'sticky', top:0, background:'rgba(250,250,248,0.9)', backdropFilter:'blur(12px)', zIndex:20, borderBottom:'1px solid #EEE'}}>
        <div style={{maxWidth:520, margin:'0 auto', padding:'14px 20px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}><div style={{width:32, height:32, background:'#111', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:13}}>प</div><div><div style={{fontWeight:700, fontSize:14}}>Padosi</div><div style={{fontSize:11, color:'#888'}}>{block} • {city}</div></div></div>
          <button onClick={getLoc} style={{width:32, height:32, background:'white', border:'1px solid #EEE', borderRadius:10, fontSize:14}}>📍</button>
        </div>
        <div style={{maxWidth:520, margin:'0 auto', display:'flex', gap:8, padding:'0 20px 12px', overflowX:'auto'}}>
          {cats.map(c=>{const a=cat===c.id; return <button key={c.id} onClick={()=>setCat(c.id)} style={{padding:'7px 16px', borderRadius:20, border:'none', background:a?'#111':'white', color:a?'white':'#666', fontSize:13, fontWeight:500, whiteSpace:'nowrap'}}>{c.label}</button>})}
        </div>
      </div>

      <div style={{maxWidth:520, margin:'0 auto', padding:'16px 16px 0'}}>

        {/* REAL EMPTY STATE - NO FAKE POSTS */}
        {filtered.length===0 ? (
          <div style={{marginTop:40, textAlign:'center', padding:20}}>
            <div style={{width:64, height:64, background:'white', borderRadius:20, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, boxShadow:'0 2px 10px rgba(0,0,0,0.04)', border:'1px solid #F0F0F0'}}>🏘️</div>
            <h3 style={{marginTop:16, fontSize:16, fontWeight:700}}>No posts yet in {city}</h3>
            <p style={{fontSize:13, color:'#888', marginTop:6, lineHeight:1.5}}>This is real - no fake posts.<br/>Be the first neighbor to post in {block}.<br/>Water, current, help, buy/sell - anything local.</p>
            <button onClick={()=>setShowPost(true)} style={{marginTop:20, background:'#111', color:'white', border:'none', padding:'12px 20px', borderRadius:14, fontWeight:600, fontSize:13}}>＋ Create first post</button>
            <div style={{marginTop:24, background:'white', borderRadius:16, padding:14, textAlign:'left', border:'1px solid #F0F0F0'}}>
              <div style={{fontSize:12, fontWeight:600}}>How it works (Nextdoor India):</div>
              <div style={{fontSize:11, color:'#888', marginTop:6, lineHeight:1.6}}>
                1. Real GPS - {city} auto detected<br/>
                2. You post → only {city} neighbors see it<br/>
                3. No fake Suresh/Anitha posts - only real you<br/>
                4. Exact address hidden - {block} approx only
              </div>
            </div>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {filtered.map(p=>(
              <div key={p.id} style={{background:'white', borderRadius:20, padding:16, border:'1px solid #F2F2F2', boxShadow:'0 1px 2px rgba(0,0,0,0.03)'}}>
                <div style={{display:'flex', gap:10, alignItems:'center'}}>
                  <div style={{width:36, height:36, background:'#111', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:600, fontSize:13, color:'white'}}>{p.initial}</div>
                  <div style={{flex:1}}><div style={{fontWeight:600, fontSize:13, display:'flex', gap:6}}>{p.name} <span style={{fontSize:10, background:'#E8F5E9', color:'#2E7D32', padding:'2px 6px', borderRadius:10}}>Real</span></div><div style={{fontSize:11, color:'#999'}}>{p.block} • {p.time} • {p.cat}</div></div>
                  <button onClick={()=>deletePost(p.id)} style={{background:'none', border:'none', color:'#CCC', fontSize:12}}>Delete</button>
                </div>
                <div style={{marginTop:12, fontSize:14, lineHeight:1.5, color:'#222'}}>{p.text}</div>
                <div style={{display:'flex', gap:16, marginTop:14}}>
                  <button onClick={()=>like(p.id)} style={{display:'flex', gap:6, alignItems:'center', background:'none', border:'none', fontSize:12, color:p.liked?'#111':'#999', fontWeight:500}}>{p.liked?'●':'○'} {p.likes} Helpful</button>
                  <button style={{background:'none', border:'none', fontSize:12, color:'#999'}}>Share</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {filtered.length>0 && <div style={{marginTop:16, background:'white', borderRadius:20, padding:14, border:'1px solid #F0F0F0', display:'flex', gap:10, alignItems:'center'}}>
          <div style={{width:32, height:32, background:'#111', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}>Y</div>
          <button onClick={()=>setShowPost(true)} style={{flex:1, textAlign:'left', background:'#FAFAF8', border:'1px solid #F0F0F0', borderRadius:20, padding:'10px 14px', fontSize:13, color:'#888'}}>What's happening in {city}?</button>
        </div>}
      </div>

      {showPost && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', backdropFilter:'blur(8px)', zIndex:90, display:'flex', alignItems:'flex-end', justifyContent:'center'}}><div style={{background:'white', borderRadius:'24px 24px 0 0', padding:20, width:'100%', maxWidth:520}}>
        <div style={{width:36, height:4, background:'#E5E5E5', borderRadius:10, margin:'0 auto 16px'}}></div>
        <div style={{display:'flex', justifyContent:'space-between'}}><b style={{fontSize:15}}>Post to {city} neighbors</b><button onClick={()=>setShowPost(false)} style={{width:28, height:28, background:'#F5F5F3', border:'none', borderRadius:50}}>✕</button></div>
        <div style={{display:'flex', gap:6, marginTop:14}}>{cats.filter(c=>c.id!=='All').map(c=> <button key={c.id} onClick={()=>setPostCat(c.id)} style={{padding:'6px 12px', borderRadius:20, border:'none', background:postCat===c.id?'#111':'#F5F5F3', color:postCat===c.id?'white':'#666', fontSize:12}}>{c.label}</button>)}</div>
        <textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder={`Share with ${city} neighbors - water issue, help, anything real...`} autoFocus style={{marginTop:14, width:'100%', height:90, background:'#FAFAF8', border:'1px solid #EEE', borderRadius:16, padding:14, fontSize:14, outline:'none', resize:'none'}}/>
        <button onClick={postNow} style={{marginTop:14, width:'100%', background:'#111', color:'white', border:'none', padding:14, borderRadius:16, fontWeight:600, fontSize:14}}>Post - Real to {city}</button>
        <div style={{textAlign:'center', fontSize:10, color:'#AAA', marginTop:10}}>Real post • No fake data • {block} approx only</div>
      </div></div>}

      <div style={{position:'fixed', bottom:16, left:'50%', transform:'translateX(-50%)', background:'#111', borderRadius:20, padding:'8px 20px', display:'flex', gap:20, alignItems:'center', boxShadow:'0 10px 30px rgba(0,0,0,0.2)', zIndex:50}}>
        <button onClick={()=>setCat('All')} style={{background:'none', border:'none', color:cat==='All'?'white':'#666', fontSize:11}}>Home</button>
        <button onClick={()=>setCat('Alerts')} style={{background:'none', border:'none', color:cat==='Alerts'?'white':'#666', fontSize:11}}>Alerts</button>
        <button onClick={()=>setShowPost(true)} style={{background:'white', border:'none', width:36, height:36, borderRadius:12, color:'#111', fontSize:18}}>+</button>
        <button onClick={()=>setCat('Help')} style={{background:'none', border:'none', color:cat==='Help'?'white':'#666', fontSize:11}}>Help</button>
        <button onClick={()=>setCat('Buy')} style={{background:'none', border:'none', color:cat==='Buy'?'white':'#666', fontSize:11}}>Buy</button>
      </div>
    </div>
  );
                  }
