import type { Metadata } from "next";
import { ProgressWorkspace } from "@/components/progress/ProgressWorkspace";

export const metadata: Metadata = {
  title: "Progres & Riwayat Latihan | FinLen",
  description:
    "Lihat perkembangan skor Naluri Finansial dan riwayat bermain peranmu di FinLen.",
};

export default function ProgressPage() {
  return <ProgressWorkspace />;
}
