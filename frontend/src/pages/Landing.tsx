import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Logo/Title */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎣 PetriMarkt
          </h1>
          <p className="text-xl text-gray-600">
            Der Marktplatz für Fischerartikel
          </p>
        </div>

        {/* Description */}
        <div className="mb-12">
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Kaufen und verkaufen Sie Fischerartikel einfach und sicher. 
            Von Ruten und Rollen bis hin zu Ködern und Zubehör – hier finden Sie alles für Ihren Angelsport.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/browse"
            className="w-full sm:w-auto px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Stöbern
          </Link>
          
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors shadow-md hover:shadow-lg"
          >
            Login
          </Link>
          
          <Link
            to="/register"
            className="w-full sm:w-auto px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg border-2 border-primary-600 hover:bg-primary-50 transition-colors shadow-md hover:shadow-lg"
          >
            Anmelden
          </Link>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">Einfach finden</h3>
            <p className="text-gray-600">
              Durchsuchen Sie tausende Angebote und finden Sie genau das, was Sie brauchen
            </p>
          </div>
          
          <div className="p-6">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold mb-2">Direkt kommunizieren</h3>
            <p className="text-gray-600">
              Kontaktieren Sie Verkäufer direkt über unseren integrierten Chat
            </p>
          </div>
          
          <div className="p-6">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold mb-2">Sicher handeln</h3>
            <p className="text-gray-600">
              Kaufen und verkaufen Sie mit Vertrauen in unserer Community
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
