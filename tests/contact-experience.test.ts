import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("direct customer contact links use one public contact module", () => {
  const config = read("../src/lib/contact.ts");
  const footer = read("../src/components/layout/Footer.tsx");
  const contact = read("../src/app/contact/page.tsx");
  assert.match(config, /BUSINESS_EMAIL = "qurzaibfabrics@gmail\.com"/);
  assert.match(config, /BUSINESS_PHONE = "03136696456"/);
  assert.match(config, /BUSINESS_PHONE_TEL = "tel:\+923136696456"/);
  assert.match(config, /WHATSAPP_NUMBER = "923136696456"/);
  assert.match(config, /Assalamualaikum, I would like to know more about QurZaib Fabrics\./);
  for (const source of [footer, contact]) {
    assert.match(source, /BUSINESS_EMAIL/);
    assert.match(source, /BUSINESS_PHONE_TEL/);
    assert.match(source, /WHATSAPP_CONTACT_URL/);
    assert.match(source, /Mail/);
    assert.match(source, /Phone/);
    assert.match(source, /MessageCircle/);
  }
});

test("WhatsApp links are accessible and open safely in a new tab", () => {
  const footer = read("../src/components/layout/Footer.tsx");
  const contact = read("../src/app/contact/page.tsx");
  const floating = read("../src/components/contact/FloatingWhatsAppButton.tsx");
  for (const source of [footer, contact, floating]) {
    assert.match(source, /target="_blank"|target=\{method\.external \? "_blank"/);
    assert.match(source, /noopener noreferrer/);
  }
  assert.match(floating, /aria-label="Contact QurZaib Fabrics on WhatsApp"/);
  assert.match(floating, /safe-area-inset-bottom/);
});

test("floating WhatsApp access stays off admin routes and yields to cookie preferences", () => {
  const chrome = read("../src/components/layout/StorefrontChrome.tsx");
  const floating = read("../src/components/contact/FloatingWhatsAppButton.tsx");
  const cookies = read("../src/components/common/CookiePreferences.tsx");
  assert.match(chrome, /if \(isAdmin\) return children/);
  assert.match(chrome, /<FloatingWhatsAppButton \/>/);
  assert.match(floating, /qurzaib-cookie-visibility/);
  assert.match(floating, /if \(cookiePreferencesOpen\) return null/);
  assert.match(cookies, /qurzaib-cookie-visibility/);
});

test("the existing support request submission remains connected", () => {
  const contact = read("../src/app/contact/page.tsx");
  assert.match(contact, /fetch\("\/api\/support"/);
  assert.match(contact, /body: JSON\.stringify\(form\)/);
  assert.match(contact, /onSubmit=\{submit\}/);
});
