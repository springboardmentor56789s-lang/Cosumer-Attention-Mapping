import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ title, subtitle }) {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
      <div>
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>

      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="flex items-center gap-1 hover:text-blue-400 transition">
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          return (
            <React.Fragment key={name}>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              {isLast ? (
                <span className="font-semibold text-slate-200 capitalize">{name}</span>
              ) : (
                <Link to={routeTo} className="hover:text-blue-400 transition capitalize">
                  {name}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </div>
  );
}
