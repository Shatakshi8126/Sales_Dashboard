import React from 'react';
import {
  LayoutDashboard,
  BarChart2,
  ShoppingBag,
  CreditCard,
  FileText,
  Mail,
  CheckCircle2,
  Settings,
  LogOut,
  TrendingUp,
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, active: true },
  { icon: BarChart2 },
  { icon: ShoppingBag },
  { icon: CreditCard },
  { icon: FileText },
  { icon: Mail },
  { icon: CheckCircle2 },
];

export const Sidebar: React.FC = () => (
  <aside className="w-[72px] shrink-0 flex flex-col items-center py-6 gap-5">
    {/* Logo mark */}
    <div className="w-10 h-10 bg-green-800 rounded-2xl flex items-center justify-center shadow-green mb-2">
      <TrendingUp className="w-5 h-5 text-white" strokeWidth={2.5} />
    </div>

    {/* Nav icon pill */}
    <nav className="bg-white dark:bg-slate-900 rounded-2xl p-2 flex flex-col items-center gap-1 shadow-card">
      {NAV_ITEMS.map(({ icon: Icon, active }, i) => (
        <button
          key={i}
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            active
              ? 'bg-green-800 text-white shadow-md shadow-green-800/20'
              : 'text-slate-400 dark:text-slate-500 hover:bg-green-50 dark:hover:bg-slate-800 hover:text-green-700 dark:hover:text-green-400'
          }`}
        >
          <Icon className="w-[18px] h-[18px]" />
        </button>
      ))}
    </nav>

    {/* Bottom actions */}
    <div className="mt-auto flex flex-col items-center gap-2">
      <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-green-700 dark:hover:text-green-400 transition-colors">
        <Settings className="w-[18px] h-[18px]" />
      </button>
      <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-rose-500 transition-colors">
        <LogOut className="w-[18px] h-[18px]" />
      </button>
    </div>
  </aside>
);
