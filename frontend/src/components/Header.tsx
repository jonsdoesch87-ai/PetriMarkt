import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            🎣 Fischerartikel-Marktplatz
          </Link>
          
          <nav className="flex items-center gap-4">
            <Link to="/browse" className="text-gray-700 hover:text-primary-600">
              Inserate
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to="/chats" 
                  className="text-gray-700 hover:text-primary-600 relative"
                >
                  💬 Chats
                </Link>
                <Link 
                  to="/create-inserat" 
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Inserat erstellen
                </Link>
                <Link to="/profile" className="text-gray-700 hover:text-primary-600">
                  {user?.name || user?.email}
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-primary-600"
                >
                  Abmelden
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  Anmelden
                </Link>
                <Link 
                  to="/register" 
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
                >
                  Registrieren
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

