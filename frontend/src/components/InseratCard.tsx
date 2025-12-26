import { Link } from 'react-router-dom';
import { Inserat } from '../types';

interface InseratCardProps {
  inserat: Inserat;
}

const InseratCard = ({ inserat }: InseratCardProps) => {
  return (
    <Link to={`/inserat/${inserat.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-48 bg-gray-200 flex items-center justify-center">
          {inserat.images && inserat.images.length > 0 ? (
            <img 
              src={inserat.images[0]} 
              alt={inserat.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400">Kein Bild</span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{inserat.title}</h3>
          <p className="text-primary-600 font-bold text-xl mb-2">
            CHF {inserat.price.toFixed(2)}
          </p>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {inserat.description}
          </p>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{inserat.location}</span>
            <span className="px-2 py-1 bg-gray-100 rounded">
              {inserat.category}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default InseratCard;


