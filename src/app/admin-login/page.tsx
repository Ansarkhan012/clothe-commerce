"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/Client";

export default function AdminLoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError("Invalid email or password");
        return;
      }

      if (!data.user) {
        setError("Login failed");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles").select("role").eq("id", data.user.id).maybeSingle();
      if (profileError || profile?.role !== "admin") {
        await supabase.auth.signOut();
        setError("This account is not authorized for administration");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-surface border border-border p-8 sm:p-12">

        <div className="text-center mb-8">
          <Image src="/images/qurzaib-logo-display.png" alt="Qurzaib Fabrics" width={500} height={312} sizes="208px" priority className="mx-auto mb-4 h-auto w-52 object-contain" />

          <h1 className="font-display text-3xl font-bold text-primary">
            QurZaib Fabrics Admin
          </h1>

          <p className="text-muted text-sm mt-2">
            Authorized personnel only
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Email
            </label>

            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-border"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border pr-12"
                placeholder="••••••••"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-4 disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>

        </form>
      </div>
    </div>
  );
}
