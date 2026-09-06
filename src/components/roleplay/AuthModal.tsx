"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, User, X } from "@phosphor-icons/react";
import { useAuth } from "@/lib/context/AuthContext";
import { ApiError } from "@/lib/api/client";

export function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">(authModalMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync mode if authModalMode changed
  if (!isAuthModalOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email: email.trim(), password });
      } else {
        if (!username.trim()) {
          setError("Nama pengguna harus diisi (minimal 3 karakter).");
          setIsSubmitting(false);
          return;
        }
        await register({
          username: username.trim(),
          email: email.trim(),
          password,
        });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal memproses autentikasi. Silakan periksa data Anda.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-modal-backdrop" onClick={closeAuthModal}>
      <div
        className="auth-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="auth-modal-close"
          onClick={closeAuthModal}
          aria-label="Tutup jendela masuk"
        >
          <X size={20} weight="bold" />
        </button>

        <div className="auth-modal-header">
          <div className="auth-icon-badge" aria-hidden="true">
            <User size={24} weight="duotone" />
          </div>
          <h2 id="auth-modal-title">
            {mode === "login" ? "Masuk ke FinLen" : "Buat Akun FinLen"}
          </h2>
          <p>
            {mode === "login"
              ? "Lanjutkan roleplay dan pantau perkembangan skor Naluri Finansialmu."
              : "Daftar gratis untuk menyimpan sesi roleplay dan XP progresmu."}
          </p>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={`auth-tab ${mode === "login" ? "is-active" : ""}`}
            onClick={() => {
              setMode("login");
              setError(null);
            }}
          >
            Masuk
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={`auth-tab ${mode === "register" ? "is-active" : ""}`}
            onClick={() => {
              setMode("register");
              setError(null);
            }}
          >
            Daftar Baru
          </button>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="form-group">
              <label htmlFor="auth-username">Nama Pengguna (Username)</label>
              <input
                id="auth-username"
                type="text"
                required
                minLength={3}
                maxLength={50}
                placeholder="misal: rayhan_fin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                autoComplete="username"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="auth-email">Alamat Email</label>
            <input
              id="auth-email"
              type="email"
              required
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="auth-password">Kata Sandi</label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          <button
            type="submit"
            className="button button-primary auth-submit-btn"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? "Memproses..." : mode === "login" ? "Masuk Sekarang" : "Daftar Akun"}</span>
            <span className="button-orb" aria-hidden="true">
              <ArrowRight size={16} weight="bold" />
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
