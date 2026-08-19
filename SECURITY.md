# Security policy

## Supported versions

Hubzz UI is currently pre-1.0. Security fixes are applied to `main` and the most recent public release line. Older pre-1.0 releases may require upgrading to receive a fix.

## Reporting a vulnerability

Please do not disclose suspected vulnerabilities in a public issue or discussion.

Use GitHub's private vulnerability reporting for this repository when the **Report a vulnerability** option is available on the Security tab. If private reporting is not available, contact the repository maintainer privately through GitHub before public disclosure.

Include enough detail to reproduce and assess the issue:

- affected component, registry item, or package surface;
- affected version, tag, or commit;
- reproduction steps or proof of concept;
- expected security impact;
- any known mitigations.

Do not include real credentials, access tokens, private keys, or personal data in the report.

## Scope

Security reports are especially relevant for:

- unsafe HTML or URL handling in public components;
- dependency or registry behavior that could execute or install unexpected code;
- package or build configuration that could publish unintended files or secrets;
- deployment behavior that exposes private infrastructure;
- cross-site scripting or injection paths introduced by reusable UI helpers.

Product-specific vulnerabilities outside this repository should be reported through the security process for the affected Hubzz product.

## Disclosure

Please allow maintainers reasonable time to investigate, patch, test, and release a fix before public disclosure. Confirmed issues will be documented in the relevant release notes when disclosure is appropriate.
