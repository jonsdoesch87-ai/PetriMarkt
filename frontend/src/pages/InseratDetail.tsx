import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Inserat } from '../types';
import { getInserat } from '../services/inserateService';
import { useAuthStore } from '../store/authStore';

const InseratDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuthStore();
  const [inserat, setInserat] = useState<Inserat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInserat();
    }
  }, [id]);

  const fetchInserat = async () => {
    if (!id) return;
    try {
      const data = await getInserat(id);
      setInserat(data);
    } catch (error) {
      console.error('Fehler beim Laden des Inserats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Lade Inserat...</div>;
  }

  if (!inserat) {
    return <div className="text-center py-12">Inserat nicht gefunden.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Bilder */}
        <div className="h-96 bg-gray-200 flex items-center justify-center">
          {inserat.images && inserat.images.length > 0 ? (
            <img 
              src={inserat.images[0]} 
              alt={inserat.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">Kein Bild verfügbar</span>
          )}
        </div>

        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{inserat.title}</h1>
              <p className="text-primary-600 font-bold text-2xl">
                CHF {inserat.price.toFixed(2)}
              </p>
            </div>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
              {inserat.category}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
            <div>
              <span className="font-medium">Zustand:</span> {inserat.condition}
            </div>
            <div>
              <span className="font-medium">Standort:</span> {inserat.location}
            </div>
            <div>
              <span className="font-medium">Erstellt:</span>{' '}
              {new Date(inserat.createdAt).toLocaleDateString('de-CH')}
            </div>
            <div>
              <span className="font-medium">Status:</span> {inserat.status}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Beschreibung</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{inserat.description}</p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Verkäufer</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{inserat.user.name || inserat.user.email}</p>
                {inserat.user.location && (
                  <p className="text-sm text-gray-600">{inserat.user.location}</p>
                )}
              </div>
              {isAuthenticated ? (
                user?.id !== inserat.userId ? (
                  <div className="space-y-2">
                    {inserat.user.phone && (
                      <a
                        href={`tel:${inserat.user.phone}`}
                        className="block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 text-center"
                      >
                        📞 {inserat.user.phone}
                      </a>
                    )}
                    <Link
                      to={`/chat/${inserat.id}`}
                      className="block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 text-center"
                    >
                      💬 Nachricht senden
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-500">Dies ist dein eigenes Inserat</p>
                )
              ) : (
                <Link
                  to="/login"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
                >
                  Anmelden für Kontakt
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InseratDetail;

