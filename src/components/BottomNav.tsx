import { Home, AlertCircle, ListChecks, BadgeCheck, Info } from 'lucide-react';

export type Tab = 'home' | 'report' | 'feed' | 'business' | 'about';

type BottomNavProps = {
  active: Tab;
  onChange: (tab: Tab) => void;
};

const NAV_ITEMS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'report', label: 'Report', icon: AlertCircle },
  { id: 'feed', label: 'Scams', icon: ListChecks },
  { id: 'business', label: 'Verify', icon: BadgeCheck },
  { id: 'about', label: 'About', icon: Info },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around max-w-lg mx-auto px-1 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all active:scale-90 ${
                isActive ? 'text-[#008753]' : 'text-gray-400'
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? 'fill-[#008753]/10' : ''}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
