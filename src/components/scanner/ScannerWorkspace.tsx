"use client";

import { useState } from "react";
import {
  ArrowClockwise,
  Coins,
  Flag,
  GraduationCap,
  LockKey,
  ShieldWarning,
  SignIn,
  UploadSimple,
  UserPlus,
  WarningCircle,
} from "@phosphor-icons/react";
import {
  AppSidebar,
  AppTopbar,
  useSidebarState,
} from "@/components/navigation";
import { AuthModal } from "@/components/roleplay/AuthModal";
import { useAuth } from "@/lib/context/AuthContext";
import { useAnalyzeDocument } from "@/lib/hooks/useAnalyzeDocument";
import { resolveAnalyzerErrorInfo } from "@/lib/api/analyzer";
import { describeDocumentType } from "@/lib/utils/documentFile";
import { formatFileSize } from "@/lib/utils/format";
import { DocumentDropzone } from "./DocumentDropzone";
import { DocumentPreview } from "./DocumentPreview";
import { AnalysisLoading } from "./AnalysisLoading";
import { AnalysisResult } from "./AnalysisResult";

type ScannerState = "idle" | "selected" | "analyzing" | "success" | "error";

const CHECKLIST = [
  {
    icon: Coins,
    title: "Istilah finansial",
    description:
      "Pokok pinjaman, bunga, dan jatuh tempo yang tertulis di dokumen.",
  },
  {
    icon: ShieldWarning,
    title: "Tingkat risiko",
    description: "Seberapa berat ketentuan pembayarannya untuk kondisimu.",
  },
  {
    icon: Flag,
    title: "Red flags",
    description: "Ketentuan berprioritas tinggi yang perlu kamu periksa ulang.",
  },
  {
    icon: GraduationCap,
    title: "Pelajaran finansial",
    description: "Penjelasan kenapa setiap istilah itu penting untuk dipahami.",
  },
] as const;

