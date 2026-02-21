
import React from 'react';
import { Link } from 'wouter';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <header className="bg-primary text-white py-6 shadow-md border-b-4 border-secondary">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="cursor-pointer">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-wide uppercase">Mellino Law</h1>
              <span className="text-xs md:text-sm text-secondary tracking-widest uppercase font-medium">Maternity Care Finder</span>
            </div>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium">
             <a href="#" className="hover:text-secondary transition-colors">Our Firm</a>
             <a href="#" className="hover:text-secondary transition-colors">Practice Areas</a>
             <a href="#" className="hover:text-secondary transition-colors">Results</a>
             <a href="#" className="hover:text-secondary transition-colors">Contact</a>
          </nav>
        </div>
      </header>
      
      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 mt-12">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-sm">
            <div>
                <h4 className="text-white font-serif text-lg mb-4">Mellino Law Firm</h4>
                <p>Dedicated to justice. Helping those injured by medical malpractice & catastrophic accidents.</p>
            </div>
            <div>
                <h4 className="text-white font-serif text-lg mb-4">Contact</h4>
                <p>19704 Center Ridge Road<br/>Rocky River, OH, 44116</p>
                <p className="mt-2">(440) 333-3800</p>
            </div>
            <div>
                <h4 className="text-white font-serif text-lg mb-4">Disclaimer</h4>
                <p className="text-xs leading-relaxed">
                    The information provided by this Maternity Care Finder is for educational purposes only. It does not constitute medical or legal advice. Hospital quality metrics are based on publicly available CMS data.
                </p>
            </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-xs">
            &copy; {new Date().getFullYear()} Mellino Law Firm. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
