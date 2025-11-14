// This file is kept for logical structure, but the core logic has been
// integrated directly into LanguageContext.tsx to co-locate state and provider logic.
// The primary hook to be used throughout the app is `useLanguage` from LanguageContext.
// This simplifies the implementation by removing one layer of abstraction.

// You can safely remove this file if you prefer, as its functionality is now
// part of contexts/LanguageContext.tsx. To use the translations, import `useLanguage`.

/*
Example usage in a component:

import { useLanguage } from '../contexts/LanguageContext';

const MyComponent = () => {
    const { t, setLanguage, language } = useLanguage();

    return (
        <div>
            <h1>{t('welcomeMessage')}</h1>
            <button onClick={() => setLanguage('es')}>Switch to Spanish</button>
        </div>
    )
}

*/
export {};
