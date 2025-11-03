import { Search } from 'lucide-react';

/**
 * SearchBar Component - Barra de búsqueda del header
 * Simplificado y reutilizable para desktop y móvil
 */
interface SearchBarProps {
  isMobile?: boolean;
}

export default function SearchBar({ isMobile = false }: SearchBarProps) {
  if (isMobile) {
    return (
      <div className="md:hidden pb-4">
        <div className="flex items-center bg-slate-700/50 rounded-full px-4 py-3 border border-slate-600/50">
          <Search className="h-4 w-4 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Where are you going?"
            className="bg-transparent text-white placeholder-slate-400 outline-none flex-1 text-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex items-center bg-slate-700/50 rounded-full px-6 py-3 border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 max-w-md mx-8">
      <Search className="h-4 w-4 text-slate-400 mr-3" />
      <input
        type="text"
        placeholder="Madrid"
        className="bg-transparent text-white placeholder-slate-400 outline-none flex-1 text-sm"
      />
      <div className="text-slate-400 text-sm mx-3">•</div>
      <span className="text-slate-400 text-sm"> Sep 11 - 14 • 2 guest</span>
      <button className="ml-3 bg-[#FF385C] hover:bg-[#E31C5F] text-white p-2 rounded-full transition-colors duration-200">
        <Search className="h-4 w-4" />
      </button>
    </div>
  );
}
