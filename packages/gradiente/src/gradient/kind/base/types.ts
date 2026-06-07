import {
    type GradientColorSpace,
    type GradientHueInterpolation
} from "../hue";

export type GradientType = string;
export type GradientStopKind = "color-stop" | "color-hint";

export type GradientColorStop<
    TPosition = number,
    TMeta extends object = {},
> = {
    type: "color-stop";
    value: string;
    position: TPosition;
} & TMeta;


export type GradientColorHint<TPosition = number> = {
    type: "color-hint";
    position: TPosition;
};

export type GradientStop<
    TPosition = number,
    TMeta extends object = {},
> =
    | GradientColorStop<TPosition, TMeta>
    | GradientColorHint<TPosition>;


export type GradientInterpolation = {
    colorSpace: GradientColorSpace;
    hue?: GradientHueInterpolation;
};

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

export type GradientAngleUnit = "deg" | "rad" | "turn" | "grad";

export type GradientAngleValue = {
    kind: "angle";
    value: number;
    unit: GradientAngleUnit;
};

export type GradientPercentValue = {
    kind: "percent";
    value: number;
};

export type GradientLengthValue = {
    kind: "length";
    value: number;
    unit: GradientLengthUnit;
};

export type GradientLengthPercentage =
    | GradientLengthValue
    | GradientPercentValue;

export type GradientPositionKeywordX = "left" | "center" | "right";
export type GradientPositionKeywordY = "top" | "center" | "bottom";

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

export type GradientJSON<
    TConfig extends object = Record<string, never>,
    TExtra extends object = {},
> = {
    type: GradientType;
    config: TConfig;
} & TExtra;

export type GradientWithStopsJSONExtra = {
    isRepeating?: boolean;
};

export type GradientWithStopsJSON<
    TStop = GradientStop,
    TConfig extends object = Record<string, never>,
> = GradientJSON<TConfig, {
    stops: TStop[];
}>;

export interface IGradient<
    TConfig extends object = Record<string, never>
> {
    readonly type: GradientType;

    getConfig(): TConfig;
    clone(): this;
    equals(other: unknown): boolean;
    toString(): string;
    toJSON(): GradientJSON<TConfig>;
}

export interface IGradientWithStops<
    TStop = GradientStop,
    TConfig extends object = Record<string, never>,
> extends IGradient<TConfig> {
    isRepeating(): boolean;
    getStops(): TStop[];
    addStop(stop: TStop): void;
    removeStop(index: number): void;
    minColorStopsCount(): number;
    toJSON(): GradientWithStopsJSON<TStop, TConfig>;
}
