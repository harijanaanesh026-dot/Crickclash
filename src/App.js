import { useState, useEffect } from 'react';

export default function NextdoorIndia() {
  const [city, setCity] = useState('Tirupati');
  const [showCityModal, setShowCityModal] = useState(false);
  const [tab, setTab] = useState('home');
  const [feedFilter, setFeedFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [postType, setPostType] = useState('Local update');
  const [postText, setPostText] = useState('');
  const [blocked, setBlocked] = useState([]);
  const [reported, setReported] = useState([]);
  const [notifications, setNotifications] = useState([
    {id:1, text:'Rahul replied to "Bike mechanic?"', time:'2m ago', read:false, type:'reply'},
    {id:2, text:'Anjali marked your post Useful', time:'15m ago', read:false, type:'like'},
    {id:3, text:'New alert within 1km: Road closed', time:'1h ago', read:false, type:'nearby'},
    {id:4, text:'Students group: New event tomorrow', time:'3h ago', read:true, type:'group'},
  ]);
  const [showNotif, setShowNotif] = useState(false);

  const [posts, setPosts] = useState([
    {id:1, city:'Tirupati', type:'Question', icon:'❓', color:'bg-orange-100 text-orange-700', author:'Suresh K', area:'Tiruchanoor', distance:0.4, text:'నా bike start అవ్వడం లేదు. Nearby mechanic ఎవరికైనా తెలుసా?', likes:3, useful:8, comments:[{id:1, author:'Ravi Mechanic', text:'Nenu 0.5km lo unna, call chey', replies:[{author:'Suresh', text:'Thanks anna'}]}], time:'10m ago'},
    {id:2, city:'Tirupati', type:'Local update', icon:'📰', color:'bg-blue-100 text-blue-700', author:'Lakshmi', area:'Renigunta Road', distance:0.8, text:'Tomorrow water supply 2hrs late due to repair.', likes:12, useful:21, comments:[], time:'45m ago'},
    {id:3, city:'Tirupati', type:'Recommendation', icon:'💡', color:'bg-green-100 text-green-700', author:'Arjun', area:'K.T Road', distance:1.2, text:'Best dosa near station - Lakshmi Tiffin center!', likes:9, useful:15, comments:[], time:'2h ago'},
    {id:4, city:'Tirupati', type:'Alert', icon:'🚨', color:'bg-red-100 text-red-700', author:'Municipal', area:'Central', distance:0.3, text:'Heavy rain alert today evening.', likes:5, useful:32, comments:[], time:'3h ago'},
    {id:5, city:'Renigunta', type:'Announcement', icon:'📢', color:'bg-purple-100 text-purple-700', author:'College Admin', area:'Renigunta', distance:0.6, text:'College fest Dec 5th - All invited!', likes:20, useful:10, comments:[], time:'5h ago'},
  ]);

  const groups = [
    {id:1, name:'Students', icon:'🎓', members:342, desc:'College doubts, notes'},
    {id:2, name:'Jobs', icon:'💼', members:189, desc:'Local jobs'},
    {id:3, name:'Sports', icon:'⚽', members:124, desc:'Cricket matches'},
    {id:4, name:'Apartments', icon:'🏠', members:98, desc:'Rooms for rent'},
    {id:5, name:'Buy/Sell', icon:'🛒', members:210, desc:'Books, bikes'},
    {id:6, name:'Events', icon:'📅', members:76, desc:'Festivals'},
    {id:7, name:'Help', icon:'🆘', members:156, desc:'Ask help nearby'},
  ];
  const [joinedGroups, setJoinedGroups] = useState([1,5]);

  const [market, setMarket] = useState([
    {id:1, title:'DBMS Textbook', price:250, cat:'Books', area:'Tirupati', distance:0.5, seller:'Kiran', condition:'Good'},
    {id:2, title:'Hero Bicycle', price:4500, cat:'Bikes', area:'Renigunta', distance:1.1, seller:'Sai', condition:'Like New'},
    {id:3, title:'Study Table', price:1200, cat:'Furniture', area:'Tiruchanoor', distance:0.9, seller:'Priya', condition:'Good'},
    {id:4, title:'Redmi Note 12', price:8000, cat:'Electronics', area:'Tirupati', distance:0.4, seller:'Arjun', condition:'Good'},
  ]);

  const [events, setEvents] = useState([
    {id:1, title:'Cricket Tournament', date:'Nov 30', time:'9 AM', area:'College Ground', cat:'Sports', desc:'Inter-branch cricket', going:24},
    {id:2, title:'Book Festival', date:'Dec 2', time:'10 AM', area:'Town Hall', cat:'Festivals', desc:'Local authors sale', going:45},
    {id:3, title:'Cleaning Drive', date:'Dec 3', time:'7 AM', area:'Central', cat:'Community meetings', desc:'Clean our area', going:18},
  ]);

  const filteredPosts = posts.filter(p => !blocked.includes(p.author) && p.city === city && (feedFilter==='All'||p.type===feedFilter) && (search===''|| p.text.toLowerCase().includes(search.toLowerCase()))).sort((a,b)=> tab==='nearby'?a.distance-b.distance:0);

  const addPost = () => {
    if(!postText.trim()) return;
    const icons = {'Local update':'📰','Question':'❓','Recommendation':'💡','Alert':'🚨','Announcement':'📢'};
    const colors = {'Local update':'bg-blue-100 text-blue-700','Question':'bg-orange-100 text-orange-700','Recommendation':'bg-green-100 text-green-700','Alert':'bg-red-100 text-red-700','Announcement':'bg-purple-100 text-purple-700'};
    setPosts([{id:Date.now(), city, type:postType, icon:icons[postType], color:colors[postType], author:'You', area:city+' Local', distance:0.2, text:postText, likes:0, useful:0, comments:[], time:'Just now'}, ...posts]);
    setPostText(''); setShowPostModal(false);
  };

  const toggleLike = (id, type) => setPosts(posts.map(p=> p.id===id?{...p, [type]:p[type]+1}:p));

  return (
    <div className="min-h-screen bg-[#F6F8F6] text-[#1A1A1A]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'); *{font-family:Inter}`}</style>
      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="max-w-[1200px] mx-auto px-4 h-14 flex justify-between items-center">
          <div className="flex items-center gap-3"><div className="w-8 h-8 bg-[#00CC99] rounded-full flex items-center justify-center font-bold text-white">n</div><div><p className="font-bold">ManaArea</p><p className="text-[11px] text-black/50">{city} → Local Communities <button onClick={()=>setShowCityModal(true)} className="text-[#00A87D] font-semibold">Change</button></p></div></div>
          <div className="flex items-center gap-3"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search people, posts, groups" className="hidden md:block w-[300px] h-9 bg-[#F0F2F0] rounded-full px-4 text-[13px] outline-none"/><button onClick={()=>setShowNotif(!showNotif)} className="relative w-9 h-9 bg-[#F0F2F0] rounded-full">🔔{notifications.filter(n=>!n.read).length>0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{notifications.filter(n=>!n.read).length}</span>}</button></div>
        </div>
      </div>

      {showNotif && <div className="fixed top-14 right-4 w-[360px] bg-white rounded-2xl shadow-2xl border z-40"><div className="p-4 border-b flex justify-between"><p className="font-semibold">Notifications</p><button onClick={()=>setNotifications(notifications.map(n=>({...n, read:true})))} className="text-[11px] text-[#00A87D]">Mark all read</button></div>{notifications.map(n=> <div key={n.id} className={`p-4 border-b ${!n.read?'bg-green-50/50':''}`}><p className="text-[13px]">{n.text}</p><p className="text-[11px] text-black/40">{n.time}</p></div>)}</div>}

      {showCityModal && <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl p-6 w-full max-w-[360px]"><h3 className="font-bold">📍 Select your area</h3><p className="text-[12px] text-black/50 mt-1">Same area users community lo untaru. Exact house hide.</p><div className="mt-4 grid grid-cols-2 gap-2">{['Tirupati','Renigunta','Tiruchanoor','Hyderabad','Bangalore'].map(c=> <button key={c} onClick={()=>{setCity(c); setShowCityModal(false)}} className={`h-11 rounded-full text-[13px] border ${city===c?'bg-[#00CC99] text-white':'bg-white'}`}>{c}</button>)}</div><button onClick={()=>setShowCityModal(false)} className="w-full mt-3 h-10 bg-black/5 rounded-full">Close</button></div></div>}

      <div className="max-w-[1200px] mx-auto flex gap-6 px-4 py-4 pb-24">
        <div className="hidden md:block w-[220px]">
          <div className="bg-white rounded-2xl border p-3 space-y-1">{[{id:'home',label:'Home Feed',icon:'🏠'},{id:'nearby',label:'Nearby Feed',icon:'📍'},{id:'groups',label:'Local Groups',icon:'👥'},{id:'market',label:'Buy & Sell',icon:'🛒'},{id:'help',label:'Community Help',icon:'🆘'},{id:'events',label:'Local Events',icon:'📅'},{id:'admin',label:'Admin',icon:'🛡️'}].map(t=> <button key={t.id} onClick={()=>setTab(t.id)} className={`w-full text-left px-3 py-2.5 rounded-xl text-[13px] ${tab===t.id?'bg-black text-white':'hover:bg-black/5'}`}>{t.icon} {t.label}</button>)}</div>
        </div>

        <div className="flex-1 max-w-[600px] space-y-3">
          {(tab==='home'||tab==='nearby') && <div className="flex gap-2 overflow-x-auto">{['All','Local update','Question','Recommendation','Alert','Announcement'].map(f=> <button key={f} onClick={()=>setFeedFilter(f)} className={`px-4 h-8 rounded-full text-[12px] border whitespace-nowrap ${feedFilter===f?'bg-black text-white':'bg-white'}`}>{f}</button>)}</div>}
          <div className="bg-white rounded-2xl border p-3 flex gap-3"><button onClick={()=>setShowPostModal(true)} className="flex-1 text-left h-10 bg-[#F0F2F0] rounded-full px-4 text-[13px] text-black/50">What's happening in {city}?</button></div>
          <p className="text-[10px] text-center text-black/40">Exact house/location publicly చూపించకూడదు</p>

          {tab!=='groups' && tab!=='market' && tab!=='events' && tab!=='admin' && tab!=='help' && filteredPosts.map(p=> (
            <div key={p.id} className="bg-white rounded-2xl border p-4">
              <div className="flex justify-between"><div className="flex gap-2"><div className="w-9 h-9 bg-black/10 rounded-full"></div><div><p className="text-[13px] font-semibold">{p.author} • {p.area}</p><p className="text-[11px] text-black/50">{p.distance}km away • {p.time}</p></div></div><div className="group relative"><button className="w-7 h-7 bg-black/5 rounded-full">...</button><div className="hidden group-hover:block absolute right-0 top-8 w-44 bg-white shadow-xl rounded-xl border p-1 z-10"><button onClick={()=>setReported([...reported,p.id])} className="w-full text-left px-3 py-2 text-[12px] hover:bg-black/5">Report post</button><button onClick={()=>setBlocked([...blocked,p.author])} className="w-full text-left px-3 py-2 text-[12px] hover:bg-black/5">Block user</button></div></div></div>
              <div className="mt-3"><span className={`text-[11px] px-2.5 py-1 rounded-full ${p.color}`}>{p.icon} {p.type}</span></div>
              <p className="mt-3 text-[14px]">{p.text}</p>
              <div className="mt-4 flex gap-2"><button onClick={()=>toggleLike(p.id,'likes')} className="px-3 h-8 bg-[#F0F2F0] rounded-full text-[12px]">❤️ {p.likes} Like</button><button onClick={()=>toggleLike(p.id,'useful')} className="px-3 h-8 bg-green-50 text-green-700 rounded-full text-[12px]">👍 {p.useful} Useful</button></div>
              <div className="mt-3 space-y-2">{p.comments.map(c=> <div key={c.id} className="bg-[#F6F8F6] rounded-xl p-2.5"><p className="text-[12px] font-semibold">{c.author}</p><p className="text-[12px]">{c.text}</p></div>)}<input placeholder="Write comment..." className="w-full h-8 bg-[#F0F2F0] rounded-full px-3 text-[12px] outline-none" onKeyDown={e=>{if(e.key==='Enter'){const v=e.target.value; if(!v)return; setPosts(posts.map(pp=> pp.id===p.id?{...pp, comments:[...pp.comments,{id:Date.now(),author:'You',text:v}]}:pp)); e.target.value='';}}} /></div>
            </div>
          ))}

          {tab==='help' && <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-2xl p-4"><p className="font-bold">🆘 Community Help</p><p className="mt-2 bg-white rounded-xl p-3 text-[14px]">"నా bike start అవ్వడం లేదు. Nearby mechanic ఎవరికైనా తెలుసా?"</p><p className="mt-2 text-[12px]">Nearby users answer cheyagalaru</p></div>}

          {tab==='groups' && <div className="grid gap-3">{groups.map(g=> <div key={g.id} className="bg-white rounded-2xl border p-4 flex justify-between"><p className="text-[13px]">{g.icon} {g.name} • {g.members}</p><button onClick={()=> setJoinedGroups(joinedGroups.includes(g.id)?joinedGroups.filter(x=>x!==g.id):[...joinedGroups,g.id])} className={`px-4 h-8 rounded-full text-[12px] ${joinedGroups.includes(g.id)?'bg-black text-white':'bg-[#00CC99] text-white'}`}>{joinedGroups.includes(g.id)?'Joined':'Join'}</button></div>)}</div>}

          {tab==='market' && <div className="space-y-3"><div className="flex justify-between"><p className="font-semibold">🛒 Buy & Sell</p><button onClick={()=>setShowItemModal(true)} className="h-8 px-4 bg-[#00CC99] text-white rounded-full text-[12px]">+ Sell</button></div><div className="grid grid-cols-2 gap-3">{market.map(m=> <div key={m.id} className="bg-white rounded-2xl border p-3"><p className="text-[12px] font-semibold">{m.title}</p><p className="font-bold">₹{m.price}</p><p className="text-[10px] text-black/50">{m.cat} • {m.distance}km • {m.seller}</p></div>)}</div></div>}

          {tab==='events' && <div className="space-y-3"><div className="flex justify-between"><p className="font-semibold">📅 Local Events</p><button onClick={()=>setShowEventModal(true)} className="h-8 px-4 bg-[#00CC99] text-white rounded-full text-[12px]">+ Create</button></div>{events.map(ev=> <div key={ev.id} className="bg-white rounded-2xl border p-4"><p className="font-semibold text-[13px]">{ev.title}</p><p className="text-[11px] text-black/50">{ev.date} • {ev.area}</p><p className="text-[12px] mt-2">{ev.desc}</p></div>)}</div>}

          {tab==='admin' && <div className="bg-white rounded-2xl border p-4"><p className="font-bold">🛡️ Report + Block Admin</p><p className="text-[12px] text-black/50">Reported: {reported.length}, Blocked: {blocked.length}</p>{reported.map(id=>{const p=posts.find(x=>x.id===id); return p&& <div key={id} className="mt-2 border bg-red-50 rounded-xl p-3 flex justify-between"><p className="text-[12px]">{p.author}: {p.text.slice(0,40)}</p><button onClick={()=>{setPosts(posts.filter(x=>x.id!==id)); setReported(reported.filter(x=>x!==id))}} className="px-2 h-7 bg-red-500 text-white rounded-full text-[11px]">Remove</button></div>})}{blocked.map(b=> <div key={b} className="mt-2 bg-[#F6F8F6] rounded-xl p-2 flex justify-between"><p className="text-[12px]">{b}</p><button onClick={()=>setBlocked(blocked.filter(x=>x!==b))} className="text-[11px] text-green-600">Unblock</button></div>)}</div>}
        </div>
      </div>

      {showPostModal && <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center"><div className="bg-white w-full md:max-w-[520px] rounded-t-[24px] md:rounded-[24px] p-5"><div className="flex justify-between"><p className="font-bold">Create Post</p><button onClick={()=>setShowPostModal(false)}>✕</button></div><div className="mt-4 flex gap-2 overflow-x-auto">{[{l:'Local update',i:'📰'},{l:'Question',i:'❓'},{l:'Recommendation',i:'💡'},{l:'Alert',i:'🚨'},{l:'Announcement',i:'📢'}].map(o=> <button key={o.l} onClick={()=>setPostType(o.l)} className={`px-3 h-8 rounded-full text-[12px] border ${postType===o.l?'bg-black text-white':'bg-white'}`}>{o.i} {o.l}</button>)}</div><textarea value={postText} onChange={e=>setPostText(e.target.value)} placeholder="What's happening?" className="mt-4 w-full h-28 bg-[#F0F2F0] rounded-2xl p-4 text-[13px] outline-none"/><button onClick={addPost} className="mt-4 w-full h-11 bg-[#00CC99] text-white rounded-full font-semibold">Post to {city}</button></div></div>}
    </div>
  );
                    }
