import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inserat } from '../types';
import { getMyInserate } from '../services/inserateService';
import { useAuthStore } from '../store/authStore';
import InseratCard from '../components/InseratCard';

const Profile = () => {
  const { user } = useAuthStore();
  const [inserate, setInserate] = useState<Inserat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyInserate();
    }
  }, [user]);

  const fetchMyInserate = async () => {
    if (!user) return;
    try {
      const data = await getMyInserate(user.id);
      setInserate(data);
    } catch (error) {
      console.error('Fehler beim Laden der Inserate:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Mein Profil</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Profilinformationen</h2>
        <div className="space-y-2">
          <p><span className="font-medium">E-Mail:</span> {user?.email}</p>
          {user?.name && <p><span className="font-medium">Name:</span> {user.name}</p>}
          {user?.phone && <p><span className="font-medium">Telefon:</span> {user.phone}</p>}
          {user?.location && <p><span className="font-medium">Standort:</span> {user.location}</p>}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Meine Inserate</h2>
          <Link
            to="/create-inserat"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            Neues Inserat
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Lade Inserate...</p>
        ) : inserate.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500 mb-4">Du hast noch keine Inserate erstellt.</p>
            <Link
              to="/create-inserat"
              className="text-primary-600 hover:underline"
            >
              Erstelle jetzt dein erstes Inserat
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inserate.map((inserat) => (
              <InseratCard key={inserat.id} inserat={inserat} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;


