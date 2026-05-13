# Changelog

All notable changes to this project will be documented in this file.

[2.1.0]: https://github.com/flowscape-ui/gradiente/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/flowscape-ui/gradiente/compare/v1.0.2...v2.0.0

## [2.1.0] - 2026-05-13

### Added
- Added CSS Color 4 interpolation support for linear gradients.
- Added support for linear gradient color spaces:
  - `oklab`
  - `oklch`
  - `hsl`
  - `hwb`
  - `lab`
  - `lch`
  - `srgb`
  - `srgb-linear`
  - `display-p3`
  - `a98-rgb`
  - `prophoto-rgb`
  - `rec2020`
  - `xyz`
- Added hue interpolation support for polar color spaces:
  - `shorter hue`
  - `longer hue`
  - `increasing hue`
  - `decreasing hue`
- Added sampled color interpolation for Canvas 2D and WebGL transformers.
- Added initial `repeating-linear-gradient` rendering support for Canvas 2D and WebGL.
- Added helper utilities for angle parsing, angle normalization, percent conversion and numeric rounding.
- Added more structured tests for `LinearGradient`.

### Changed
- Improved `LinearGradient.toString()` serialization.
- Improved angle serialization:
  - standard angles are serialized as CSS directional keywords
  - default `to bottom` direction is omitted
  - custom angles are serialized as degrees
- Improved `LinearGradient` config normalization.
- Improved Canvas 2D linear gradient rendering to better match native CSS output.
- Improved WebGL linear gradient rendering to better match CSS and Canvas 2D output.
- Improved visual parity between CSS, Canvas 2D and WebGL targets.
- Reworked playground input flow to render one gradient across all targets at once.
- Improved playground layout, theme handling and visual comparison tools.

### Fixed
- Fixed shared mutable state issues around gradient cloning, config access and serialization.
- Fixed linear gradient direction differences between CSS, Canvas 2D and WebGL.
- Fixed Canvas 2D aspect-ratio related rendering differences.
- Fixed WebGL gradient line calculation for diagonal angles.
- Fixed WebGL sampled stop truncation issues for complex gradients.
- Fixed invalid `hue` serialization for rectangular color spaces such as `oklab`, `lab`, `srgb` and `display-p3`.
- Fixed parsing and serialization issues for interpolation config from ABI/string input.

### Notes
- Canvas 2D and WebGL approximate CSS Color 4 interpolation by sampling interpolated colors into RGB stops.
- Most gradients now visually match native CSS output closely across CSS, Canvas 2D and WebGL.
- Some very dense `repeating-linear-gradient` cases may still have minor visual differences compared to native CSS rendering.

## [2.0.0] - 2026-04-22

### Added
- Gradient DSL
- ABI parsing layer
- Pattern validator
- Matcher engine

### Breaking
- Full rewrite of parsing system

## [1.0.0] - 2026-03-28

### Added
- Initial project setup
- TypeScript package infrastructure
- VitePress documentation scaffold