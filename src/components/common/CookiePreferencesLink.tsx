"use client";
export default function CookiePreferencesLink(){return <button onClick={()=>window.dispatchEvent(new Event("qurzaib-open-cookie-preferences"))} className="text-left transition hover:text-white">Cookie Preferences</button>}
