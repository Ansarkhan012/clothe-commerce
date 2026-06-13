// // src/app/admin-login/page.tsx
// 'use client';

// import { useState } from 'react';
// import { createClient } from '@/src/lib/supabase/Client';
// import { useRouter } from 'next/navigation';
// import { ShieldCheck } from 'lucide-react';

// export default function AdminLogin() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
  
//   const supabase = createClient();
//   const router = useRouter();

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     // Supabase cloud auth verification request
//     const { error: authError } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (authError) {
//       setError('Ghalat credentials! Aap admin nahi hain.');
//       setLoading(false);
//       return;
//     }

//     // Success! Redirect straight to the order dashboard panel
//     router.push('/admin-portal');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-gray-100 shadow-xl">
//         <div className="text-center mb-6">
//           <ShieldCheck className="h-12 w-12 text-indigo-600 mx-auto mb-2" />
//           <h2 className="text-2xl font-black text-gray-900 uppercase">Karachi Apparel</h2>
//           <p className="text-xs text-gray-400 font-bold tracking-wide uppercase mt-1">Authorized Admins Only</p>
//         </div>

//         <form onSubmit={handleLogin} className="space-y-4">
//           {error && (
//             <div className="bg-red-50 text-red-700 text-xs p-3 rounded-xl border border-red-200 font-medium text-center">
//               {error}
//             </div>
//           )}

//           <div>
//             <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Admin Email</label>
//             <input 
//               type="email" 
//               required
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               placeholder="admin@email.com"
//               className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Secret Password</label>
//             <input 
//               type="password" 
//               required
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               placeholder="••••••••"
//               className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl hover:bg-black transition disabled:bg-gray-300 shadow-md"
//           >
//             {loading ? 'Verifying Admin Authority...' : 'Secure Access System'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Your Supabase auth logic here
    setTimeout(() => {
      router.push("/admin-portal");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-border p-8 sm:p-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-accent mb-4">
            <Lock size={28} />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary">Admin Portal</h1>
          <p className="text-muted text-sm mt-2">Authorized personnel only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none transition-colors"
              placeholder="admin@zaritaanka.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-bg border border-border focus:border-accent focus:outline-none transition-colors pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}