import type { Metadata } from "next";
import { ScannerWorkspace } from "@/components/scanner";

export const metadata: Metadata = {
  title: "Smart Document Analyzer | FinLen",
  description:
    "Upload kontrak, tagihan, atau perjanjian pinjaman untuk memahami istilah finansial, tingkat risiko, dan hal-hal yang perlu kamu periksa sebelum mengambil keputusan.",
};

export default function ScannerPage() {
  return <ScannerWorkspace />;
}
