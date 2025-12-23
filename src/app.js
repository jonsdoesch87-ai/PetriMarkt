import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  doc, 
  getDoc, 
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  User, 
  Fish,
  Image as ImageIcon,
  MessageCircle,
  Phone,
  Send,
  ArrowLeft,
  ChevronLeft,
  Camera,
  LayoutGrid,
  Settings,
  ChevronDown,
  MessageSquare,
  Edit,
  Trash2
} from 'lucide-react';

// --- FIREBASE INITIALISIERUNG ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// WICHTIG: Regel 1 verlangt saubere Pfade ohne Sonderzeichen.
const rawAppId = typeof __app_id !== 'undefined' ? __app_id : 'petri-markt-v1';
const appId = rawAppId.replace(/[^a-zA-Z0-9]/g, '_'); 

const KATEGORIEN = ['Ruten', 'Rollen', 'Köder', 'Bekleidung', 'Elektronik & Echolote', 'Boote', 'Zubehör', 'Aufbewahrung', 'Sonstiges'];
const KANTONE = ['Zürich', 'Bern', 'Luzern', 'Uri', 'Schwyz', 'Obwalden', 'Nidwalden', 'Glarus', 'Zug', 'Freiburg', 'Solothurn', 'Basel-Stadt', 'Basel-Landschaft', 'Schaffhausen', 'Appenzell A.Rh.', 'Appenzell I.Rh.', 'St. Gallen', 'Graubünden', 'Aargau', 'Thurgau', 'Tessin', 'Waadt', 'Wallis', 'Neuenburg', 'Genf', 'Jura'];

const MOCK_ADS = [
  { title: 'St. Croix Legend Tournament', price: 350, category: 'Ruten', kanton: 'Zürich', description: 'Fast neue Spinnrute, ideal für Zander.' },
  { title: 'Shimano Stella C3000HG', price: 580, category: 'Rollen', kanton: 'Bern', description: 'Frisch gewartet, läuft butterweich.' }
];

