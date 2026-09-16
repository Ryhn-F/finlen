import type { Metadata } from "next";
import { ProfileWorkspace } from "@/components/profile";

export const metadata: Metadata = {
  title: "Profil & Naluri Finansial | FinLen",
  description:
    "Lihat level, XP, dan perkembangan Naluri Finansialmu di FinLen.",
};

export default function ProfilePage() {
  return <ProfileWorkspace />;
}
