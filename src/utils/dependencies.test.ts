import { describe, expect, test } from "@jest/globals";

import type { LoliSpec } from "../schema/LoliSpec";
import type {
  DependencyMapFeatureFlagEntity,
  DependencyMapPropertyEntity,
  DependencyMapSegmentEntity,
} from "./dependencies";
import {
  buildDependencyMap,
  createDependencyMapTraversalByStartEntityId,
  getEntryFromDependencyMapByKeyId,
  getMatchingEntryFromDependencyMap,
} from "./dependencies";

function createSpec(props?: {
  makeSuperAdminsSegmentDependOnEarlyAdoptersSegment?: boolean;
}): LoliSpec {
  return {
    schemaVersion: 1,
    featureFlags: [
      {
        id: "darkModeFeatureFlagId",
        name: "dark-mode",
        type: "boolean",
        defaultValue: false,
        description: "",
        targeting: {
          enabled: true,
          rules: [
            {
              enabled: true,
              valuesOnMatch: [{ value: true, rolloutPercentage: 100 }],
              conditionSet: {
                operator: "or",
                conditions: [
                  {
                    type: "segment",
                    segmentId: "earlyAdoptersSegmentId",
                    operator: "isTrue",
                  },
                  {
                    type: "string",
                    propertyId: "emailPropId",
                    operator: "equals",
                    operandsQuantifier: "some",
                    operands: ["ceo@acme.com"],
                  },
                ],
              },
            },
          ],
        },
      },
    ],
    segments: [
      {
        id: "earlyAdoptersSegmentId",
        name: "Early Adopters",
        conditionSet: {
          operator: "or",
          conditions: [
            {
              type: "boolean",
              propertyId: "betaTesterPropId",
              operator: "isTrue",
            },
            {
              type: "string",
              propertyId: "emailPropId",
              operator: "endsWith",
              operandsQuantifier: "some",
              operands: ["@acme.com"],
            },
            {
              type: "segment",
              segmentId: "superAdminsSegmentId",
              operator: "isTrue",
            },
          ],
        },
      },
      {
        id: "superAdminsSegmentId",
        name: "Super Admins",
        conditionSet: {
          operator: "and",
          conditions: [
            {
              type: "boolean",
              propertyId: "superAdminPropId",
              operator: "isTrue",
            },
            ...(props?.makeSuperAdminsSegmentDependOnEarlyAdoptersSegment
              ? [
                  {
                    type: "segment",
                    segmentId: "earlyAdoptersSegmentId",
                    operator: "isTrue",
                  } as const,
                ]
              : []),
          ],
        },
      },
    ],
    evaluationContext: {
      properties: [
        {
          type: "string",
          id: "emailPropId",
          name: "User E-Mail",
          path: ["email"],
          rolloutDiscriminator: true,
        },
        {
          type: "string",
          id: "idPropId",
          name: "User ID",
          path: ["id"],
          rolloutDiscriminator: true,
        },
        {
          type: "boolean",
          id: "betaTesterPropId",
          name: "Beta Tester Flag",
          path: ["betaTester"],
          rolloutDiscriminator: false,
        },
        {
          type: "boolean",
          id: "superAdminPropId",
          name: "Super Admin Flag",
          path: ["superAdmin"],
          rolloutDiscriminator: false,
        },
      ],
    },
  };
}

describe("getEntryFromDependencyMapByKeyId", () => {
  test("Returns entry for feature flag ID", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    const entry = getEntryFromDependencyMapByKeyId(
      dependencyMap,
      "darkModeFeatureFlagId",
    );

    expect(entry).toBeDefined();
    expect(entry![0].type).toBe("featureFlag");
    expect(entry![0].id).toBe("darkModeFeatureFlagId");
    expect((entry![0] as DependencyMapFeatureFlagEntity).featureFlag).toBe(
      spec.featureFlags[0],
    );
  });

  test("Returns entry for segment ID", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    const entry = getEntryFromDependencyMapByKeyId(
      dependencyMap,
      "earlyAdoptersSegmentId",
    );

    expect(entry).toBeDefined();
    expect(entry![0].type).toBe("segment");
    expect(entry![0].id).toBe("earlyAdoptersSegmentId");
    expect((entry![0] as DependencyMapSegmentEntity).segment).toBe(
      spec.segments[0],
    );
  });

  test("Returns entry for property ID", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    const entry = getEntryFromDependencyMapByKeyId(dependencyMap, "idPropId");

    expect(entry).toBeDefined();
    expect(entry![0].type).toBe("property");
    expect(entry![0].id).toBe("idPropId");
    expect((entry![0] as DependencyMapPropertyEntity).property).toBe(
      spec.evaluationContext.properties[1],
    );
  });

  test("Returns undefined for non-existing element/ID", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    const entry = getEntryFromDependencyMapByKeyId(
      dependencyMap,
      "unknown_entity_id_42",
    );

    expect(entry).toBeUndefined();
  });
});

