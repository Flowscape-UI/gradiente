/**
 * Shared scalar units
 */
export type GradientAngleUnit = "deg" | "rad" | "turn" | "grad";
export type GradientLengthUnit =
    | "px"
    | "em"
    | "rem"
    | "vw"
    | "vh"
    | "vmin"
    | "vmax"
    | "cm"
    | "mm"
    | "in"
    | "pt"
    | "pc";

export type GradientNumberValue = {
    kind: "number";
    value: number;
};

export type GradientPercentValue = {
    kind: "percent";
    value: number; // 0..100 in raw model, or normalize later if хочешь
};

export type GradientLengthValue = {
    kind: "length";
    value: number;
    unit: GradientLengthUnit;
};

export type GradientAngleValue = {
    kind: "angle";
    value: number;
    unit: GradientAngleUnit;
};

export type GradientLengthPercentage =
    | GradientLengthValue
    | GradientPercentValue;

export type GradientPositionKeywordX = "left" | "center" | "right";
export type GradientPositionKeywordY = "top" | "center" | "bottom";

/**
 * Position model
 * Не строка, а нормальная структура.
 */
export type GradientPosition =
    | {
        kind: "keywords";
        x: GradientPositionKeywordX;
        y: GradientPositionKeywordY;
    }
    | {
        kind: "values";
        x: GradientLengthPercentage;
        y: GradientLengthPercentage;
    };

/**
 * Color interpolation
 * Вынесено отдельно от geometry.
 * Это критично для future-proof модели.
 */
export type GradientHueInterpolationMethod =
    | "shorter"
    | "longer"
    | "increasing"
    | "decreasing";

export type GradientRectangularColorSpace =
    | "srgb"
    | "srgb-linear"
    | "display-p3"
    | "display-p3-linear"
    | "a98-rgb"
    | "prophoto-rgb"
    | "rec2020"
    | "lab"
    | "oklab"
    | "xyz"
    | "xyz-d50"
    | "xyz-d65";

export type GradientPolarColorSpace =
    | "hsl"
    | "hwb"
    | "lch"
    | "oklch";

export type GradientColorInterpolation =
    | {
        kind: "rectangular";
        space: GradientRectangularColorSpace;
    }
    | {
        kind: "polar";
        space: GradientPolarColorSpace;
        hueMethod?: GradientHueInterpolationMethod;
    };

/**
 * Shared stop model
 * Твой текущий stop layer сюда ложится нормально.
 */
export type GradientColorStop = {
    type: "color-stop";
    color: string;
    position: number | null;
};

export type GradientColorHint = {
    type: "color-hint";
    position: number;
};

export type GradientStop = {
    type: "color-stop" | "color-hint";
    value: string;
    position: number;
}
/**
 * Base config fields common to all gradient classes
 */
export type GradientCommonConfig = {
    interpolation?: GradientColorInterpolation | null;
};