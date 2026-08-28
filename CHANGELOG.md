# Changelog

All notable public changes to Hubzz UI are documented here.

The project follows Semantic Versioning. While the project is below 1.0, minor
releases may contain intentional API changes when they are documented with
migration notes.

## Unreleased

### Added

- Stage HUD prototype at `/cn/stage` and `?prototype=stage` (Spaces-style
  event floor, exclusive people/chat rail, production dock). Not part of the
  published `@hubzz/ui` package surface.

### Added

- Public shadcn source registry with a Hubzz base, theme, Button override, and
  individually installable Hubzz components.
- Public architecture and foundation documentation.
- MIT license and upstream third-party notices.
- Automated serious/critical WCAG checks in the Playwright suite.

### Changed

- Separated upstream shadcn primitives from Hubzz-owned component source.
- Reworked the public catalog around foundations, upstream primitives,
  overrides, components, and patterns.
- Capsule now composes the upstream Toggle primitive and exposes pressed
  semantics through it.
- ProfileHeader now composes upstream Avatar and the Hubzz Button override.
- Improved accessible names for icon-only and dismiss actions.
- Clarified the GitHub source registry as the canonical public distribution
  surface.

## 0.1.0 - 2026-08-19

### Added

- Initial public `@hubzz/ui` package structure.
- Public component catalog.
- Hubzz-themed shadcn/Radix primitives and Hubzz-specific component
  compositions.
- Production catalog deployment at `hubzz.xyz/cn/`.
