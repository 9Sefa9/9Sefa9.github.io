const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const languages = ['en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ur', 'de'];
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const catalog = relativePath => JSON.parse(read(relativePath));

for (const folder of ['locales', 'locales/legal']) {
    test(`${folder}: all eleven catalogs have identical nonempty string keys`, () => {
        const expected = Object.keys(catalog(`${folder}/en.json`)).sort();
        for (const language of languages) {
            const dictionary = catalog(`${folder}/${language}.json`);
            assert.deepEqual(Object.keys(dictionary).sort(), expected, language);
            for (const [key, value] of Object.entries(dictionary)) {
                assert.equal(typeof value, 'string', `${language}: ${key}`);
                assert.ok(value.trim(), `${language}: ${key}`);
            }
        }
    });
}

for (const file of ['index.html', 'impressum.html']) {
    test(`${file}: every translation hook has a dictionary entry`, () => {
        const html = read(file);
        const dictionary = {
            ...catalog('locales/en.json'),
            ...(file === 'impressum.html' ? catalog('locales/legal/en.json') : {})
        };
        const hooks = [...html.matchAll(/data-i18n(?:-(?:aria-label|alt|title|content))?="([^"]+)"/g)];
        assert.ok(hooks.length > 20);
        for (const [, key] of hooks) assert.ok(dictionary[key], `${file}: ${key}`);
        assert.match(html, /src="js\/i18n\.js" defer/);
    });
}

test('all language flags are local valid PNG images', () => {
    for (const flag of ['gb', 'cn', 'in', 'es', 'fr', 'sa', 'bd', 'br', 'ru', 'pk', 'de']) {
        const image = fs.readFileSync(path.join(root, `img/flags/${flag}.png`));
        assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', flag);
    }
});
