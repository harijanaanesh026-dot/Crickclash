import React, { useState } from 'react';

const AREAS = ["Renigunta", "Tiruchanur", "Chandragiri", "Tirupati"];

export default function App() {
  const [tab, setTab] = useState("feed");
  const [posts, setPosts] = useState([
    {id:1, type:'feed', area:'Renigunta', user:'Ramesh Annaya', time:'10m', text:'Renigunta lo 2 days nundi water radu, evarikaina same problem unda? Municipality ki call chesa', likes:14, comments:3},
    {id:2, type:'safety', area:'Tiruchanur', user:'Lakshmi', time:'1h', text:'⚠️ Tiruchanur main road lo 2 bikes theft ayayi last night. CCTV check cheskondi', likes:32, comments:8},
    {id:3, type:'market', area:'Renigunta', user:'Sujatha', time:'2h', text:'FREE: Na daggara extra tomatoes & curry leaves unnayi. Renigunta RTC colony ki vaste ivvagalanu', price:'FREE', likes:5, comments:1},
    {id:4, type:'reco', area:'Tirupati', user:'Kiran', time:'3h', text:'Best plumber kavali Tirupati lo? Leakage repair cheyali urgent ga', likes:2, comments:5},
    {id:5, type:'lost', area:'Renigunta', user:'Anesh', time:'5h', text:'🐶 Lost: Naa white puppy “Lucky” tappipoyindi Renigunta station daggara. Kanipiste cheppandi please 98765', likes:21, comments:4},
  ]);
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState("feed");
  const [newArea, setNewArea] = useState("Renigunta");

  const addPost = () => {
    if(!newText.trim()) return;
    setPosts([{id:Date.now(), type:newType, area:newArea, user:'You', time:'Just now', text:newText, likes:0, comments:0, price: newType==='market'?'FREE':undefined}, ...posts]);
    setNewText("");
  };

  const filtered = tab === 'all' ? posts : posts.filter(p => p.type === tab || (tab==='feed' && p.type==='feed'));

  const TabBtn = ({id, label}) => (
    <button onClick={()=>setTab(id)} style={{padding:'8px 14px', borderRadius:'20px', border: tab===id?'1px solid #00a400':'1px solid #ddd', background: tab===id?'#00a400':'white', color: tab===id?'white':'#333', fontSize:'13px', fontWeight:'600'}}>{label}</button>
  );

  return (
    <div style={{maxWidth:'680px', margin:'0 auto', fontFamily:'-apple-system, system-ui', background:'#f6f7f8', minHeight:'100vh'}}>
      <div style={{background:'white', padding:'14px', position:'sticky', top:0, zIndex:10, borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div><div style={{fontWeight:'800', fontSize:'20px', color:'#00a400'}}>ManaArea</div><div style={{fontSize:'11px', color:'#666'}}>Renigunta • Tiruchanur • Tirupati</div></div>
        <div style={{width:'32px', height:'32px', borderRadius:'50%', background:'#00a400', color:'white', display:'flex', alignItems:'center', justifyContent:'center'}}>A</div>
      </div>

      <div style={{background:'white', padding:'12px', margin:'10px', borderRadius:'12px'}}>
        <div style={{display:'flex', gap:'8px', marginBottom:'10px'}}>
          <select value={newType} onChange={e=>setNewType(e.target.value)} style={{padding:'8px', borderRadius:'8px', border:'1px solid #ddd'}}><option value="feed">General</option><option value="safety">Safety ⚠️</option><option value="market">For Sale/Free</option><option value="reco">Recommendation</option><option value="lost">Lost & Found</option></select>
          <select value={newArea} onChange={e=>setNewArea(e.target.value)} style={{padding:'8px', borderRadius:'8px', border:'1px solid #ddd'}}>{AREAS.map(a=><option key={a} value={a}>{a}</option>)}</select>
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <input value={newText} onChange={e=>setNewText(e.target.value)} placeholder={newType==='safety'?'Safety alert rayandi...': newType==='market'?'Emi ammali/free ivvali?':'Me area lo em jarugutundi?'} style={{flex:1, padding:'12px', borderRadius:'10px', border:'1px solid #ddd', outline:'none'}} />
          <button onClick={addPost} style={{background:'#00a400', color:'white', border:'none', padding:'0 18px', borderRadius:'10px', fontWeight:'700'}}>Post</button>
        </div>
      </div>

      <div style={{display:'flex', gap:'8px', padding:'0 10px', overflowX:'auto'}}>
        <TabBtn id="all" label="All" /><TabBtn id="feed" label="Feed" /><TabBtn id="safety" label="Safety" /><TabBtn id="market" label="Buy/Sell" /><TabBtn id="reco" label="Reco" /><TabBtn id="lost" label="Lost & Found" />
      </div>

      <div style={{padding:'10px'}}>
        {filtered.map(p=>(
          <div key={p.id} style={{background:'white', borderRadius:'14px', padding:'14px', marginBottom:'10px', border:'1px solid #eee'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><div><b style={{fontSize:'14px'}}>{p.user}</b> <span style={{fontSize:'12px', color:'#666'}}>• {p.area} • {p.time}</span><div style={{fontSize:'11px', color:p.type==='safety'?'red':'#00a400', fontWeight:'700', textTransform:'uppercase'}}>{p.type}</div></div>{p.price && <div style={{background:'#e8f5e9', color:'#00a400', padding:'4px 8px', borderRadius:'6px', fontSize:'12px', fontWeight:'700'}}>{p.price}</div>}</div>
            <p style={{margin:'10px 0', fontSize:'15px', lineHeight:'1.4'}}>{p.text}</p>
            <div style={{display:'flex', gap:'16px', fontSize:'13px', color:'#666'}}><span>❤️ {p.likes}</span><span>💬 {p.comments} comments</span><span>↗️ Share</span></div>
          </div>
        ))}
      </div>

      <div style={{position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:'680px', background:'white', borderTop:'1px solid #eee', display:'flex', justifyContent:'space-around', padding:'8px 0'}}>
        <span style={{color:'#00a400', fontWeight:'700', fontSize:'12px'}}>🏠 Home</span><span style={{fontSize:'12px', color:'#888'}}>🛍️ Market</span><span style={{fontSize:'12px', color:'#888'}}>🛡️ Safety</span><span style={{fontSize:'12px', color:'#888'}}>👤 You</span>
      </div>
      <div style={{height:'60px'}}></div>
    </div>
  );
    }
