import { describe, expect, test } from "bun:test";
import { canonicalJsonFingerprint, serializeCanonicalJson } from "../src/index.js";

describe("serializeCanonicalJson", () => {
  test("produces one representation for equivalent plain JSON", () => {
    expect(serializeCanonicalJson({ z: [3, { b: true, a: "x" }], a: null })).toBe('{"a":null,"z":[3,{"a":"x","b":true}]}');
    expect(serializeCanonicalJson({ ignored: undefined, b: 2, a: 1 })).toBe('{"a":1,"b":2}');
    expect(serializeCanonicalJson(Object.assign(Object.create(null), { b: 2, a: 1 }))).toBe('{"a":1,"b":2}');
  });

  test("matches an independent SHA-256 known vector", () => {
    expect(canonicalJsonFingerprint({ b: 2, a: 1 })).toBe("43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777");
  });

  test("rejects values whose shape cannot be deterministic evidence", () => {
    const sparse = Array.from({ length: 2 });
    delete sparse[0];
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    const accessor = Object.defineProperty({}, "value", { enumerable: true, get: () => 1 });

    expect(() => serializeCanonicalJson(sparse)).toThrow("sparse");
    expect(() => serializeCanonicalJson(Number.NaN)).toThrow("finite");
    expect(() => serializeCanonicalJson(new Date())).toThrow("plain objects");
    expect(() => serializeCanonicalJson(1n)).toThrow("Unsupported");
    expect(() => serializeCanonicalJson([undefined])).toThrow("Unsupported");
    expect(() => serializeCanonicalJson(cyclic)).toThrow("cyclic");
    expect(() => serializeCanonicalJson(accessor)).toThrow("accessor");
  });
});