describe("getMatchingEntryFromDependencyMap", () => {
  test("Returns entry for feature flag entity", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    const featureFlag = spec.featureFlags[0];

    const entry = getMatchingEntryFromDependencyMap(dependencyMap, {
      type: "featureFlag",
      id: featureFlag.id,
      featureFlag,
    });

    expect(entry).toBeDefined();
    expect(entry![0].type).toBe("featureFlag");
    expect(entry![0].id).toBe(featureFlag.id);
    expect((entry![0] as DependencyMapFeatureFlagEntity).featureFlag).toBe(
      featureFlag,
    );
  });

  test("Returns entry for segment entity", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    const segment = spec.segments[0];

    const entry = getMatchingEntryFromDependencyMap(dependencyMap, {
      type: "segment",
      id: segment.id,
      segment,
    });

    expect(entry).toBeDefined();
    expect(entry![0].type).toBe("segment");
    expect(entry![0].id).toBe(segment.id);
    expect((entry![0] as DependencyMapSegmentEntity).segment).toBe(segment);
  });

  test("Returns entry for property entity", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    const property = spec.evaluationContext.properties[2];

    const entry = getMatchingEntryFromDependencyMap(dependencyMap, {
      type: "property",
      id: property.id,
      property,
    });

    expect(entry).toBeDefined();
    expect(entry![0].type).toBe("property");
    expect(entry![0].id).toBe(property.id);
    expect((entry![0] as DependencyMapPropertyEntity).property).toBe(property);
  });

  test("Returns undefined for non-existing entity", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    const entry = getMatchingEntryFromDependencyMap(dependencyMap, {
      type: "property",
      id: "unknown_property_id_42",
      property: {
        id: "unknown_property_id_42",
        name: "Unknown Property",
        type: "string",
        path: ["abc"],

        rolloutDiscriminator: false,
      },
    });

    expect(entry).toBeUndefined();
  });
});

describe("buildDependencyMap", () => {
  test("Created dependency map maps feature flag to correct properties and segments", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    const entry = getEntryFromDependencyMapByKeyId(
      dependencyMap,
      "darkModeFeatureFlagId",
    );

    if (!entry) {
      throw new Error("Entry not found");
    }

    // Key assertions are tested by other test cases
    const [, mapped] = entry;

    expect(mapped.length).toBe(2);

    expect(mapped[0].type).toBe("segment");
    expect(mapped[0].id).toBe("earlyAdoptersSegmentId");
    expect((mapped[0] as DependencyMapSegmentEntity).segment).toBe(
      spec.segments[0],
    );

    expect(mapped[1].type).toBe("property");
    expect(mapped[1].id).toBe("emailPropId");
    expect((mapped[1] as DependencyMapPropertyEntity).property).toBe(
      spec.evaluationContext.properties[0],
    );
  });

  test("Created dependency map maps segment to correct properties and segments", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    const entry = getEntryFromDependencyMapByKeyId(
      dependencyMap,
      "earlyAdoptersSegmentId",
    );

    if (!entry) {
      throw new Error("Entry not found");
    }

    // Key assertions are tested by other test cases
    const [, mapped] = entry;

    expect(mapped.length).toBe(3);

    expect(mapped[0].type).toBe("property");
    expect(mapped[0].id).toBe("betaTesterPropId");
    expect((mapped[0] as DependencyMapPropertyEntity).property).toBe(
      spec.evaluationContext.properties[2],
    );

    expect(mapped[1].type).toBe("property");
    expect(mapped[1].id).toBe("emailPropId");
    expect((mapped[1] as DependencyMapPropertyEntity).property).toBe(
      spec.evaluationContext.properties[0],
    );

    expect(mapped[2].type).toBe("segment");
    expect(mapped[2].id).toBe("superAdminsSegmentId");
    expect((mapped[2] as DependencyMapSegmentEntity).segment).toBe(
      spec.segments[1],
    );
  });

  describe("Created dependency map maps all properties to empty arrays", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    for (
      let propertyIndex = 0;
      propertyIndex < spec.evaluationContext.properties.length;
      propertyIndex++
    ) {
      test(`properties[${propertyIndex}] is mapped to empty array`, () => {
        const entry = getEntryFromDependencyMapByKeyId(
          dependencyMap,
          spec.evaluationContext.properties[propertyIndex].id,
        );

        if (!entry) {
          throw new Error("Entry not found");
        }

        // Key assertions are tested by other test cases
        const [, mapped] = entry;

        expect(mapped.length).toBe(0);
      });
    }
  });
});