// --- UNTERKOMPONENTEN ---
const Header = ({ setView, profile, setShowUserMenu, showUserMenu }) => (
  <header className="bg-white border-b border-[#eee] sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
        <div className="w-9 h-9 bg-[#576574] rounded-xl flex items-center justify-center text-white shadow-sm">
          <Fish size={24} />
        </div>
        <h1 className="text-xl font-black tracking-tight text-[#222f3e] hidden sm:block">PetriMarkt</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button onClick={() => setView('create')} className="bg-[#576574] text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-[#222f3e] text-sm font-bold transition-all shadow-sm">
          <PlusCircle size={18} /> <span className="hidden lg:inline">Inserieren</span>
        </button>

        <div className="relative">
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pr-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-all"
          >
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 overflow-hidden">
              <User size={20} />
            </div>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60]">
              <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Konto</p>
                <p className="font-bold text-[#222f3e] truncate">{profile.firstName ? `${profile.firstName} ${profile.lastName}` : 'Gast'}</p>
              </div>
              <div className="p-2">
                <button onClick={() => { setView('my-ads'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                  <LayoutGrid size={18} className="text-gray-400" /> Meine Inserate
                </button>
                <button onClick={() => { setView('my-chats'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                  <MessageSquare size={18} className="text-gray-400" /> Meine Chats
                </button>
                <button onClick={() => { setView('account'); setShowUserMenu(false); }} className="w-full flex items-center gap-3 p-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                  <Settings size={18} className="text-gray-400" /> Profil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </header>
);

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '', showPhone: false });
  const [view, setView] = useState('landing'); 
  const [selectedAd, setSelectedAd] = useState(null);
  const [ads, setAds] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Alle Kategorien');
  const [selectedKanton, setSelectedKanton] = useState('Ganze Schweiz');
  const [isUploading, setIsUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const scrollRef = useRef();

  // --- REGEL 3: AUTHENTIFIZIERUNG ZUERST ---
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Auth Fehler:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (isMounted) setUser(u);
    });
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // --- REGEL 1 & 3: DATENABFRAGEN NUR NACH AUTH ---
  useEffect(() => {
    // WICHTIG: Regel 3 - Erst auf User warten, bevor Firestore angefasst wird.
    if (!user) return;

    const profileDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main');
    const adsCollection = collection(db, 'artifacts', appId, 'public', 'data', 'ads');
    const chatsRef = collection(db, 'artifacts', appId, 'public', 'data', 'chats');

    const loadProfileAndInitialize = async () => {
      try {
        const snap = await getDoc(profileDocRef);
        if (snap.exists()) {
          setProfile(snap.data());
          // Nur zur Home-Ansicht wechseln, wenn wir noch auf der Landing-Page sind
          setView(prev => prev === 'landing' ? 'home' : prev);
        }

        // Mock-Daten laden, falls absolut nichts vorhanden ist
        const adSnap = await getDocs(adsCollection);
        if (adSnap.empty) {
          for (const ad of MOCK_ADS) {
            await addDoc(adsCollection, { ...ad, sellerId: 'system', createdAt: Date.now() });
          }
        }
      } catch (err) {
        // Fehler abfangen, um App-Absturz zu verhindern
        console.error("Datenladefehler im Initial-Load:", err);
      }
    };

    loadProfileAndInitialize();

    // Snapshot Listener mit Fehler-Callbacks (MANDATORY)
    const unsubscribeAds = onSnapshot(adsCollection, 
      (s) => {
        setAds(s.docs.map(d => ({ id: d.id, ...d.data() })));
      }, 
      (e) => console.error("Ads Sync Error abgefangen:", e)
    );

    const unsubscribeChats = onSnapshot(chatsRef, 
      (s) => {
        const all = s.docs.map(d => ({ id: d.id, ...d.data() }));
        // In-Memory Filterung nach User-ID
        setUserChats(all.filter(c => c.buyerId === user.uid || c.sellerId === user.uid));
      }, 
      (e) => console.error("Chats Sync Error abgefangen:", e)
    );

    return () => {
      unsubscribeAds();
      unsubscribeChats();
    };
  }, [user]);

  // --- MESSAGES SYNC ---
  useEffect(() => {
    // Guard für aktive Chats und Authentifizierung
    if (!activeChat || !user) return;
    
    const msgRef = collection(db, 'artifacts', appId, 'public', 'data', 'chats', activeChat.id, 'messages');
    
    const unsubscribe = onSnapshot(msgRef, 
      (s) => {
        const msgs = s.docs.map(d => ({ id: d.id, ...d.data() }));
        setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp));
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 
      (e) => console.error("Messages Sync Error abgefangen:", e)
    );
    
    return () => unsubscribe();
  }, [activeChat, user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!user) return;
    const profileDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'main');
    await setDoc(profileDocRef, profile);
    setView('home');
  };

  const handleAdSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!profile.firstName) { setView('account'); return; }
    
    setIsUploading(true);
    const fd = new FormData(e.target);
    const adData = {
      title: fd.get('title'),
      price: Number(fd.get('price')),
      description: fd.get('description'),
      category: fd.get('category'),
      kanton: fd.get('kanton'),
      sellerId: user.uid,
      sellerName: `${profile.firstName} ${profile.lastName}`,
      sellerPhone: profile.showPhone ? profile.phone : null,
      image: previewImage,
      createdAt: Date.now()
    };

    const adsRef = collection(db, 'artifacts', appId, 'public', 'data', 'ads');
    await addDoc(adsRef, adData);
    setIsUploading(false);
    setView('home');
    setPreviewImage(null);
  };

  const filteredAds = ads.filter(ad => {
    const matchSearch = ad.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'Alle Kategorien' || ad.category === selectedCategory;
    const matchKan = selectedKanton === 'Ganze Schweiz' || ad.kanton === selectedKanton;
    return matchSearch && matchCat && matchKan;
  });

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-[#576574] rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl">
          <Fish size={48} />
        </div>
        <h1 className="text-4xl font-black text-[#222f3e] mb-4">PetriMarkt Schweiz</h1>
        <p className="text-gray-500 max-w-md mb-8">Der Marktplatz von Fischern für Fischer. Kaufe und verkaufe dein Tackle einfach und sicher.</p>
        <button onClick={() => setView('home')} className="bg-[#576574] text-white px-12 py-4 rounded-2xl font-bold shadow-lg hover:bg-[#222f3e] transition-all">Jetzt loslegen</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbf9]">
      <Header 
        setView={setView} 
        profile={profile} 
        showUserMenu={showUserMenu} 
        setShowUserMenu={setShowUserMenu}
      />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 sm:pb-6">
        {view === 'home' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl outline-none text-sm font-medium" 
                  placeholder="Suchen..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="p-3 bg-white border rounded-xl text-sm font-bold outline-none">
                <option>Alle Kategorien</option>
                {KATEGORIEN.map(k => <option key={k}>{k}</option>)}
              </select>
              <select value={selectedKanton} onChange={e => setSelectedKanton(e.target.value)} className="p-3 bg-white border rounded-xl text-sm font-bold outline-none">
                <option>Ganze Schweiz</option>
                {KANTONE.map(k => <option key={k}>{k}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAds.map(ad => (
                <div key={ad.id} onClick={() => { setSelectedAd(ad); setView('detail'); }} className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer group">
                  <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                    {ad.image ? <img src={ad.image} className="w-full h-full object-cover" alt={ad.title} /> : <ImageIcon size={40} className="text-gray-200" />}
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-lg text-xs font-black shadow-sm">CHF {ad.price}.-</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#222f3e] truncate">{ad.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin size={12} /> {ad.kanton || 'Schweiz'}</p>
                  </div>
                </div>
              ))}
              {filteredAds.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-400 font-bold">Keine Inserate gefunden.</div>
              )}
            </div>
          </div>
        )}

        {view === 'detail' && selectedAd && (
          <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl flex flex-col md:flex-row">
            <div className="md:w-1/2 bg-gray-100 aspect-square md:aspect-auto">
              {selectedAd.image ? <img src={selectedAd.image} className="w-full h-full object-cover" alt={selectedAd.title} /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={64} /></div>}
            </div>
            <div className="md:w-1/2 p-8 flex flex-col">
              <button onClick={() => setView('home')} className="mb-6 flex items-center gap-2 text-gray-400 font-bold text-sm hover:text-black transition-colors">
                <ArrowLeft size={16} /> Zurück
              </button>
              <h2 className="text-3xl font-black text-[#222f3e] mb-2">{selectedAd.title}</h2>
              <p className="text-2xl font-black text-[#576574] mb-6">CHF {selectedAd.price}.-</p>
              <div className="flex-1 space-y-4 text-gray-600">
                <p className="font-medium leading-relaxed whitespace-pre-wrap">{selectedAd.description || 'Keine Beschreibung.'}</p>
                <div className="pt-4 border-t border-gray-50 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400"><User size={20} /></div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Verkäufer</p>
                    <p className="font-bold text-[#222f3e]">{selectedAd.sellerName || 'Privatnutzer'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                {user && selectedAd.sellerId !== user.uid && (
                  <button 
                    onClick={async () => {
                      const chatId = [user.uid, selectedAd.sellerId, selectedAd.id].sort().join('_');
                      const chatRef = doc(db, 'artifacts', appId, 'public', 'data', 'chats', chatId);
                      await setDoc(chatRef, { 
                        id: chatId, 
                        adId: selectedAd.id, 
                        adTitle: selectedAd.title, 
                        buyerId: user.uid, 
                        sellerId: selectedAd.sellerId, 
                        sellerName: selectedAd.sellerName || 'Verkäufer' 
                      }, { merge: true });
                      setActiveChat({ id: chatId, adTitle: selectedAd.title, sellerName: selectedAd.sellerName });
                      setView('chat');
                    }}
                    className="w-full bg-[#222f3e] text-white py-4 rounded-2xl font-black shadow-lg hover:bg-black transition-all"
                  >
                    Kontakt aufnehmen
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {view === 'create' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
            <h2 className="text-2xl font-black mb-6">Neues Inserat</h2>
            <form onSubmit={handleAdSubmit} className="space-y-4">
              <div 
                className="aspect-video bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center relative overflow-hidden cursor-pointer"
                onClick={() => document.getElementById('fileInput').click()}
              >
                {previewImage ? <img src={previewImage} className="w-full h-full object-cover" alt="Vorschau" /> : <><Camera size={32} className="text-gray-300 mb-2" /><p className="text-xs font-bold text-gray-400">FOTO HINZUFÜGEN</p></>}
                <input id="fileInput" type="file" className="hidden" accept="image/*" onChange={e => {
                  const f = e.target.files[0];
                  if (f) {
                    const r = new FileReader();
                    r.onloadend = () => setPreviewImage(r.result);
                    r.readAsDataURL(f);
                  }
                }} />
              </div>
              <input name="title" required placeholder="Titel" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold" />
              <div className="grid grid-cols-2 gap-3">
                <input name="price" type="number" required placeholder="Preis (CHF)" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold" />
                <select name="category" className="p-4 bg-gray-50 rounded-xl outline-none font-bold">
                  {KATEGORIEN.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <select name="kanton" className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold">
                {KANTONE.map(k => <option key={k}>{k}</option>)}
              </select>
              <textarea name="description" placeholder="Beschreibung..." className="w-full p-4 bg-gray-50 rounded-xl outline-none font-bold h-32 resize-none"></textarea>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setView('home')} className="flex-1 py-4 bg-gray-100 rounded-xl font-bold">Abbrechen</button>
                <button type="submit" disabled={isUploading} className="flex-1 py-4 bg-[#576574] text-white rounded-xl font-bold shadow-lg disabled:opacity-50">
                  {isUploading ? 'Wird gespeichert...' : 'Veröffentlichen'}
                </button>
              </div>
            </form>
          </div>
        )}

        {view === 'account' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl">
            <h2 className="text-2xl font-black mb-6 text-center">Mein Profil</h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input required value={profile.firstName} onChange={e => setProfile({...profile, firstName: e.target.value})} placeholder="Vorname" className="p-4 bg-gray-50 rounded-xl outline-none font-bold w-full" />
                <input required value={profile.lastName} onChange={e => setProfile({...profile, lastName: e.target.value})} placeholder="Nachname" className="p-4 bg-gray-50 rounded-xl outline-none font-bold w-full" />
              </div>
              <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} placeholder="E-Mail" className="p-4 bg-gray-50 rounded-xl outline-none font-bold w-full" />
              <button type="submit" className="w-full bg-[#222f3e] text-white py-4 rounded-xl font-black shadow-lg">Speichern</button>
            </form>
          </div>
        )}

        {view === 'chat' && activeChat && (
          <div className="max-w-xl mx-auto bg-white rounded-[2rem] border border-gray-100 shadow-2xl flex flex-col h-[70vh] overflow-hidden">
            <div className="p-4 border-b flex items-center gap-3">
              <button onClick={() => setView('my-chats')} aria-label="Zurück"><ArrowLeft size={20} /></button>
              <div>
                <p className="font-black text-sm">{activeChat.adTitle}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activeChat.sellerName}</p>
              </div>
            </div>
            <div className="flex-1 bg-gray-50 p-4 overflow-y-auto space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 px-4 rounded-2xl text-sm font-medium shadow-sm max-w-[80%] ${m.senderId === user?.uid ? 'bg-[#576574] text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
            <form 
              className="p-4 border-t bg-white flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                const t = e.target.msg.value;
                if (!t.trim() || !user) return;
                const msgVal = t.trim();
                e.target.msg.value = '';
                const msgRef = collection(db, 'artifacts', appId, 'public', 'data', 'chats', activeChat.id, 'messages');
                try {
                  await addDoc(msgRef, { text: msgVal, senderId: user.uid, timestamp: Date.now() });
                } catch (err) {
                  console.error("Fehler beim Senden der Nachricht:", err);
                }
              }}
            >
              <input name="msg" autoComplete="off" placeholder="Nachricht..." className="flex-1 bg-gray-50 p-3 rounded-xl outline-none font-medium" />
              <button type="submit" className="bg-[#222f3e] text-white p-3 rounded-xl" aria-label="Senden"><Send size={18} /></button>
            </form>
          </div>
        )}

        {view === 'my-chats' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl font-black">Meine Chats</h2>
            {userChats.length === 0 ? <p className="text-gray-400 font-bold text-center py-12">Noch keine Nachrichten.</p> : (
              userChats.map(c => (
                <div key={c.id} onClick={() => { setActiveChat(c); setView('chat'); }} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400"><MessageSquare size={24} /></div>
                  <div className="flex-1">
                    <p className="font-bold text-[#222f3e]">{c.adTitle}</p>
                    <p className="text-xs text-gray-400 font-bold">{c.sellerId === user?.uid ? 'Anfrage erhalten' : `Chat mit Verkäufer`}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {view === 'my-ads' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-black">Meine Inserate</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ads.filter(a => a.sellerId === user?.uid).map(ad => (
                <div key={ad.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    {ad.image ? <img src={ad.image} className="w-full h-full object-cover" alt={ad.title} /> : <ImageIcon className="m-auto text-gray-200" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold truncate">{ad.title}</p>
                    <p className="text-xs font-black text-[#576574]">CHF {ad.price}.-</p>
                  </div>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Inserat wirklich löschen?')) {
                        try {
                          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'ads', ad.id));
                        } catch (err) {
                          console.error("Fehler beim Löschen des Inserats:", err);
                        }
                      }
                    }}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                    aria-label="Löschen"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              {ads.filter(a => a.sellerId === user?.uid).length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 font-bold">Du hast noch keine Inserate erstellt.</div>
              )}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t sm:hidden flex items-center justify-around h-16 z-50">
        <button onClick={() => setView('home')} className={`p-2 ${view === 'home' ? 'text-[#576574]' : 'text-gray-300'}`} aria-label="Suche"><Search size={24} /></button>
        <button onClick={() => setView('create')} className={`p-2 ${view === 'create' ? 'text-[#576574]' : 'text-gray-300'}`} aria-label="Inserieren"><PlusCircle size={24} /></button>
        <button onClick={() => setView('my-chats')} className={`p-2 ${view === 'my-chats' ? 'text-[#576574]' : 'text-gray-300'}`} aria-label="Nachrichten"><MessageCircle size={24} /></button>
        <button onClick={() => setView('account')} className={`p-2 ${view === 'account' ? 'text-[#576574]' : 'text-gray-300'}`} aria-label="Profil"><User size={24} /></button>
      </nav>
    </div>
  );
}

export default App;
