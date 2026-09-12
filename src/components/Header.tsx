import { ShieldCheck, Languages } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export function Header() {
  const { language, toggleLanguage } = useLanguage();
  return (
    <header className="sticky top-0 z-40 bg-[#008753] text-white shadow-md">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-7 h-7" strokeWidth={2.5} />
          <div>
            <h1 className="text-lg font-bold leading-tight">VerifyNG</h1>
            <p className="text-[10px] text-white/80 leading-tight">
              {language === 'english' ? 'Verify Before You Pay' : 'Check Well Before You Pay'}
            </p>
          </div>
        </div>
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:scale-95 transition-all px-3 py-1.5 rounded-full text-xs font-semibold"
        >
          <Languages className="w-4 h-4" />
          {language === 'english' ? 'Pidgin' : 'English'}
        </button>
      </div>
    </header>
  );
}
