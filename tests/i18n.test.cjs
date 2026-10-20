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

test('pricing offers preserve the published calculations and scope limits', () => {
    const prices = catalog('locales/en.json');
    const projectAmount = Number(prices['pricing.project.price'].match(/[\d,]+/)[0].replaceAll(',', ''));
    const monthlyAmount = Number(prices['pricing.monthly.price'].match(/[\d,]+/)[0].replaceAll(',', ''));
    const annualAmount = Number(prices['pricing.annual.price'].match(/[\d,]+/)[0].replaceAll(',', ''));
    const dailyAmount = Number(prices['pricing.mandate.price'].match(/[\d,]+/)[0].replaceAll(',', ''));
    const monthlyHours = Number(prices['pricing.monthly.scope1'].match(/\d+/)[0]);
    const annualHours = Number(prices['pricing.annual.scope1'].match(/\d+/g).at(-1));

    assert.equal(projectAmount, 2500);
    assert.equal(monthlyAmount, 1000);
    assert.equal(monthlyAmount / monthlyHours, 100);
    assert.equal(annualAmount, 10800);
    assert.equal(annualAmount / 12, 900);
    assert.match(prices['pricing.annual.summary'], /€900\/month equivalent/i);
    assert.equal(annualHours, 120);
    assert.equal(annualAmount / annualHours, 90);
    assert.equal(Math.round((1 - annualAmount / (monthlyAmount * 12)) * 100), 10);
    assert.equal(dailyAmount, 900);
    assert.equal(dailyAmount / 8, 112.5);
    assert.match(prices['pricing.mandate.conditions'], /€112\.50 per hour/);
    assert.match(prices['pricing.annual.discount'], /10%.*1,200/);
    assert.match(prices['pricing.project.conditions'], /not a complete custom application/i);
    assert.match(prices['pricing.monthly.conditions'], /not unlimited development/i);
    assert.match(prices['pricing.annual.conditions'], /not unlimited support/i);
    assert.match(prices['pricing.mandate.conditions'], /no annual utilization/i);
    assert.match(prices['pricing.market.description'], /September 2026.*2,337.*October 2026.*2,970.*not verified invoices/i);
    for (const language of languages) {
        const dictionary = catalog(`locales/${language}.json`);
        const annualSummary = dictionary['pricing.annual.summary'];
        const mandateAmount = Number(dictionary['pricing.mandate.price'].match(/[\d,]+(?:\.\d+)?/)[0].replaceAll(',', ''));
        assert.match(annualSummary, /900/, `${language}: monthly equivalent`);
        assert.equal(mandateAmount, 900, `${language}: daily guide price`);
        assert.match(dictionary['pricing.mandate.conditions'], /112[.,]50/, `${language}: hourly equivalent`);
    }

    const html = read('index.html');
    const pricing = html.slice(html.indexOf('id="pricing-main"'), html.indexOf('<!-- CONTACT -->'));
    assert.equal((pricing.match(/href="#contact-main" data-i18n="pricing\./g) || []).length, 4);
    assert.equal((pricing.match(/target="_blank" rel="noopener noreferrer" data-i18n="pricing\.market\.source\d" data-i18n-aria-label=/g) || []).length, 2);
    assert.match(pricing, /pricing-vat/);
});
