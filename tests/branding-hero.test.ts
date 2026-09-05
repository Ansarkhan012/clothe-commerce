import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),"utf8");
const navbar=read("../src/components/layout/Navbar.tsx"),footer=read("../src/components/layout/Footer.tsx"),hero=read("../src/components/home/HeroSection.tsx"),login=read("../src/app/admin-login/page.tsx");

test("all branded UI uses the same official logo asset",()=>{for(const source of [navbar,footer,login])assert.match(source,/\/images\/qurzaib-logo-display\.png/);for(const source of [navbar,footer,login])assert.doesNotMatch(source,/qurzaib-mark|images\/logo\.png/)});
test("official logo is always contained and never cropped",()=>{for(const source of [navbar,footer,login])assert.match(source,/object-contain/);for(const source of [navbar,footer,login])assert.doesNotMatch(source,/object-cover/)});
test("header has responsive readable logo dimensions",()=>{assert.match(navbar,/h-\[58px\] w-\[186px\]/);assert.match(navbar,/sm:h-\[64px\] sm:w-\[205px\]/);assert.match(navbar,/h-\[52px\] w-\[174px\]/);assert.match(navbar,/sizes=\{compact/)});
test("footer presents the transparent logo on a warm neutral panel",()=>{assert.match(footer,/bg-brand-cream p-4/);assert.match(footer,/w-\[260px\]/);assert.match(footer,/Elegance Woven With Faith/)});
test("hero uses the approved concise content and CTA hierarchy",()=>{assert.match(hero,/The New Collection/);assert.match(hero,/Fabrics made for/);assert.match(hero,/your finest moments\./);assert.match(hero,/Thoughtfully selected fabrics, timeless prints and elegant textures for every occasion\./);assert.match(hero,/Shop New Arrivals/);assert.match(hero,/Explore Collections/)});
test("hero heading, height, and image treatment stay responsive",()=>{assert.match(hero,/text-\[42px\]/);assert.match(hero,/clamp\(3\.5rem,5\.5vw,6\.5rem\)/);assert.match(hero,/min-h-\[600px\]/);assert.match(hero,/max-h-\[820px\]/);assert.match(hero,/object-\[40%_center\]/);assert.match(hero,/priority/);assert.match(hero,/sizes="100vw"/)});
