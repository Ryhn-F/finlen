import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { normalizeScenarioDetail } from "@/lib/api/scenarios";

/**
 * A raw learning-material object's optional field may be:
 * - absent (key not present at all)
 * - `null`
 * - an arbitrary non-null string value
 */
const ABSENT = Symbol("absent");
type FieldValue = string | null | typeof ABSENT;

const optionalFieldArb: fc.Arbitrary<FieldValue> = fc.oneof(
  fc.constant(ABSENT as FieldValue),
  fc.constant(null as FieldValue),
  fc.string(),
);

const OPTIONAL_FIELDS = [
  "description",
  "formal_file_url",
  "brainrot_file_url",
  "source_name",
  "source_url",
  "created_at",
] as const;

type OptionalField = (typeof OPTIONAL_FIELDS)[number];

interface RawItemFixture {
  id: string;
  title: string;
  fields: Record<OptionalField, FieldValue>;
}

const rawItemFixtureArb: fc.Arbitrary<RawItemFixture> = fc.record({
  id: fc.string({ minLength: 1 }),
  title: fc.string({ minLength: 1 }),
  fields: fc.record({
    description: optionalFieldArb,
    formal_file_url: optionalFieldArb,
    brainrot_file_url: optionalFieldArb,
    source_name: optionalFieldArb,
    source_url: optionalFieldArb,
    created_at: optionalFieldArb,
  }),
});

/** Builds a raw learning-material object, omitting keys marked `ABSENT`. */
function buildRawItem(fixture: RawItemFixture): Record<string, unknown> {
  const raw: Record<string, unknown> = {
    id: fixture.id,
    title: fixture.title,
  };
  for (const field of OPTIONAL_FIELDS) {
    const value = fixture.fields[field];
    if (value !== ABSENT) {
      raw[field] = value;
    }
  }
  return raw;
}

/** `normalizeScenarioDetail`'s raw-response parameter type isn't exported; treat inputs as opaque. */
type RawScenarioDetailInput = Parameters<typeof normalizeScenarioDetail>[0];

function buildRawResponse(learningMaterials: unknown): RawScenarioDetailInput {
  return {
    id: "valid-id",
    title: "Valid Title",
    learning_materials: learningMaterials,
  } as RawScenarioDetailInput;
}

function buildRawResponseWithoutLearningMaterials(): RawScenarioDetailInput {
  return { id: "valid-id", title: "Valid Title" } as RawScenarioDetailInput;
}

describe("Feature: roleplay-scenario-detail-flow, Property 6: Learning materials are preserved in order with no data loss per item", () => {
  it("preserves length, order, and per-item field fidelity for an arbitrary array of raw items", () => {
    fc.assert(
      fc.property(
        fc.array(rawItemFixtureArb, { minLength: 0, maxLength: 10 }),
        (fixtures) => {
          const rawItems = fixtures.map(buildRawItem);
          const result = normalizeScenarioDetail(buildRawResponse(rawItems));

          expect(result.learning_materials).toHaveLength(fixtures.length);

          fixtures.forEach((fixture, index) => {
            const item = result.learning_materials[index];
            expect(item.id).toBe(fixture.id);
            expect(item.title).toBe(fixture.title);

            for (const field of OPTIONAL_FIELDS) {
              const rawValue = fixture.fields[field];
              if (rawValue === ABSENT || rawValue === null) {
                expect(item[field]).toBeUndefined();
              } else {
                expect(item[field]).toBe(rawValue);
              }
            }
          });
        },
      ),
      { numRuns: 100 },
    );
  });

  it("exposes an empty collection for a 0-item learning_materials array", () => {
    const result = normalizeScenarioDetail(buildRawResponse([]));
    expect(result.learning_materials).toEqual([]);
  });

  it("exposes an empty collection when learning_materials is omitted entirely", () => {
    const result = normalizeScenarioDetail(buildRawResponseWithoutLearningMaterials());
    expect(result.learning_materials).toEqual([]);
  });

  it("exposes an empty collection for any non-array learning_materials value", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.string(),
          fc.integer(),
          fc.constant(null),
          fc.constant(undefined),
          fc.boolean(),
          fc.object(),
        ),
        (nonArrayValue) => {
          const result = normalizeScenarioDetail(buildRawResponse(nonArrayValue));
          expect(result.learning_materials).toEqual([]);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("coerces a missing/non-string id or title on an item to an empty string, without dropping other fields", () => {
    const rawItem = {
      id: undefined,
      title: 42,
      description: "keterangan",
    };
    const result = normalizeScenarioDetail(buildRawResponse([rawItem]));

    expect(result.learning_materials).toHaveLength(1);
    expect(result.learning_materials[0].id).toBe("");
    expect(result.learning_materials[0].title).toBe("42");
    expect(result.learning_materials[0].description).toBe("keterangan");
  });
});
