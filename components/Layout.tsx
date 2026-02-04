import React from 'react';
import { Cpu, Terminal } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  onNavigateHome: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-brand-500/30">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-black/80 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onNavigateHome}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-md flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Terminal size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Firmware<span className="text-brand-400">Utils</span></span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-slate-500 hidden sm:block">v1.0.3</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Firmware Engineering Utils. Built for speed and accuracy.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;