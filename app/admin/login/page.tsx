"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Veuillez saisir votre mot de passe administrateur.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/admin");
      } else {
        setError(data.message || "Mot de passe incorrect.");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Erreur de connexion au serveur. Réessayez.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-gray-800/90 border border-gray-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-3 bg-gray-900/80 rounded-2xl border border-gray-700 mb-4 shadow-inner">
            <Logo size="md" isDark={true} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Espace Administrateur
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Gestion des commandes & confirmations COD
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2">
              Mot de passe d'accès (Secret Key)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Collez votre mot de passe ici..."
                className="w-full pl-10 pr-11 py-3 bg-gray-900/90 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                aria-label={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-gray-400 mt-2">
              💡 Vous pouvez enregistrer ce mot de passe dans votre navigateur pour vous connecter en 1 clic.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 text-sm transition-all cursor-pointer active:scale-98 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Vérification...</span>
              </>
            ) : (
              <>
                <span>Accéder au Tableau de Bord</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-700/60 text-center text-[11px] text-gray-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Session sécurisée HTTP-Only • Pratiko Maroc 🇲🇦</span>
        </div>
      </div>
    </div>
  );
}
