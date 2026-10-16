# Security Policy

## Supported versions

Glyph is pre-1.0. Security fixes go into the latest published minor version only.

## Reporting a vulnerability

Do not open a public issue. Use [GitHub private vulnerability reporting](https://github.com/khalmohak/glyph/security/advisories/new), or email **mohakgupta102@gmail.com** with:

- the affected package and version
- what an attacker could do, and how to reproduce it

You will get a reply within 5 working days. Once a fix is released, the advisory is published with credit to you unless you prefer otherwise.

## Supply chain

- Packages are published from GitHub Actions with [npm provenance](https://docs.npmjs.com/generating-provenance-statements), so each release links to the exact commit and workflow that built it.
- The workspace refuses dependency versions published less than 14 days ago (`minimumReleaseAge` in `pnpm-workspace.yaml`).
