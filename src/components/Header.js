const Header = ({ setView, profile, setShowUserMenu, showUserMenu }) => (
  <header className="bg-white border-b border-[#eee] sticky top-0 z-50">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
        <div className="w-9 h-9 bg-[#576574] rounded-xl flex items-center justify-center text-white shadow-sm">
          <Fish size={24} />
        </div>
        <h1 className="text-xl font-black tracking-tight text-[#222f3e] hidden sm:block">PetriMarkt</h1>
      </div>
      ...
    </div>
  </header>
);
export default Header;
