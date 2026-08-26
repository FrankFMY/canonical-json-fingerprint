import { createHash } from "node:crypto";

const serialize = (value: unknown, ancestors: Set<object>): string => {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError("Canonical JSON accepts only finite numbers");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    if (ancestors.has(value)) throw new TypeError("Canonical JSON does not accept cyclic values");
    ancestors.add(value);
    try {
      const entries: string[] = [];
      for (let index = 0; index < value.length; index += 1) {
        if (!Object.hasOwn(value, index)) throw new TypeError("Canonical JSON does not accept sparse arrays");
        entries.push(serialize(value[index], ancestors));
      }
      return `[${entries.join(",")}]`;
    } finally {
      ancestors.delete(value);
    }
  }
  if (typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("Canonical JSON accepts only plain objects");
    }
    if (ancestors.has(value)) throw new TypeError("Canonical JSON does not accept cyclic values");
    ancestors.add(value);
    try {
      const record = value as Record<string, unknown>;
      const entries: string[] = [];
      for (const key of Object.keys(record).sort()) {
        const descriptor = Object.getOwnPropertyDescriptor(record, key);
        if (!descriptor || descriptor.get || descriptor.set) {
          throw new TypeError("Canonical JSON does not accept accessor properties");
        }
        if (descriptor.value === undefined) continue;
        entries.push(`${JSON.stringify(key)}:${serialize(descriptor.value, ancestors)}`);
      }
      return `{${entries.join(",")}}`;
    } finally {
      ancestors.delete(value);
    }
  }
  throw new TypeError(`Unsupported canonical JSON value: ${typeof value}`);
};

/** Serialize plain JSON data with deterministic object-key ordering and strict shape checks. */
export const serializeCanonicalJson = (value: unknown): string => serialize(value, new Set());

/** Build a lowercase SHA-256 fingerprint of the canonical JSON representation. */
export const canonicalJsonFingerprint = (value: unknown): string =>
  createHash("sha256").update(serializeCanonicalJson(value), "utf8").digest("hex");
