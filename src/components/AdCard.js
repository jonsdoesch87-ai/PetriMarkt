import { MapPin, Image as ImageIcon } from 'lucide-react';

const AdCard = ({ ad, onClick }) => (
  <div onClick={onClick} className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all cursor-pointer group">
    <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
      {ad.image ? (
        <img src={ad.image} className="w-full h-full object-cover" alt={ad.title} />
      ) : (
        <ImageIcon size={40} className="text-gray-200" />
      )}
      <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-lg text-xs font-black shadow-sm">CHF {ad.price}.-</div>
    </div>
    <div className="p-4">
      <h3 className="font-bold text-[#222f3e] truncate">{ad.title}</h3>
      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1"><MapPin size={12} /> {ad.kanton || 'Schweiz'}</p>
    </div>
  </div>
);
export default AdCard;
