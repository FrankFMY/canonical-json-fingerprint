import { canonicalJsonFingerprint, serializeCanonicalJson } from "@frankfmy/canonical-json-fingerprint";
const canonical: string = serializeCanonicalJson({ b: 2, a: 1 });
const fingerprint: string = canonicalJsonFingerprint(JSON.parse(canonical));
// @ts-expect-error fingerprints are hex strings, not numeric identities
const invalid: number = fingerprint;
// @ts-expect-error a value must be supplied even though its type is unknown
serializeCanonicalJson();
void invalid;
