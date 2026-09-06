"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, WarningCircle } from "@phosphor-icons/react";
import { useAuth } from "@/lib/context/AuthContext";
import { ApiError } from "@/lib/api/client";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/app/roleplay";

  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (username.trim().length < 3) {
      setError("Nama pengguna minimal terdiri dari 3 karakter.");
      return;
    }
    if (password.length < 8) {
      setError("Kata sandi minimal terdiri dari 8 karakter.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      router.push(redirectUrl);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal membuat akun baru. Silakan periksa kembali data Anda.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page-shell">
      <div className="auth-page-card">
        <header className="auth-page-head">
          <Link href="/" className="brand-lockup group auth-brand">
            <Image
              src="/logo-finlen.svg"
              alt=""
              width={32}
              height={32}
              className="transition-transform duration-300 ease-in-out group-hover:-rotate-10"
            />
            <span className="brand-text">FinLen</span>
          </Link>
          <span className="eyebrow mt-4">Mulai Perjalanan Finansial</span>
          <h1 className="auth-page-title">Buat Akun FinLen</h1>
          <p className="auth-page-sub">
            Bergabunglah untuk menguji skenario utang, melatih naluri finansial di bawah tekanan AI, dan mengumpulkan XP.
          </p>
        </header>

        {error && (
          <div className="auth-error-banner" role="alert">
            <WarningCircle size={18} weight="bold" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-username">Nama Pengguna (Username)</label>
            <input
              id="reg-username"
              type="text"
              required
              minLength={3}
              maxLength={50}
              placeholder="misal: nara_explorer"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              autoComplete="username"
            />
            <span className="input-field-hint">Minimal 3 karakter, tanpa spasi</span>
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Alamat Email</label>
            <input
              id="reg-email"
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
            <label htmlFor="reg-password">Kata Sandi</label>
            <input
              id="reg-password"
              type="password"
              required
              minLength={8}
              maxLength={128}
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="new-password"
            />
            <span className="input-field-hint">Gunakan kombinasi huruf dan angka</span>
          </div>

          <button
            type="submit"
            className="button button-primary auth-page-submit-btn"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? "Mendaftarkan..." : "Daftar Akun Gratis"}</span>
            <span className="button-orb" aria-hidden="true">
              <ArrowRight size={16} weight="bold" />
            </span>
          </button>
        </form>

        <footer className="auth-page-foot">
          <p>
            Sudah memiliki akun?{" "}
            <Link
              href={`/login${redirectUrl !== "/app/roleplay" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="auth-switch-link"
            >
              Masuk di sini
            </Link>
          </p>
          <Link href="/" className="auth-back-home">
            &larr; Kembali ke Beranda
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page-fallback">
          <p>Memuat halaman pendaftaran...</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
