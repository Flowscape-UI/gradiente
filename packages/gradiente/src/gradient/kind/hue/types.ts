export const GRADIENT_COLOR_SPACE = [
    // defalult
    "oklab",

    // cylindrical
    "lch",
    "oklch",
    "hsl",
    "hwb",

    // cartesian
    "lab",
    "srgb",
    "srgb-linear",
    "xyz",
    "display-p3",
    "a98-rgb",
    "prophoto-rgb",
    "rec2020",
] as const;

export const GRADIENT_HUE_INTERPOLATIONS = [
    'shorter',
    'longer',
    'increasing',
    'decreasing',
] as const;

export const GRADIENT_POLAR_COLOR_SPACES = [
    "hsl",
    "hwb",
    "lch",
    "oklch",
] as const;


export type GradientHueInterpolation = typeof GRADIENT_HUE_INTERPOLATIONS[number];
export type GradientColorSpace = typeof GRADIENT_COLOR_SPACE[number];
export type GradientPolarColorSpace = typeof GRADIENT_POLAR_COLOR_SPACES[number];