import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { seedTestData } from './utils/seedData';
import Header from './components/Header';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import InseratDetail from './pages/InseratDetail';
import CreateInserat from './pages/CreateInserat';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import ChatList from './pages/ChatList';

function App() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Seed test data once when app loads
  useEffect(() => {
    seedTestData().catch(console.error);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/browse" /> : <Landing />} />
            <Route path="/browse" element={<Home />} />
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/browse" /> : <Login />} 
            />
            <Route 
              path="/register" 
              element={isAuthenticated ? <Navigate to="/browse" /> : <Register />} 
            />
            <Route path="/inserat/:id" element={<InseratDetail />} />
            <Route 
              path="/create-inserat" 
              element={isAuthenticated ? <CreateInserat /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/profile" 
              element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/chats" 
              element={isAuthenticated ? <ChatList /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/chat/:inseratId" 
              element={isAuthenticated ? <Chat /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