describe("createDependencyMapTraversalByStartEntityId", () => {
  test("Returns correct non-cyclic traversal by starting with feature flag", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    const startId = "darkModeFeatureFlagId";

    const traversal = createDependencyMapTraversalByStartEntityId(
      dependencyMap,
      startId,
    );

    expect(traversal.startEntity).toBe(
      getEntryFromDependencyMapByKeyId(dependencyMap, startId)?.[0],
    );

    // Check for correct dependencies
    const dependencies = traversal.dependencies;
    expect(dependencies.length).toBe(5);

    const dependency0 = dependencies[0] as DependencyMapSegmentEntity;
    expect(dependency0.type).toBe("segment");
    expect(dependency0.id).toBe("earlyAdoptersSegmentId");
    expect(dependency0.segment).toBe(spec.segments[0]);

    const dependency1 = dependencies[1] as DependencyMapPropertyEntity;
    expect(dependency1.type).toBe("property");
    expect(dependency1.id).toBe("betaTesterPropId");
    expect(dependency1.property).toBe(spec.evaluationContext.properties[2]);

    const dependency2 = dependencies[2] as DependencyMapPropertyEntity;
    expect(dependency2.type).toBe("property");
    expect(dependency2.id).toBe("emailPropId");
    expect(dependency2.property).toBe(spec.evaluationContext.properties[0]);

    const dependency3 = dependencies[3] as DependencyMapSegmentEntity;
    expect(dependency3.type).toBe("segment");
    expect(dependency3.id).toBe("superAdminsSegmentId");
    expect(dependency3.segment).toBe(spec.segments[1]);

    const dependency4 = dependencies[4] as DependencyMapPropertyEntity;
    expect(dependency4.type).toBe("property");
    expect(dependency4.id).toBe("superAdminPropId");
    expect(dependency4.property).toBe(spec.evaluationContext.properties[3]);

    // No cyclic dependencies
    expect(traversal.areCyclicDependenciesPresent).toBe(false);
    expect(traversal.isStartEntityPartOfCyclicDependency).toBe(false);
    expect(traversal.entitiesCausingCyclicDependencies.length).toBe(0);
    expect(traversal.cyclicDependencyTargets.length).toBe(0);
  });

  test("Returns correct non-cyclic traversal by starting with segment", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    const startId = "earlyAdoptersSegmentId";

    const traversal = createDependencyMapTraversalByStartEntityId(
      dependencyMap,
      startId,
    );

    expect(traversal.startEntity).toBe(
      getEntryFromDependencyMapByKeyId(dependencyMap, startId)?.[0],
    );

    // Check for correct dependencies
    const dependencies = traversal.dependencies;
    expect(dependencies.length).toBe(4);

    const dependency0 = dependencies[0] as DependencyMapPropertyEntity;
    expect(dependency0.type).toBe("property");
    expect(dependency0.id).toBe("betaTesterPropId");
    expect(dependency0.property).toBe(spec.evaluationContext.properties[2]);

    const dependency1 = dependencies[1] as DependencyMapPropertyEntity;
    expect(dependency1.type).toBe("property");
    expect(dependency1.id).toBe("emailPropId");
    expect(dependency1.property).toBe(spec.evaluationContext.properties[0]);

    const dependency2 = dependencies[2] as DependencyMapSegmentEntity;
    expect(dependency2.type).toBe("segment");
    expect(dependency2.id).toBe("superAdminsSegmentId");
    expect(dependency2.segment).toBe(spec.segments[1]);

    const dependency3 = dependencies[3] as DependencyMapPropertyEntity;
    expect(dependency3.type).toBe("property");
    expect(dependency3.id).toBe("superAdminPropId");
    expect(dependency3.property).toBe(spec.evaluationContext.properties[3]);

    // No cyclic dependencies
    expect(traversal.areCyclicDependenciesPresent).toBe(false);
    expect(traversal.isStartEntityPartOfCyclicDependency).toBe(false);
    expect(traversal.entitiesCausingCyclicDependencies.length).toBe(0);
    expect(traversal.cyclicDependencyTargets.length).toBe(0);
  });

  test("Returns correct non-cyclic traversal by starting with property", () => {
    const spec = createSpec();
    const dependencyMap = buildDependencyMap(spec);

    const startId = "emailPropId";

    const traversal = createDependencyMapTraversalByStartEntityId(
      dependencyMap,
      startId,
    );

    expect(traversal.startEntity).toBe(
      getEntryFromDependencyMapByKeyId(dependencyMap, startId)?.[0],
    );

    // Check for correct dependencies
    const dependencies = traversal.dependencies;
    expect(dependencies.length).toBe(0);

    // No cyclic dependencies
    expect(traversal.areCyclicDependenciesPresent).toBe(false);
    expect(traversal.isStartEntityPartOfCyclicDependency).toBe(false);
    expect(traversal.entitiesCausingCyclicDependencies.length).toBe(0);
    expect(traversal.cyclicDependencyTargets.length).toBe(0);
  });

  test("Returns correct cyclic traversal by starting with feature flag for spec with cyclic dependency", () => {
    const spec = createSpec({
      makeSuperAdminsSegmentDependOnEarlyAdoptersSegment: true,
    });

    const dependencyMap = buildDependencyMap(spec);

    const startId = "darkModeFeatureFlagId";

    const traversal = createDependencyMapTraversalByStartEntityId(
      dependencyMap,
      startId,
    );

    expect(traversal.startEntity).toBe(
      getEntryFromDependencyMapByKeyId(dependencyMap, startId)?.[0],
    );

    // Check for correct dependencies
    const dependencies = traversal.dependencies;
    expect(dependencies.length).toBe(5);

    const dependency0 = dependencies[0] as DependencyMapSegmentEntity;
    expect(dependency0.type).toBe("segment");
    expect(dependency0.id).toBe("earlyAdoptersSegmentId");
    expect(dependency0.segment).toBe(spec.segments[0]);

    const dependency1 = dependencies[1] as DependencyMapPropertyEntity;
    expect(dependency1.type).toBe("property");
    expect(dependency1.id).toBe("betaTesterPropId");
    expect(dependency1.property).toBe(spec.evaluationContext.properties[2]);

    const dependency2 = dependencies[2] as DependencyMapPropertyEntity;
    expect(dependency2.type).toBe("property");
    expect(dependency2.id).toBe("emailPropId");
    expect(dependency2.property).toBe(spec.evaluationContext.properties[0]);

    const dependency3 = dependencies[3] as DependencyMapSegmentEntity;
    expect(dependency3.type).toBe("segment");
    expect(dependency3.id).toBe("superAdminsSegmentId");
    expect(dependency3.segment).toBe(spec.segments[1]);

    const dependency4 = dependencies[4] as DependencyMapPropertyEntity;
    expect(dependency4.type).toBe("property");
    expect(dependency4.id).toBe("superAdminPropId");
    expect(dependency4.property).toBe(spec.evaluationContext.properties[3]);

    // No cyclic dependencies
    expect(traversal.areCyclicDependenciesPresent).toBe(true);
    expect(traversal.isStartEntityPartOfCyclicDependency).toBe(false);

    const entitiesCausingCylclicDependencies =
      traversal.entitiesCausingCyclicDependencies;
    expect(entitiesCausingCylclicDependencies.length).toBe(1);

    const cyclicDependency0 =
      entitiesCausingCylclicDependencies[0] as DependencyMapSegmentEntity;
    expect(cyclicDependency0.type).toBe("segment");
    expect(cyclicDependency0.id).toBe("superAdminsSegmentId");
    expect(cyclicDependency0.segment).toBe(spec.segments[1]);

    const cyclicDependencyTargets = traversal.cyclicDependencyTargets;
    expect(cyclicDependencyTargets.length).toBe(1);

    const cylicDependencyTarget0 =
      cyclicDependencyTargets[0] as DependencyMapSegmentEntity;
    expect(cylicDependencyTarget0.type).toBe("segment");
    expect(cylicDependencyTarget0.id).toBe("earlyAdoptersSegmentId");
    expect(cylicDependencyTarget0.segment).toBe(spec.segments[0]);
  });

  test("Returns correct cyclic traversal by starting with segment for spec with cyclic dependency", () => {
    const spec = createSpec({
      makeSuperAdminsSegmentDependOnEarlyAdoptersSegment: true,
    });

    const dependencyMap = buildDependencyMap(spec);

    const startId = "earlyAdoptersSegmentId";

    const traversal = createDependencyMapTraversalByStartEntityId(
      dependencyMap,
      startId,
    );

    expect(traversal.startEntity).toBe(
      getEntryFromDependencyMapByKeyId(dependencyMap, startId)?.[0],
    );

    // Check for correct dependencies
    const dependencies = traversal.dependencies;
    expect(dependencies.length).toBe(4);

    const dependency0 = dependencies[0] as DependencyMapPropertyEntity;
    expect(dependency0.type).toBe("property");
    expect(dependency0.id).toBe("betaTesterPropId");
    expect(dependency0.property).toBe(spec.evaluationContext.properties[2]);

    const dependency1 = dependencies[1] as DependencyMapPropertyEntity;
    expect(dependency1.type).toBe("property");
    expect(dependency1.id).toBe("emailPropId");
    expect(dependency1.property).toBe(spec.evaluationContext.properties[0]);

    const dependency2 = dependencies[2] as DependencyMapSegmentEntity;
    expect(dependency2.type).toBe("segment");
    expect(dependency2.id).toBe("superAdminsSegmentId");
    expect(dependency2.segment).toBe(spec.segments[1]);

    const dependency3 = dependencies[3] as DependencyMapPropertyEntity;
    expect(dependency3.type).toBe("property");
    expect(dependency3.id).toBe("superAdminPropId");
    expect(dependency3.property).toBe(spec.evaluationContext.properties[3]);

    // No cyclic dependencies
    expect(traversal.areCyclicDependenciesPresent).toBe(true);
    expect(traversal.isStartEntityPartOfCyclicDependency).toBe(true);

    const entitiesCausingCylclicDependencies =
      traversal.entitiesCausingCyclicDependencies;
    expect(entitiesCausingCylclicDependencies.length).toBe(1);

    const cyclicDependency0 =
      entitiesCausingCylclicDependencies[0] as DependencyMapSegmentEntity;
    expect(cyclicDependency0.type).toBe("segment");
    expect(cyclicDependency0.id).toBe("superAdminsSegmentId");
    expect(cyclicDependency0.segment).toBe(spec.segments[1]);

    const cyclicDependencyTargets = traversal.cyclicDependencyTargets;
    expect(cyclicDependencyTargets.length).toBe(1);

    const cylicDependencyTarget0 =
      cyclicDependencyTargets[0] as DependencyMapSegmentEntity;
    expect(cylicDependencyTarget0.type).toBe("segment");
    expect(cylicDependencyTarget0.id).toBe("earlyAdoptersSegmentId");
    expect(cylicDependencyTarget0.segment).toBe(spec.segments[0]);
  });

  test("Returns correct non-cyclic traversal by starting with property for spec with cyclic dependency", () => {
    const spec = createSpec({
      makeSuperAdminsSegmentDependOnEarlyAdoptersSegment: true,
    });

    const dependencyMap = buildDependencyMap(spec);

    const startId = "emailPropId";

    const traversal = createDependencyMapTraversalByStartEntityId(
      dependencyMap,
      startId,
    );

    expect(traversal.startEntity).toBe(
      getEntryFromDependencyMapByKeyId(dependencyMap, startId)?.[0],
    );

    // Check for correct dependencies
    const dependencies = traversal.dependencies;
    expect(dependencies.length).toBe(0);

    // No cyclic dependencies
    expect(traversal.areCyclicDependenciesPresent).toBe(false);
    expect(traversal.isStartEntityPartOfCyclicDependency).toBe(false);
    expect(traversal.entitiesCausingCyclicDependencies.length).toBe(0);
    expect(traversal.cyclicDependencyTargets.length).toBe(0);
  });
});
