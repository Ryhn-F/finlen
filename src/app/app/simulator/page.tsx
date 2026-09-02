import type { Metadata } from "next";
import SimulatorWorkspace from "@/components/simulator/SimulatorWorkspace";

export const metadata: Metadata = {
  title: "Lab Pertumbuhan Utang | FinLen",
  description:
    "Pelajari bagaimana utang awal, bunga bulanan, dan waktu mengubah jumlah yang harus dibayar.",
};

export default function SimulatorPage() {
  return <SimulatorWorkspace />;
}
