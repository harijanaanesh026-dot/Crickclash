import { useState, useRef } from 'react';

export default function App(){
  const [tab,setTab]=useState('wall');
  const [showAddWall,setShowAddWall]=useState(false);
  const [addType,setAddType]=useState('message');
  const [addText,setAddText]=useState('');
  const photoFileRef = useRef(null);

  const [myProfile,setMyProfile]=useState({
    name:'Anesh',
    username:'anesh_renigunta',
    photo:'A',
    photoUrl:null,
    bio:'Renigunta • Building Padosi',
    interests:['Music','Cricket'],
  });
  const [editProfile,setEditProfile]=useState({...myProfile});
  const [myWall,setMyWall]=useState([]);

  const addToWall = ()=>{
    if(!addText.trim()) return;
    let text = addText;
    if(addType==='song') text = `🎵 ${addText}`;
    if(addType==='question') text = `❓ ${addText}`;
    if(addType==='poll') text = `📊 ${addText}`;
    const np = {id:Date.now(), from:'You', fromPhoto:myProfile.photo, fromPhotoUrl:myProfile.photoUrl, type:addType, text, time:'now', likes:0, liked:false, comments:[]};
    setMyWall([np, ...myWall]);
    setAddText(''); setShowAddWall(false);
  };

  const handlePhotoChange = (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const url = URL.createObjectURL(file);
    setEditProfile({...editProfile, photo:file.name[0].toUpperCase(), photoUrl:url});
  };

  const saveProfile = ()=>{
    if(!editProfile.name.trim() || !editProfile.username.trim()){ alert('Name required'); return; }
    setMyProfile({...editProfile});
    setTab('wall');
  };

  return (
    <div style={{minHeight:'100vh', background:'black', color:'white', fontFamily:'Inter, system-ui', paddingBottom:90}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap'); *{font-family:Inter} ::-webkit-scrollbar{display:none}`}</style>

      {/* HEADER - NO PROFILE HERE - PAINA VADDU */}
      <div style={{position:'sticky', top:0, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid #1A1A1A', zIndex:20}}>
        <div style={{maxWidth:500, margin:'0 auto', padding:'12px 16px'}}>
          <div style={{fontSize:20, fontWeight:800, fontStyle:'italic', textAlign:'center'}}>Padosi • Real Only</div>
        </div>
      </div>

      <div style={{maxWidth:500, margin:'0 auto', padding:16}}>
        {tab==='wall' && (
          <div>
            <div style={{background:'#121212', borderRadius:20, padding:16, border:'1px solid #1E1E1E'}}>
              <div style={{display:'flex', gap:14, alignItems:'center'}}>
                {myProfile.photoUrl ? <img src={myProfile.photoUrl} style={{width:56, height:56, borderRadius:16, objectFit:'cover'}} /> : <div style={{width:56, height:56, borderRadius:16, background:'white', color:'black', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:20}}>{myProfile.photo}</div>}
                <div><div style={{fontWeight:700}}>{myProfile.name}</div><div style={{fontSize:12, color:'#888'}}>@{myProfile.username}</div><div style={{fontSize:12, color:'#CCC', marginTop:4}}>{myProfile.bio}</div></div>
              </div>
              <div style={{display:'flex', gap:6, marginTop:8, flexWrap:'wrap'}}>{myProfile.interests.map(i=> <span key={i} style={{fontSize:10, background:'#1A1A1A', padding:'3px 8px', borderRadius:10, border:'1px solid #222'}}>{i}</span>)}</div>
            </div>

            <div style={{marginTop:16, display:'flex', justifyContent:'space-between'}}><b>🧱 My Wall - Real</b><button onClick={()=>setShowAddWall(true)} style={{background:'white', color:'black', border:'none', padding:'8px 14px', borderRadius:20, fontSize:12, fontWeight:700}}>＋ Add</button></div>
            {myWall.length===0 ? <div style={{marginTop:12, background:'#121212', borderRadius:20, padding:24, textAlign:'center', border:'1px dashed #333'}}><div style={{fontSize:12, color:'#888'}}>Empty wall - Real - Add first</div></div> :
            <div style={{marginTop:12, display:'flex', flexDirection:'column', gap:10}}>{myWall.map(p=>(
              <div key={p.id} style={{background:'#121212', borderRadius:16, padding:12, border:'1px solid #1E1E1E'}}>
                <div style={{fontSize:13}}>{p.text}</div>
                <div style={{display:'flex', gap:10, marginTop:8}}><span style={{fontSize:11, color:'#888'}}>{p.type} • {p.time}</span><button onClick={()=>setMyWall(myWall.filter(x=>x.id!==p.id))} style={{background:'none', border:'none', color:'#555', fontSize:11, marginLeft:'auto'}}>Delete</button></div>
              </div>
            ))}</div>}
          </div>
        )}

        {tab==='friends' && <div style={{textAlign:'center', padding:30, background:'#121212', borderRadius:20, border:'1px dashed #333'}}><div>🤝 Friends - Real - No fake</div></div>}
        {tab==='discover' && <div style={{textAlign:'center', padding:30, background:'#121212', borderRadius:20, border:'1px dashed #333'}}><div>🔎 Discover - Real - No fake</div></div>}

        {tab==='profile' && <div>
          <div style={{background:'#121212', borderRadius:20, padding:16, border:'1px solid #1E1E1E'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><b>👤 Edit Profile</b><button onClick={()=>setTab('wall')} style={{background:'#1A1A1A', border:'none', borderRadius:50, width:28, height:28, color:'white'}}>✕</button></div>
            <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:12, alignItems:'center'}}>
              {editProfile.photoUrl ? <img src={editProfile.photoUrl} style={{width:80, height:80, borderRadius:20, objectFit:'cover', border:'2px solid white'}} /> : <div style={{width:80, height:80, borderRadius:20, background:'white', color:'black', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:28}}>{editProfile.photo}</div>}
              <input type="file" ref={photoFileRef} onChange={handlePhotoChange} accept="image/*" style={{display:'none'}} />
              <button onClick={()=>photoFileRef.current.click()} style={{background:'#1A1A1A', color:'white', border:'1px solid #222', padding:'8px 14px', borderRadius:20, fontSize:12}}>📸 Change Photo</button>
            </div>
            <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:10}}>
              <input value={editProfile.name} onChange={e=>setEditProfile({...editProfile, name:e.target.value})} placeholder="Name" style={{width:'100%', background:'black', border:'1px solid #222', borderRadius:12, padding:12, color:'white'}} />
              <input value={editProfile.username} onChange={e=>setEditProfile({...editProfile, username:e.target.value.toLowerCase().replace(/\s/g,'_')})} placeholder="Username" style={{width:'100%', background:'black', border:'1px solid #222', borderRadius:12, padding:12, color:'white'}} />
              <textarea value={editProfile.bio} onChange={e=>setEditProfile({...editProfile, bio:e.target.value})} placeholder="Bio" style={{width:'100%', background:'black', border:'1px solid #222', borderRadius:12, padding:12, color:'white', height:70, resize:'none'}} />
              <input value={editProfile.interests.join(', ')} onChange={e=>setEditProfile({...editProfile, interests:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} placeholder="Interests - Music, Cricket" style={{width:'100%', background:'black', border:'1px solid #222', borderRadius:12, padding:12, color:'white'}} />
              <button onClick={saveProfile} style={{background:'white', color:'black', border:'none', padding:14, borderRadius:12, fontWeight:800, marginTop:6}}>💾 Save</button>
            </div>
          </div>
        </div>}
      </div>

      {showAddWall && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}><div style={{background:'#121212', borderRadius:20, padding:16, width:'100%', maxWidth:400, border:'1px solid #222'}}>
        <div style={{display:'flex', justifyContent:'space-between'}}><b>Add to Wall - Real</b><button onClick={()=>setShowAddWall(false)} style={{background:'#222', border:'none', borderRadius:50, width:28, height:28, color:'white'}}>✕</button></div>
        <div style={{display:'flex', gap:6, marginTop:12}}>{['message','photo','song','question','poll'].map(t=> <button key={t} onClick={()=>setAddType(t)} style={{padding:'6px 12px', borderRadius:20, border:'none', background:addType===t?'white':'#1A1A1A', color:addType===t?'black':'#888', fontSize:11}}>{t}</button>)}</div>
        <textarea value={addText} onChange={e=>setAddText(e.target.value)} placeholder="Real post..." autoFocus style={{marginTop:12, width:'100%', height:80, background:'black', border:'1px solid #222', borderRadius:12, padding:12, color:'white', outline:'none'}}/>
        <button onClick={addToWall} style={{marginTop:12, width:'100%', background:'white', color:'black', border:'none', padding:12, borderRadius:12, fontWeight:700}}>Post Real</button>
      </div></div>}

      {/* BOTTOM ONLY - PROFILE KINDHA OKATE - PAINA VADDU */}
      <div style={{position:'fixed', bottom:16, left:'50%', transform:'translateX(-50%)', background:'#1A1A1A', borderRadius:20, padding:'8px 14px', display:'flex', gap:10, border:'1px solid #222', zIndex:50}}>
        <button onClick={()=>setTab('wall')} style={{background:tab==='wall'?'white':'none', border:'none', color:tab==='wall'?'black':'#888', padding:'6px 12px', borderRadius:14, fontSize:11, fontWeight:600}}>🧱 Wall</button>
        <button onClick={()=>setTab('friends')} style={{background:tab==='friends'?'white':'none', border:'none', color:tab==='friends'?'black':'#888', padding:'6px 12px', borderRadius:14, fontSize:11}}>🤝 Friends</button>
        <button onClick={()=>setShowAddWall(true)} style={{background:'white', border:'none', width:32, height:32, borderRadius:10, color:'black', fontSize:18}}>+</button>
        <button onClick={()=>setTab('discover')} style={{background:tab==='discover'?'white':'none', border:'none', color:tab==='discover'?'black':'#888', padding:'6px 12px', borderRadius:14, fontSize:11}}>🔎 Discover</button>
        <button onClick={()=>{setEditProfile({...myProfile}); setTab('profile');}} style={{background:tab==='profile'?'white':'none', border:'none', color:tab==='profile'?'black':'#888', padding:'6px 12px', borderRadius:14, fontSize:11, fontWeight:600}}>👤 Profile</button>
      </div>
    </div>
  );
        }
