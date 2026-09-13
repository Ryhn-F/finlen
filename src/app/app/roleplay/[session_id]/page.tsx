import type { Metadata } from "next";
import { SessionPage } from "@/components/roleplay";

interface SessionRouteProps {
  params: Promise<{ session_id: string }>;
}

/**
 * Requirement 10.4: a static `metadata` export (not `generateMetadata`),
 * with `title` (1-60 chars) and `description` (50-160 chars) written in
 * Indonesian, independent of session content — the session's own scenario
 * title is rendered client-side inside `SessionPageContent`, not derived
 * here, since resolving it would require an authenticated request that a
 * Server Component metadata export cannot make on this route.
 */
export const metadata: Metadata = {
  title: "Sesi Roleplay Aktif | FinLen",
  description:
    "Jalani simulasi tekanan finansial secara langsung dan uji keputusanmu di bawah skenario roleplay AI FinLen.",
};

/**
 * Requirement 10.9: Server Component, no client directive. Delegates all
 * interactivity to the imported `SessionPage` client component.
 *
 * Requirement 10.2: `session_id` is obtained exclusively by awaiting the
 * `params` prop, never read synchronously.
 */
export default async function SessionRoute({ params }: SessionRouteProps) {
  const { session_id } = await params;
  return <SessionPage sessionId={session_id} />;
}
