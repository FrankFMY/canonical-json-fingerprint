# Canonical JSON Fingerprint

Strict canonical JSON serialization and deterministic SHA-256 fingerprints for TypeScript and Node.js.

I built this package for systems where an object must have one stable byte representation before it becomes an idempotency key, request fingerprint, audit identity, cache key, or integrity marker.

## Why

`JSON.stringify()` preserves insertion order. Two objects with the same data can therefore produce different strings and different hashes. This package sorts object keys recursively and rejects values whose runtime shape is unsafe or ambiguous.

## Guarantees

- deterministic recursive object-key ordering;
- strict finite-number handling;
- explicit rejection of sparse arrays, cycles, accessors, class instances, dates, functions, symbols and bigint;
- omission of object properties whose value is `undefined`, matching ordinary JSON object semantics;
- lowercase SHA-256 output;
- no runtime dependencies.

## Installation

```bash
npm install @frankfmy/canonical-json-fingerprint
```

The npm release is pending maintainer approval. Until it is public, clone this repository and run `bun install --frozen-lockfile && bun run build`, then install the tarball produced by `npm pack`. [npm package](https://www.npmjs.com/package/@frankfmy/canonical-json-fingerprint) · [source](https://github.com/FrankFMY/canonical-json-fingerprint).

## Usage

```ts
import {
  canonicalJsonFingerprint,
  serializeCanonicalJson,
} from "@frankfmy/canonical-json-fingerprint";

const payload = { amount: 1250, currency: "USD", lines: ["A", "B"] };

const canonical = serializeCanonicalJson(payload);
const fingerprint = canonicalJsonFingerprint(payload);
```

Objects with the same JSON data produce the same canonical string and fingerprint regardless of insertion order.

## API

### `serializeCanonicalJson(value: unknown): string`

Returns a strict canonical JSON string. Throws `TypeError` for unsupported or ambiguous values.

### `canonicalJsonFingerprint(value: unknown): string`

Returns the SHA-256 digest of the canonical representation as lowercase hexadecimal.

## Design boundaries

This is intentionally not a general object serializer. It accepts plain JSON-shaped data only. It does not encode dates, maps, sets, typed arrays, class instances, custom `toJSON()` methods, or cyclic graphs.

Runtime: ESM on Node.js 20+ or Bun 1.4+. The root module imports `node:crypto`; it is not a browser entry point. Key ordering uses JavaScript UTF-16 code-unit ordering and number formatting uses `JSON.stringify`. This is not a claim of RFC 8785/JCS compliance or a cryptographic audit. Hashes do not authenticate untrusted data. Supply inert plain data; proxies can execute traps and are not a sandboxed input domain.

## Development

```bash
bun install --frozen-lockfile
bun run verify
```

## Author

**Artem Prianishnikov**

- GitHub: https://github.com/FrankFMY
- Website: https://frankfmy.com
- Email: Pryanishnikovartem@gmail.com · frankfmy@proton.me
- Telegram: https://t.me/FrankFMY
- LinkedIn: https://www.linkedin.com/in/frankfmy/
- X: https://x.com/FrankFMY
- npm: https://www.npmjs.com/~frankfmy

## License

MIT © 2026 Artem Prianishnikov. See [LICENSE](LICENSE).
