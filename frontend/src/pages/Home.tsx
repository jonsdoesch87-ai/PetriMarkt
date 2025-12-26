import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inserat } from '../types';
import { getInserate } from '../services/inserateService';
import InseratCard from '../components/InseratCard';

const Home = () => {
  const [inserate, setInserate] = useState<Inserat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchInserate();
  }, [category]);

  const fetchInserate = async () => {
    try {
      setLoading(true);
      const data = await getInserate({
        category: category || undefined,
        search: searchTerm || undefined,
      });
      setInserate(data);
    } catch (error) {
      console.error('Fehler beim Laden der Inserate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInserate();
  };

  const filteredInserate = inserate.filter(inserat =>
    searchTerm === '' || 
    inserat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inserat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Fischerartikel kaufen & verkaufen
        </h1>
        
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Suche nach Inseraten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Alle Kategorien</option>
              <option value="Ruten">Ruten</option>
              <option value="Rollen">Rollen</option>
              <option value="Köder">Köder</option>
              <option value="Zubehör">Zubehör</option>
              <option value="Kleidung">Kleidung</option>
              <option value="Sonstiges">Sonstiges</option>
            </select>
            <button
              type="submit"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
            >
              Suchen
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Lade Inserate...</p>
        </div>
      ) : filteredInserate.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine Inserate gefunden.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInserate.map((inserat) => (
            <InseratCard key={inserat.id} inserat={inserat} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;


