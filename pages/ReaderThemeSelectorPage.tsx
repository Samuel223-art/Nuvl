import React from 'react';

// Common header for static pages
const StaticPageHeader: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <header className="sticky top-0 z-10 bg-neutral-900">
    <div className="relative flex items-center justify-center py-4 px-4">
      <button onClick={onBack} className="absolute left-4 text-white" aria-label="Go back">
        <i className="fas fa-chevron-left text-2xl"></i>
      </button>
      <h1 className="text-xl font-bold text-white">{title}</h1>
    </div>
  </header>
);

export type Theme = 'dark' | 'light' | 'sepia';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl';

interface ReaderSettings {
    theme: Theme;
    fontSize: FontSize;
}

interface ReaderThemeSelectorPageProps {
    onBack: () => void;
    settings: ReaderSettings;
    onUpdateSettings: (newSettings: Partial<ReaderSettings>) => void;
}

const fontSizes: FontSize[] = ['sm', 'base', 'lg', 'xl'];

const ReaderThemeSelectorPage: React.FC<ReaderThemeSelectorPageProps> = ({ onBack, settings, onUpdateSettings }) => {

    const themeConfig: Record<Theme, {bg: string, text: string, name: string}> = {
        dark: { bg: 'bg-neutral-800', text: 'text-neutral-300', name: 'Dark' },
        light: { bg: 'bg-white', text: 'text-neutral-800', name: 'Light' },
        sepia: { bg: 'bg-[#FBF0D9]', text: 'text-[#5B4636]', name: 'Sepia' },
    };
    
    const handleFontSizeChange = (direction: 'increase' | 'decrease') => {
        const currentIndex = fontSizes.indexOf(settings.fontSize);
        if (direction === 'increase' && currentIndex < fontSizes.length - 1) {
            onUpdateSettings({ fontSize: fontSizes[currentIndex + 1] });
        }
        if (direction === 'decrease' && currentIndex > 0) {
            onUpdateSettings({ fontSize: fontSizes[currentIndex - 1] });
        }
    };
    
    return (
        <div>
            <StaticPageHeader title="Reader Display" onBack={onBack} />
            <main className="px-4 py-6 space-y-8">
                <section>
                    <h2 className="text-sm font-bold text-neutral-500 uppercase px-4 pb-2">Theme</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {Object.entries(themeConfig).map(([key, value]) => (
                            <button
                                key={key}
                                onClick={() => onUpdateSettings({ theme: key as Theme })}
                                className={`p-4 rounded-lg border-2 ${settings.theme === key ? 'border-primary' : 'border-neutral-700'}`}
                            >
                                <div className={`h-16 w-full rounded ${value.bg}`}></div>
                                <p className="mt-2 font-semibold text-white">{value.name}</p>
                            </button>
                        ))}
                    </div>
                </section>

                <section>
                    <h2 className="text-sm font-bold text-neutral-500 uppercase px-4 pb-2">Font Size</h2>
                     <div className="bg-neutral-800 p-4 rounded-lg flex items-center justify-between">
                        <button onClick={() => handleFontSizeChange('decrease')} className="w-12 h-12 rounded-full hover:bg-neutral-700 flex items-center justify-center font-bold text-3xl" aria-label="Decrease font size">
                            A-
                        </button>
                        <span className="text-2xl uppercase font-mono">{settings.fontSize}</span>
                         <button onClick={() => handleFontSizeChange('increase')} className="w-12 h-12 rounded-full hover:bg-neutral-700 flex items-center justify-center font-bold text-3xl" aria-label="Increase font size">
                            A+
                        </button>
                    </div>
                </section>
                
                <section>
                    <h2 className="text-sm font-bold text-neutral-500 uppercase px-4 pb-2">Preview</h2>
                    <div className={`${themeConfig[settings.theme].bg} ${themeConfig[settings.theme].text} p-4 rounded-lg`}>
                        <p className={`transition-all duration-300 ${settings.fontSize === 'sm' ? 'text-sm' : settings.fontSize === 'lg' ? 'text-lg' : settings.fontSize === 'xl' ? 'text-xl' : 'text-base'}`}>
                            The quick brown fox jumps over the lazy dog. In the heart of the ancient forest, where sunlight dappled through the dense canopy, a lone traveler paused to catch his breath.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ReaderThemeSelectorPage;
