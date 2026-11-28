import { useState, useRef } from 'react';

export default function App(){
  const [tab,setTab]=useState('wall');
  const [showAddWall,setShowAddWall]=useState(false);
  const [addType,setAddType]=useState('message');
  const [addText,setAddText]=useState('');
  const fileInputRef = useRef(null);
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
    const letter = file.name[0].toUpperCase();
    setEditProfile({...editProfile, photo:letter, photoUrl:url});
  };

  const saveProfile = ()=>{
    if(!editProfile.name.trim() || !editProfile.username.trim()){ alert('Name and username required'); return; }
    setMyProfile({...editProfile});
    setTab('wall');
    alert('Profile saved - Real ✅');
  };

  const toggleLike = id=> setMyWall(myWall.map(p=> p.id===id? {...p, liked:!p.liked, likes:p.liked?p.likes-1:p.likes+1}:p));
  const addComment = (id,txt)=>{ if(!txt.trim()) return; setMyWall(myWall.map(p=> p.id===id? {...p, comments:[...p.comments,{from:'You', text:txt}]}:p)); };

  return (
    <div style={{minHeight:'100vh', background:'black', color:'white', fontFamily:'Inter, system-ui', paddingBottom:90}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700&display=swap'); *{font-family:Inter}`}</style>

      <div style={{position:'sticky', top:0, background:'rgba(0,0,0,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid #1A1A1A', zIndex:20}}>
        <div style={{maxWidth:500, margin:'0 auto', padding:'12px 16px', display:'flex', justifyContent:'space-between'}}>
          <div style={{fontWeight:800, fontStyle:'italic'}}>Padosi • Profile Edit</div>
          <div style={{fontSize:10, background:'#1A1A1A', padding:'4px 8px', borderRadius:10}}>Real Editable</div>
        </div>
      </div>

      <div style={{maxWidth:500, margin:'0 auto', padding:16}}>
        {tab==='wall' && (
          <div>
            <div style={{background:'#121212', borderRadius:20, padding:16, border:'1px solid #1E1E1E'}}>
              <div style={{display:'flex', gap:14, alignItems:'center'}}>
                {myProfile.photoUrl ? <img src={myProfile.photoUrl} style={{width:56, height:56, borderRadius:16, objectFit:'cover'}} /> : <div style={{width:56, height:56, borderRadius:16, background:'white', color:'black', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:20}}>{myProfile.photo}</div>}
                <div style={{flex:1}}><div style={{fontWeight:700}}>{myProfile.name}</div><div style={{fontSize:12, color:'#888'}}>@{myProfile.username}</div><div style={{fontSize:12, color:'#CCC', marginTop:4}}>{myProfile.bio}</div><div style={{display:'flex', gap:4, marginTop:6, flexWrap:'wrap'}}>{myProfile.interests.map(i=> <span key={i} style={{fontSize:10, background:'#1A1A1A', padding:'3px 8px', borderRadius:10, border:'1px solid #222'}}>{i}</span>)}</div></div>
              </div>
              <button onClick={()=>{setEditProfile({...myProfile}); setTab('profile');}} style={{marginTop:12, width:'100%', background:'white', color:'black', border:'none', padding:10, borderRadius:12, fontWeight:700, fontSize:13}}>✏️ Edit Profile - User Can Edit</button>
              <div style={{display:'flex', gap:12, marginTop:12, borderTop:'1px solid #1E1E1E', paddingTop:10}}><div><b>{myWall.length}</b> <span style={{fontSize:11, color:'#888'}}>Wall (real)</span></div></div>
            </div>

            <div style={{marginTop:16, display:'flex', justifyContent:'space-between'}}><b>🧱 My Wall</b><button onClick={()=>setShowAddWall(true)} style={{background:'white', color:'black', border:'none', padding:'8px 14px', borderRadius:20, fontSize:12, fontWeight:700}}>＋ Add</button></div>
            {myWall.length===0 ? <div style={{marginTop:12, background:'#121212', borderRadius:20, padding:24, textAlign:'center', border:'1px dashed #333'}}><div>Empty - Real</div><button onClick={()=>setShowAddWall(true)} style={{marginTop:10, background:'white', color:'black', border:'none', padding:'8px 16px', borderRadius:20, fontWeight:600, fontSize:12}}>Add First</button></div> :
            <div style={{marginTop:12, display:'flex', flexDirection:'column', gap:10}}>{myWall.map(p=>(
              <div key={p.id} style={{background:'#121212', borderRadius:16, padding:12, border:'1px solid #1E1E1E'}}>
                <div style={{display:'flex', gap:8, alignItems:'center'}}>{p.fromPhotoUrl? <img src={p.fromPhotoUrl} style={{width:24, height:24, borderRadius:50, objectFit:'cover'}}/> : <div style={{width:24, height:24, borderRadius:50, background:'white', color:'black', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700}}>{p.fromPhoto}</div>}<div style={{fontSize:12, fontWeight:600}}>{p.from} • {p.type}</div></div>
                <div style={{marginTop:8, fontSize:13}}>{p.text}</div>
                <div style={{display:'flex', gap:12, marginTop:8}}><button onClick={()=>toggleLike(p.id)} style={{background:'none', border:'none', color:p.liked?'#FF3040':'#888', fontSize:12}}>{p.liked?'♥':'♡'} {p.likes}</button><button onClick={()=>setMyWall(myWall.filter(x=>x.id!==p.id))} style={{background:'none', border:'none', color:'#555', fontSize:11, marginLeft:'auto'}}>Delete</button></div>
              </div>
            ))}</div>}
          </div>
        )}

        {tab==='profile' && <div>
          <div style={{background:'#121212', borderRadius:20, padding:16, border:'1px solid #1E1E1E'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><b>👤 Edit Profile - User Editable</b><button onClick={()=>setTab('wall')} style={{background:'#1A1A1A', border:'none', borderRadius:50, width:28, height:28, color:'white'}}>✕</button></div>
            <div style={{fontSize:11, color:'#888', marginTop:4}}>User can edit photo, name, username, bio, interests - Real save</div>

            <div style={{marginTop:16, display:'flex', flexDirection:'column', gap:12}}>
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:10}}>
                {editProfile.photoUrl ? <img src={editProfile.photoUrl} style={{width:80, height:80, borderRadius:20, objectFit:'cover', border:'2px solid white'}} /> : <div style={{width:80, height:80, borderRadius:20, background:'white', color:'black', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:28}}>{editProfile.photo}</div>}
                <input type="file" ref={photoFileRef} onChange={handlePhotoChange} accept="image/*" style={{display:'none'}} />
                <button onClick={()=>photoFileRef.current.click()} style={{background:'#1A1A1A', color:'white', border:'1px solid #222', padding:'8px 14px', borderRadius:20, fontSize:12}}>📸 Change Photo - Gallery/Camera</button>
                <div style={{fontSize:10, color:'#666'}}>Tap to upload real photo - stored locally, no fake</div>
              </div>

              <div><div style={{fontSize:11, color:'#888'}}>Name *</div><input value={editProfile.name} onChange={e=>setEditProfile({...editProfile, name:e.target.value})} placeholder="Your real name" style={{width:'100%', background:'black', border:'1px solid #222', borderRadius:12, padding:12, color:'white', marginTop:4}} /></div>
              <div><div style={{fontSize:11, color:'#888'}}>Username *</div><input value={editProfile.username} onChange={e=>setEditProfile({...editProfile, username:e.target.value.toLowerCase().replace(/\s/g,'_')})} placeholder="username" style={{width:'100%', background:'black', border:'1px solid #222', borderRadius:12, padding:12, color:'white', marginTop:4}} /></div>
              <div><div style={{fontSize:11, color:'#888'}}>Short Bio</div><textarea value={editProfile.bio} onChange={e=>setEditProfile({...editProfile, bio:e.target.value})} placeholder="Bio - Eg: Renigunta • Music lover" maxLength={100} style={{width:'100%', background:'black', border:'1px solid #222', borderRadius:12, padding:12, color:'white', marginTop:4, height:70, resize:'none'}} /><div style={{fontSize:10, color:'#555', textAlign:'right'}}>{editProfile.bio.length}/100</div></div>
              <div><div style={{fontSize:11, color:'#888'}}>Interests (comma separated)</div><input value={editProfile.interests.join(', ')} onChange={e=>setEditProfile({...editProfile, interests:e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} placeholder="Music, Cricket, Travel" style={{width:'100%', background:'black', border:'1px solid #222', borderRadius:12, padding:12, color:'white', marginTop:4}} />
                <div style={{display:'flex', gap:4, marginTop:6, flexWrap:'wrap'}}>{editProfile.interests.map(i=> <span key={i} style={{fontSize:10, background:'white', color:'black', padding:'3px 8px', borderRadius:10}}>{i} ✕</span>)}</div>
              </div>

              <button onClick={saveProfile} style={{background:'white', color:'black', border:'none', padding:14, borderRadius:12, fontWeight:800, marginTop:8, fontSize:14}}>💾 Save Profile - Real</button>
              <button onClick={()=>{setEditProfile({...myProfile}); setTab('wall');}} style={{background:'#1A1A1A', color:'#888', border:'none', padding:12, borderRadius:12, fontSize:13}}>Cancel</button>
            </div>
          </div>
        </div>}

        {tab==='friends' && <div style={{textAlign:'center', padding:30, background:'#121212', borderRadius:20, border:'1px dashed #333'}}><div style={{fontSize:24}}>🤝</div><div style={{marginTop:8, fontWeight:600}}>Friends - Real Only</div><div style={{fontSize:12, color:'#888', marginTop:4}}>No fake data - invite real friends</div></div>}
        {tab==='discover' && <div style={{textAlign:'center', padding:30, background:'#121212', borderRadius:20, border:'1px dashed #333'}}><div style={{fontSize:24}}>🔎</div><div style={{marginTop:8, fontWeight:600}}>Discover - Real Only</div><div style={{fontSize:12, color:'#888', marginTop:4}}>No fake people - real users only</div></div>}
      </div>

      {showAddWall && <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20}}><div style={{background:'#121212', borderRadius:20, padding:16, width:'100%', maxWidth:400, border:'1px solid #222'}}>
        <div style={{display:'flex', justifyContent:'space-between'}}><b>➕ Add to Wall</b><button onClick={()=>setShowAddWall(false)} style={{background:'#222', border:'none', borderRadius:50, width:28, height:28, color:'white'}}>✕</button></div>
        <div style={{display:'flex', gap:6, marginTop:12, flexWrap:'wrap'}}>{[{id:'message', label:'💬'},{id:'photo', label:'📸'},{id:'song', label:'🎵'},{id:'question', label:'❓'},{id:'poll', label:'📊'}].map(t=> <button key={t.id} onClick={()=>setAddType(t.id)} style={{padding:'6px 12px', borderRadius:20, border:'none', background:addType===t.id?'white':'#1A1A1A', color:addType===t.id?'black':'#888', fontSize:12, fontWeight:600}}>{t.label} {t.id}</button>)}</div>
        <textarea value={addText} onChange={e=>setAddText(e.target.value)} placeholder="Real post..." autoFocus style={{marginTop:12, width:'100%', height:80, background:'black', border:'1px solid #222', borderRadius:12, padding:12, color:'white', outline:'none', resize:'none'}}/>
        <button onClick={addToWall} style={{marginTop:12, width:'100%', background:'white', color:'black', border:'none', padding:12, borderRadius:12, fontWeight:700}}>Post Real</button>
      </div></div>}

      <div style={{position:'fixed', bottom:16, left:'50%', transform:'translateX(-50%)', background:'#1A1A1A', borderRadius:20, padding:'8px 14px', display:'flex', gap:10, border:'1px solid #222', zIndex:50}}>
        <button onClick={()=>setTab('wall')} style={{background:tab==='wall'?'white':'none', border:'none', color:tab==='wall'?'black':'#888', padding:'6px 12px', borderRadius:14, fontSize:11, fontWeight:600}}>🧱 Wall</button>
        <button onClick={()=>setTab('friends')} style={{background:tab==='friends'?'white':'none', border:'none', color:tab==='friends'?'black':'#888', padding:'6px 12px', borderRadius:14, fontSize:11}}>🤝 Friends</button>
        <button onClick={()=>setShowAddWall(true)} style={{background:'white', border:'none', width:32, height:32, borderRadius:10, color:'black', fontSize:18}}>+</button>
        <button onClick={()=>setTab('discover')} style={{background:tab==='discover'?'white':'none', border:'none', color:tab==='discover'?'black':'#888', padding:'6px 12px', borderRadius:14, fontSize:11}}>🔎 Discover</button>
        <button onClick={()=>{setEditProfile({...myProfile}); setTab('profile');}} style={{background:tab==='profile'?'white':'none', border:'none', color:tab==='profile'?'black':'#888', padding:'6px 12px', borderRadius:14, fontSize:11}}>👤 Edit</button>
      </div>
    </div>
  );
}
