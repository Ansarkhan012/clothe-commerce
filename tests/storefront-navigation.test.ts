import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");

test("public desktop and mobile navigation expose no admin entry point", () => {
  const navbar = read("../src/components/layout/Navbar.tsx");
  const footer = read("../src/components/layout/Footer.tsx");

  assert.doesNotMatch(navbar, /href=["'{`]\/admin(?:-login|\/|["'}`])/i);
  assert.doesNotMatch(navbar, />\s*Admin(?: Login)?\s*</i);
  assert.doesNotMatch(footer, /href=["'{`]\/admin(?:-login|\/|["'}`])/i);
  assert.doesNotMatch(footer, />\s*Admin(?: Login)?\s*</i);
});

test("admin login remains available and successful login opens the dashboard", () => {
  assert.equal(existsSync(new URL("../src/app/admin-login/page.tsx", import.meta.url)), true);
  const login = read("../src/app/admin-login/page.tsx");

  assert.match(login, /profile\?\.role !== "admin"/);
  assert.match(login, /router\.push\("\/admin"\)/);
});

test("admin proxy still requires authentication and the admin role", () => {
  const proxy = read("../src/proxy.ts");

  assert.match(proxy, /matcher: \['\/admin\/:path\*'\]/);
  assert.match(proxy, /if \(!user\)[\s\S]*\/admin-login/);
  assert.match(proxy, /profile\?\.role !== 'admin'[\s\S]*\/admin-login\?error=forbidden/);
});
