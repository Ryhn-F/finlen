"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, WarningCircle } from "@phosphor-icons/react";
import { useAuth } from "@/lib/context/AuthContext";
import { ApiError } from "@/lib/api/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/app/roleplay";

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      router.push(redirectUrl);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.userMessage);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal masuk ke akun. Silakan periksa kembali email dan kata sandi Anda.");
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
          <span className="eyebrow mt-4">Autentikasi FinLen</span>
          <h1 className="auth-page-title">Selamat Datang Kembali</h1>
          <p className="auth-page-sub">
            Masuk untuk melanjutkan simulasi, bermain peran AI, dan melihat perkembangan Naluri Finansialmu.
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
            <label htmlFor="login-email">Alamat Email</label>
            <input
              id="login-email"
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
            <label htmlFor="login-password">Kata Sandi</label>
            <input
              id="login-password"
              type="password"
              required
              placeholder="Masukkan kata sandi Anda"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="button button-primary auth-page-submit-btn"
            disabled={isSubmitting}
          >
            <span>{isSubmitting ? "Memproses..." : "Masuk ke Akun"}</span>
            <span className="button-orb" aria-hidden="true">
              <ArrowRight size={16} weight="bold" />
            </span>
          </button>
        </form>

        <footer className="auth-page-foot">
          <p>
            Belum punya akun?{" "}
            <Link
              href={`/register${redirectUrl !== "/app/roleplay" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="auth-switch-link"
            >
              Daftar akun baru
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page-fallback">
          <p>Memuat halaman masuk...</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
