import type { Metadata } from "next";
import { getScenario } from "@/lib/api/scenarios";
import { ScenarioDetailPage } from "@/components/roleplay";

interface ScenarioDetailRouteProps {
  params: Promise<{ scenario_id: string }>;
}

// Requirement 10.7: generic Indonesian fallback, both within the required
// character bounds (title 1-60, description 50-160), used whenever the
// server-side metadata fetch below fails for any reason.
const FALLBACK_TITLE = "Briefing Skenario Roleplay | FinLen";
const FALLBACK_DESCRIPTION =
  "Pelajari konteks finansial, tujuan, dan risiko skenario roleplay sebelum memulai simulasi keputusan di FinLen.";

/**
 * Requirement 10.3: `generateMetadata` only - no static `metadata` export
 * lives in this file, since the installed Next.js version rejects both
 * exports from the same route segment.
 *
 * Requirement 10.1: `scenario_id` is obtained exclusively by awaiting the
 * `params` prop, never read synchronously.
 *
 * Requirement 10.7: `getScenario` is attempted purely to build a
 * scenario-specific title/description; any failure (invalid id, network
 * error, 404, malformed data, etc.) falls back to the generic Indonesian
 * copy above instead of failing the request.
 */
export async function generateMetadata({
  params,
}: ScenarioDetailRouteProps): Promise<Metadata> {
  const { scenario_id } = await params;

  try {
    const scenario = await getScenario(scenario_id);
    return {
      title: buildTitle(scenario.title),
      description: buildDescription(scenario.description),
    };
  } catch {
    return { title: FALLBACK_TITLE, description: FALLBACK_DESCRIPTION };
  }
}

/**
 * Keeps the title within the required 1-60 character bound. `scenario.title`
 * is guaranteed non-empty by `normalizeScenarioDetail`'s validation, so the
 * suffix alone guarantees a non-empty result even in a pathological case.
 */
function buildTitle(rawTitle: string): string {
  return `${rawTitle} | FinLen`.slice(0, 60);
}

/**
 * Keeps the description within the required 50-160 character bound:
 * - already in range: returned verbatim
 * - too long: truncated to 157 chars + "..." (160 total)
 * - too short (including empty): falls back to the generic description,
 *   which is itself within bounds, since padding an arbitrary short string
 *   up to 50 characters would otherwise require inventing content.
 */
function buildDescription(rawDescription: string): string {
  const trimmed = rawDescription.trim();
  if (trimmed.length >= 50 && trimmed.length <= 160) return trimmed;
  if (trimmed.length > 160) return `${trimmed.slice(0, 157)}...`;
  return FALLBACK_DESCRIPTION;
}

/**
 * Requirement 10.8: Server Component, no client directive. Delegates all
 * interactivity to the imported `ScenarioDetailPage` client component.
 *
 * Requirement 10.1: independently awaits its own `params` prop (a separate
 * invocation from `generateMetadata` above).
 */
export default async function ScenarioDetailRoute({ params }: ScenarioDetailRouteProps) {
  const { scenario_id } = await params;
  return <ScenarioDetailPage scenarioId={scenario_id} />;
}
