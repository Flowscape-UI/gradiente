import {
    GRADIENT_COLOR_SPACE,
    GRADIENT_HUE_INTERPOLATIONS,
    GRADIENT_POLAR_COLOR_SPACES,
    type GradientColorSpace,
    type GradientHueInterpolation,
    type GradientPolarColorSpace
} from "./types";

export * from "./types";

export function isGradientHueInterpolation(value: string): value is GradientHueInterpolation {
    return GRADIENT_HUE_INTERPOLATIONS.includes(
        value as GradientHueInterpolation
    );
}

export function isGradientColorSpace(value: string): value is GradientColorSpace {
    return GRADIENT_COLOR_SPACE.includes(
        value as GradientColorSpace
    );
}

export function isGradientPolarColorSpace(
    value: string,
): value is GradientPolarColorSpace {
    return GRADIENT_POLAR_COLOR_SPACES.includes(
        value as GradientPolarColorSpace,
    );
}