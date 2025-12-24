import React, { useState, useEffect, useRef } from 'react';
import { collection, query, onSnapshot, getDocs, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { auth, firestore } from './firebase/firebaseConfig';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import Header from './components/Header';
import AdCard from './components/AdCard';
import Detail from './pages/Detail';
import Home from './pages/Home';
import AdForm from './components/AdForm';
import ProfileForm from './components/ProfileForm';
import Chats from './pages/Chats';
import Chat from './components/Chat';
import MyAds from './pages/MyAds';

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '', showPhone: false });
  const [view, setView] = useState('landing');
  const [selectedAd, setSelectedAd] = useState(null);
  const [ads, setAds] = useState([]);
  const [userChats, setUserChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const scrollRef = useRef();

  // Firebase Authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (process.env.REACT_APP_AUTH_TOKEN) {
          await signInWithCustomToken(auth, process.env.REACT_APP_AUTH_TOKEN);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Authentication Error:', error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Load Data from Firestore
  useEffect(() => {
    if (!user) return;

    const adsCollection = collection(firestore, 'ads');
    const chatsCollection = collection(firestore, 'chats');

    const unsubscribeAds = onSnapshot(adsCollection, (querySnapshot) => {
      setAds(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const unsubscribeChats = onSnapshot(chatsCollection, (querySnapshot) => {
      setUserChats(
        querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((chat) => chat.buyerId === user.uid || chat.sellerId === user.uid)
      );
    });

    return () => {
      unsubscribeAds();
      unsubscribeChats();
    };
  }, [user]);

  // Handle Navigation and Views
  const handleProfileSave = async (e) => {
    e.preventDefault();
    const profileDocRef = doc(firestore, 'users', user.uid, 'profile');
    await setDoc(profileDocRef, profile);
    setView('home');
  };

  const handleAdSubmit = async (adData) => {
    if (!user) return;
    const adsCollection = collection(firestore, 'ads');
    await addDoc(adsCollection, {
      ...adData,
      sellerId: user.uid,
      createdAt: Date.now(),
    });
    setView('home');
  };

  const handleDeleteAd = async (adId) => {
    const adRef = doc(firestore, 'ads', adId);
    await deleteDoc(adRef);
  };

  const renderView = () => {
    switch (view) {
      case 'landing':
        return (
          <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-black text-[#222f3e] mb-4">PetriMarkt Schweiz</h1>
            <button
              onClick={() => setView('home')}
              className="bg-[#576574] text-white px-12 py-4 rounded-2xl font-bold shadow-lg hover:bg-[#222f3e] transition-all"
            >
              Jetzt loslegen
            </button>
          </div>
        );
      case 'home':
        return <Home ads={ads} onAdClick={(ad) => { setSelectedAd(ad); setView('detail'); }} />;
      case 'detail':
        return <Detail selectedAd={selectedAd} setView={setView} />;
      case 'create':
        return <AdForm onSubmit={handleAdSubmit} />;
      case 'my-ads':
        return <MyAds ads={ads.filter((ad) => ad.sellerId === user?.uid)} onDeleteAd={handleDeleteAd} />;
      case 'account':
        return <ProfileForm profile={profile} onProfileSave={handleProfileSave} />;
      case 'my-chats':
        return <Chats userChats={userChats} onChatSelect={(chat) => { setActiveChat(chat); setView('chat'); }} />;
      case 'chat':
        return <Chat activeChat={activeChat} user={user} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbf9]">
      <Header
        setView={setView}
        profile={profile}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
      />
      <main className="max-w-6xl mx-auto p-4 sm:p-6 pb-24 sm:pb-6">{renderView()}</main>
    </div>
  );
}

export default App;
