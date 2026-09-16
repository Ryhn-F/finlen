import type { Metadata } from "next";
import { DashboardWorkspace } from "@/components/dashboard/DashboardWorkspace";

export const metadata: Metadata = {
  title: "Dasbor Analitik | FinLen",
  description:
    "Lihat ringkasan akun, riwayat bermain peran, dan perkembangan Naluri Finansialmu di FinLen.",
};

export default function DashboardPage() {
  return <DashboardWorkspace />;
}
