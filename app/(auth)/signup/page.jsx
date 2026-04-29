"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const password = form.get("password");
    const confirm  = form.get("confirm");

    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email:      form.get("email"),
        password,
        name:       form.get("name"),
        Sofinummer: form.get("Sofinummer"),
        telephone:  form.get("telephone"),
        adresse:    form.get("adresse"),
        kvknr:      form.get("kvknr") || undefined,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      setLoading(false);
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">

        {/* Icon */}
        <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-6">
          <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </div>

        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Créer un compte</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Commencez gratuitement dès aujourd'hui.</p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Identity ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Nom complet <span className="text-red-400">*</span>
              </label>
              <input
                name="name"
                type="text"
                placeholder="Jean Dupont"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Sofinummer <span className="text-red-400">*</span>
              </label>
              <input
                name="Sofinummer"
                type="text"
                placeholder="123456789"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Téléphone <span className="text-red-400">*</span>
              </label>
              <input
                name="telephone"
                type="tel"
                placeholder="+32 470 00 00 00"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Adresse <span className="text-red-400">*</span>
              </label>
              <textarea
                name="adresse"
                rows={2}
                placeholder="Rue de la Paix 1, 1000 Bruxelles"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                KVK-nummer <span className="text-slate-400 font-normal">(optionnel)</span>
              </label>
              <input
                name="kvknr"
                type="text"
                placeholder="12345678"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
            <span className="text-xs text-slate-400 font-medium">Connexion</span>
            <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
          </div>

          {/* ── Auth ── */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              Email <span className="text-red-400">*</span>
            </label>
            <input
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Mot de passe <span className="text-red-400">*</span>
              </label>
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                Confirmer <span className="text-red-400">*</span>
              </label>
              <input
                name="confirm"
                type="password"
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <p className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold py-2.5 rounded-xl text-sm hover:bg-slate-700 dark:hover:bg-slate-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}