export default function ScannerWorkspace() {
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useSidebarState();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const analyzeMutation = useAnalyzeDocument();
  const analysis = analyzeMutation.data?.analysis ?? null;

  const state: ScannerState = analyzeMutation.isPending
    ? "analyzing"
    : analyzeMutation.isError
      ? "error"
      : analysis
        ? "success"
        : selectedFile
          ? "selected"
          : "idle";

  const errorInfo = analyzeMutation.isError
    ? resolveAnalyzerErrorInfo(analyzeMutation.error)
    : null;

  function handleFileSelected(file: File) {
    analyzeMutation.reset();
    setSelectedFile(file);
  }

  function handleChangeDocument() {
    if (analyzeMutation.isPending) return;
    analyzeMutation.reset();
    setSelectedFile(null);
  }

  function handleAnalyze() {
    if (!selectedFile || analyzeMutation.isPending) return;
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }
    analyzeMutation.mutate(selectedFile);
  }

  function handleAnalyzeAnother() {
    analyzeMutation.reset();
    setSelectedFile(null);
  }

  const showUploadWorkspace =
    state === "idle" || state === "selected" || state === "error";

  return (
    <div className={`app-shell ${sidebarMinimized ? "is-minimized" : ""}`}>
      <AppSidebar
        isMinimized={sidebarMinimized}
        onToggleMinimize={() => setSidebarMinimized(!sidebarMinimized)}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeItemId="scanner"
        user={{
          name: user?.username || "Tamu FinLen",
          role: user ? `Level ${user.level} · ${user.xp} XP` : "Belum Masuk",
          profileHref: "/app/profile",
        }}
      />

      <div className="app-main">
        <AppTopbar
          title="Smart Document Analyzer"
          subtitle="Pemindai Dokumen Finansial"
          onToggleSidebar={() => {
            if (typeof window !== "undefined" && window.innerWidth < 768) {
              setSidebarOpen((prev) => !prev);
            } else {
              setSidebarMinimized((prev) => !prev);
            }
          }}
          actions={
            !isAuthenticated ? (
              <div className="topbar-auth-actions">
                <button
                  type="button"
                  className="button button-secondary topbar-login-btn"
                  onClick={() => openAuthModal("login")}
                >
                  <SignIn size={16} weight="bold" aria-hidden="true" />
                  <span>Masuk</span>
                </button>
                <button
                  type="button"
                  className="button button-primary topbar-register-btn"
                  onClick={() => openAuthModal("register")}
                >
                  <UserPlus size={16} weight="bold" aria-hidden="true" />
                  <span>Daftar</span>
                </button>
              </div>
            ) : state === "analyzing" ? (
              <span className="scanner-status-chip">Menganalisis...</span>
            ) : selectedFile ? (
              <button
                type="button"
                className="reset-button"
                onClick={handleAnalyzeAnother}
              >
                <UploadSimple size={18} weight="bold" aria-hidden="true" />
                Dokumen baru
              </button>
            ) : null
          }
        />

        <main className="scanner-main">
          {!isAuthenticated && state !== "success" && (
            <div className="scanner-guest-banner">
              <div className="guest-banner-text">
                <LockKey
                  size={20}
                  weight="duotone"
                  className="guest-lock-icon"
                />
                <p>
                  <strong>Analisis dokumen membutuhkan akun.</strong> Masuk ke
                  akun FinLen agar dokumenmu dapat dibaca dan dijelaskan dengan
                  aman.
                </p>
              </div>
              <div className="guest-banner-actions">
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => openAuthModal("login")}
                >
                  Masuk Akun
                </button>
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => openAuthModal("register")}
                >
                  Daftar Gratis
                </button>
              </div>
            </div>
          )}

          {showUploadWorkspace && (
            <>
              <section className="scanner-intro">
                <div>
                  <h1>Pahami isi dokumen finansialmu.</h1>
                  <p>
                    Upload kontrak, tagihan, atau perjanjian pinjaman. FinLen
                    menjelaskan istilah pentingnya, risikonya, dan hal-hal yang
                    perlu kamu periksa sebelum mengambil keputusan.
                  </p>
                </div>
              </section>

              <div className="scanner-upload-grid">
                <div className="scanner-upload-col">
                  {errorInfo ? (
                    <div className="scanner-error-card" role="alert">
                      <span className="scanner-error-icon" aria-hidden="true">
                        <WarningCircle size={26} weight="duotone" />
                      </span>
                      <div className="scanner-error-content">
                        <h2>{errorInfo.title}</h2>
                        <p>{errorInfo.message}</p>
                        {errorInfo.hint ? (
                          <p className="scanner-error-hint">{errorInfo.hint}</p>
                        ) : null}

                        <div className="scanner-error-actions">
                          {errorInfo.requiresAuth ? (
                            <button
                              type="button"
                              className="button button-primary"
                              onClick={() => openAuthModal("login")}
                            >
                              Masuk kembali
                            </button>
                          ) : errorInfo.canRetry && selectedFile ? (
                            <button
                              type="button"
                              className="button button-primary"
                              onClick={handleAnalyze}
                            >
                              <ArrowClockwise
                                size={16}
                                weight="bold"
                                aria-hidden="true"
                              />
                              <span>Coba lagi</span>
                            </button>
                          ) : null}
                          <button
                            type="button"
                            className="button button-secondary"
                            onClick={handleChangeDocument}
                          >
                            Ganti dokumen
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {selectedFile ? (
                    <DocumentPreview
                      file={selectedFile}
                      onChangeDocument={handleChangeDocument}
                      onAnalyze={handleAnalyze}
                      isAnalyzing={analyzeMutation.isPending}
                      analyzeLabel={
                        state === "error"
                          ? "Analisis ulang dokumen"
                          : "Analisis dokumen"
                      }
                    />
                  ) : (
                    <DocumentDropzone onFileSelected={handleFileSelected} />
                  )}
                </div>

                <aside
                  className="scanner-side-panel"
                  aria-label="Yang diperiksa FinLen"
                >
                  <h2>Yang FinLen periksa</h2>
                  <ul className="scanner-checklist">
                    {CHECKLIST.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.title}>
                          <span
                            className="scanner-checklist-icon"
                            aria-hidden="true"
                          >
                            <Icon size={20} weight="duotone" />
                          </span>
                          <span className="scanner-checklist-copy">
                            <strong>{item.title}</strong>
                            <small>{item.description}</small>
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                  <p className="scanner-side-note">
                    Dokumenmu dibaca untuk keperluan analisis ini saja dan tidak
                    disimpan di perangkatmu. Hasil analisis bersifat edukatif,
                    bukan nasihat keuangan atau hukum.
                  </p>
                </aside>
              </div>
            </>
          )}

          {state === "analyzing" && selectedFile && (
            <AnalysisLoading
              fileName={selectedFile.name}
              fileMeta={`${describeDocumentType(selectedFile)} · ${formatFileSize(selectedFile.size)}`}
            />
          )}

          {state === "success" && analysis && (
            <AnalysisResult
              analysis={analysis}
              fileName={selectedFile?.name || "Dokumen finansial"}
              onAnalyzeAnother={handleAnalyzeAnother}
            />
          )}
        </main>
      </div>

      <AuthModal />
    </div>
  );
}
