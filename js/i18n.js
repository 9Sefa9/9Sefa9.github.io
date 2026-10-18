(function () {
    'use strict';

    const languages = [
        { code: 'en', name: 'English', flag: 'gb' },
        { code: 'zh', name: '中文', flag: 'cn' },
        { code: 'hi', name: 'हिन्दी', flag: 'in' },
        { code: 'es', name: 'Español', flag: 'es' },
        { code: 'fr', name: 'Français', flag: 'fr' },
        { code: 'ar', name: 'العربية', flag: 'sa' },
        { code: 'bn', name: 'বাংলা', flag: 'bd' },
        { code: 'pt', name: 'Português', flag: 'br' },
        { code: 'ru', name: 'Русский', flag: 'ru' },
        { code: 'ur', name: 'اردو', flag: 'pk' },
        { code: 'de', name: 'Deutsch', flag: 'de' }
    ];
    const storageKey = 'portfolio.language';
    const dictionaries = new Map();
    const legalPage = document.body.dataset.i18nPage === 'legal';
    const host = document.querySelector('.nav-actions') || document.querySelector('header nav');
    if (!host) return;

    let requestId = 0;
    let currentLanguage = 'en';
    let currentDictionary = {};
    let preference = readPreference();

    function readPreference() {
        try {
            const stored = localStorage.getItem(storageKey);
            return languages.some(language => language.code === stored) ? stored : 'auto';
        } catch {
            return 'auto';
        }
    }

    function detectLanguage() {
        const preferences = navigator.languages && navigator.languages.length
            ? navigator.languages : [navigator.language || 'en'];
        for (const locale of preferences) {
            const code = locale.toLowerCase().replace(/_/g, '-').split('-')[0];
            if (languages.some(language => language.code === code)) return code;
        }
        return 'en';
    }

    async function loadDictionary(code) {
        if (!dictionaries.has(code)) {
            const paths = [`locales/${code}.json`];
            if (legalPage) paths.push(`locales/legal/${code}.json`);
            const pending = Promise.all(paths.map(async path => {
                const response = await fetch(path);
                if (!response.ok) throw new Error(`Translation request failed: ${response.status}`);
                const dictionary = await response.json();
                if (!dictionary || Array.isArray(dictionary) || typeof dictionary !== 'object'
                    || Object.values(dictionary).some(value => typeof value !== 'string' || !value.trim())) {
                    throw new Error('Invalid translation dictionary');
                }
                return dictionary;
            })).then(parts => Object.assign({}, ...parts));
            dictionaries.set(code, pending);
            pending.catch(() => dictionaries.delete(code));
        }
        return dictionaries.get(code);
    }

    const picker = document.createElement('details');
    picker.className = 'language-picker';
    picker.dir = 'ltr';
    const trigger = document.createElement('summary');
    trigger.className = 'language-trigger';
    trigger.setAttribute('aria-controls', 'language-options');
    const selectedFlag = document.createElement('img');
    selectedFlag.width = 24;
    selectedFlag.height = 18;
    selectedFlag.alt = '';
    const selectedName = document.createElement('span');
    selectedName.className = 'language-name';
    selectedName.dir = 'auto';
    trigger.append(selectedFlag, selectedName);
    const options = document.createElement('div');
    options.id = 'language-options';
    options.className = 'language-options';
    options.setAttribute('role', 'group');
    const automatic = document.createElement('button');
    automatic.type = 'button';
    automatic.dataset.language = 'auto';
    automatic.dir = 'auto';
    options.append(automatic);

    for (const language of languages) {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.language = language.code;
        button.lang = language.code;
        const image = document.createElement('img');
        image.src = `img/flags/${language.flag}.png`;
        image.width = 24;
        image.height = 18;
        image.alt = '';
        const name = document.createElement('span');
        name.textContent = language.name;
        name.dir = 'auto';
        button.append(image, name);
        options.append(button);
    }

    const status = document.createElement('p');
    status.className = 'language-status';
    status.setAttribute('role', 'alert');
    status.hidden = true;
    options.append(status);
    picker.append(trigger, options);
    host.append(picker);

    function updatePicker() {
        const language = languages.find(item => item.code === currentLanguage);
        const label = currentDictionary['language.label'] || 'Language';
        selectedFlag.src = `img/flags/${language.flag}.png`;
        selectedName.textContent = language.name;
        selectedName.lang = language.code;
        trigger.title = label;
        trigger.setAttribute('aria-label', `${label}: ${language.name}`);
        options.setAttribute('aria-label', label);
        automatic.textContent = currentDictionary['language.auto'] || 'Automatic';
        options.querySelectorAll('button').forEach(button => {
            button.setAttribute('aria-pressed', String(button.dataset.language === preference));
        });
    }

    function applyDictionary(dictionary, code) {
        document.documentElement.lang = code;
        document.documentElement.dir = ['ar', 'ur'].includes(code) ? 'rtl' : 'ltr';
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const text = dictionary[element.dataset.i18n];
            if (typeof text === 'string') element.textContent = text;
        });
        for (const attribute of ['aria-label', 'title', 'alt', 'content']) {
            document.querySelectorAll(`[data-i18n-${attribute}]`).forEach(element => {
                const text = dictionary[element.getAttribute(`data-i18n-${attribute}`)];
                if (typeof text === 'string') element.setAttribute(attribute, text);
            });
        }
        const structuredData = document.querySelector('script[type="application/ld+json"]');
        if (structuredData && !legalPage) {
            const profile = JSON.parse(structuredData.textContent);
            profile.inLanguage = code;
            profile.name = dictionary['page.title'];
            profile.mainEntity.jobTitle = dictionary['intro.role'];
            profile.mainEntity.description = dictionary['page.description'];
            structuredData.textContent = JSON.stringify(profile);
        }
        currentLanguage = code;
        currentDictionary = dictionary;
        updatePicker();
    }

    async function changeLanguage(nextPreference, persist = false) {
        const pendingId = ++requestId;
        const code = nextPreference === 'auto' ? detectLanguage() : nextPreference;
        status.hidden = true;
        picker.setAttribute('aria-busy', 'true');
        try {
            const english = await loadDictionary('en');
            const translated = code === 'en' ? english : await loadDictionary(code);
            if (pendingId !== requestId) return;
            preference = nextPreference;
            applyDictionary({ ...english, ...translated }, code);
            if (persist) {
                try {
                    if (preference === 'auto') localStorage.removeItem(storageKey);
                    else localStorage.setItem(storageKey, preference);
                } catch {}
            }
        } catch {
            if (pendingId !== requestId) return;
            if (!Object.keys(currentDictionary).length) {
                try {
                    const english = await loadDictionary('en');
                    if (pendingId !== requestId) return;
                    preference = 'auto';
                    applyDictionary(english, 'en');
                } catch {}
            }
            status.textContent = currentDictionary['language.error']
                || 'The language could not be loaded. Please try again.';
            status.hidden = false;
            picker.open = true;
        } finally {
            if (pendingId === requestId) picker.removeAttribute('aria-busy');
        }
    }

    options.addEventListener('click', event => {
        const button = event.target.closest('button[data-language]');
        if (!button) return;
        picker.open = false;
        trigger.focus();
        changeLanguage(button.dataset.language, true);
    });

    document.addEventListener('click', event => {
        if (!picker.contains(event.target)) picker.open = false;
    });

    picker.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            picker.open = false;
            trigger.focus();
        }
        if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        picker.open = true;
        const buttons = Array.from(options.querySelectorAll('button'));
        const index = buttons.indexOf(document.activeElement);
        let nextIndex = event.key === 'ArrowUp' ? index - 1 : index + 1;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = buttons.length - 1;
        buttons[(nextIndex + buttons.length) % buttons.length].focus();
    });

    window.addEventListener('storage', event => {
        if (event.key === storageKey || event.key === null) changeLanguage(readPreference());
    });
    window.addEventListener('languagechange', () => {
        if (preference === 'auto') changeLanguage('auto');
    });

    updatePicker();
    changeLanguage(preference);
})();
