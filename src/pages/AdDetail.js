const Detail = ({ selectedAd, setView }) => (
  <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl flex flex-col md:flex-row">
    <div className="md:w-1/2 bg-gray-100 aspect-square md:aspect-auto">
      {selectedAd.image ? (
        <img src={selectedAd.image} className="w-full h-full object-cover" alt={selectedAd.title} />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300">
          <ImageIcon size={64} />
        </div>
      )}
    </div>
    <div className="md:w-1/2 p-8 flex flex-col">
      ...
    </div>
  </div>
);

export default Detail;
