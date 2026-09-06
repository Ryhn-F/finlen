import type { Metadata } from "next";
import { RoleplayWorkspace } from "@/components/roleplay";

export const metadata: Metadata = {
  title: "Bermain Peran Finansial | FinLen",
  description:
    "Hadapi situasi penagihan dan penipuan kredit nyata. Latih naluri keputusan finansial di bawah tekanan simulasi AI.",
};

export default function RoleplayPage() {
  return <RoleplayWorkspace />;
}
