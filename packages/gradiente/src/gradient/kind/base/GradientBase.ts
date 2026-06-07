import {
    parseStringToAbi,
    type GradientAbi,
    type GradientAbiInput,
    splitTopLevelByWhitespace,
} from "../../../abi";
import { roundTo } from "../../../utils";
import { isGradientPolarColorSpace } from "../hue";
import {
    type IGradient,
    type IGradientWithStops,
    type GradientType,
    type GradientStop,
    type GradientJSON,
    type GradientWithStopsJSON,
    type GradientWithStopsJSONExtra,
    type GradientInterpolation,
} from "./types";

type SerializedStopToken =
    | { type: "color-hint"; position: number }
    | {
        type: "color-stop";
        value: string;
        positions: [number] | [number, number];
    };

type PendingGradientStop =
    | {
        type: "color-stop";
        value: string;
        position?: number;
    }
    | {
        type: "color-hint";
        position?: number;
    };

export abstract class GradientBase<TConfig extends object = Record<string, never>> implements IGradient<TConfig> {
    public readonly type: GradientType;
    private _config: TConfig;

    constructor(type: GradientType, config: TConfig) {
        this.type = type;
        this._config = this._cloneConfig(config);
        this._validateConfig(this._config);
    }

    public getConfig(): TConfig {
        return this._cloneConfig(this._config);
    }

    public abstract clone(): this;
    public abstract equals(other: unknown): boolean;
    public abstract toString(): string;

    public toJSON(): GradientJSON<TConfig> {
        return {
            type: this.type,
            config: this.getConfig(),
        } as GradientJSON<TConfig>;
    }

    protected abstract _validateConfig(value: TConfig): void;

    private _cloneConfig(value: TConfig): TConfig {
        return structuredClone(value);
    }
}


export abstract class GradientWithStopsBase<
    TStop extends GradientStop<number, object>,
    TConfig extends GradientWithStopsJSONExtra & { interpolation: GradientInterpolation },
>
extends GradientBase<TConfig>
implements IGradientWithStops<TStop, TConfig> {
    private _stops: TStop[] = [];

    constructor(type: GradientType, stops: TStop[], config: TConfig) {
        config.interpolation = GradientWithStopsBase._normalizeConfigInterpolation(config.interpolation);
        super(type, config);
        this._stops = this._getSortedStops(this._cloneStops(stops));
        this._validateStops(this._stops);
    }


    public static fromAbi(abi: GradientAbi): GradientWithStopsBase<GradientStop, GradientWithStopsJSONExtra & { interpolation: GradientInterpolation }> {
        throw new Error("Gradient deserialization from ABI is not implemented in Base class. Please use specific gradient type classes.");
    }

    public static fromString(input: string): GradientWithStopsBase<GradientStop, GradientWithStopsJSONExtra & { interpolation: GradientInterpolation }> {
        return this.fromAbi(parseStringToAbi(input));
    }

    private static _normalizeConfigInterpolation(value: GradientInterpolation): GradientInterpolation {
        const { colorSpace, hue } = value;
        if (hue === undefined) {
            return { colorSpace };
        }
        if (!isGradientPolarColorSpace(colorSpace)) {
            return { colorSpace };
        }
        return {
            colorSpace,
            hue,
        };
    }


    public isRepeating(): boolean {
        return this.getConfig().isRepeating ?? false;
    }

    public minColorStopsCount(): number {
        return 1;
    }

    public getStops(): TStop[] {
        return this._cloneStops(this._stops);
    }

    public override toJSON(): GradientWithStopsJSON<TStop, TConfig> {
        return {
            ...super.toJSON(),
            stops: this.getStops(),
        };
    }

    public addStop(stop: TStop): void {
        const nextStops = [
            ...this._cloneStops(this._stops),
            ...this._cloneStops([stop]),
        ];
        const sortedStops = this._getSortedStops(nextStops);

        this._validateStops(sortedStops);
        this._stops = sortedStops;
    }

    public removeStop(index: number): void {
        if (!Number.isInteger(index)) {
            throw new TypeError("Gradient stop index must be an integer");
        }

        if (index < 0 || index >= this._stops.length) {
            throw new RangeError("Gradient stop index is out of bounds");
        }

        const colorStopCount = this._stops.filter(
            (stop) => stop.type === "color-stop",
        ).length;

        if (colorStopCount <= this.minColorStopsCount()) {
            throw new Error(
                `Color stop count should be greather than ${this.minColorStopsCount()}`,
            );
        }

        const nextIndex = index + 1 > this._stops.length - 1
            ? this._stops.length - 1
            : index + 1;
        const prevIndex = index - 1 >= 0 ? index - 1 : 0;

        if (index !== nextIndex && this._stops[nextIndex].type === "color-hint") {
            this._stops.splice(nextIndex, 1);
        }

        this._stops.splice(index, 1);

        if (index !== prevIndex && this._stops[prevIndex].type === "color-hint") {
            this._stops.splice(prevIndex, 1);
        }
    }

    protected _serializeStopsCompact(): string[] {
        const tokens = this._buildSerializedStopTokens();

        if (this._canOmitAllStopPositions(tokens)) {
            return tokens.map((token) => {
                if (token.type !== 'color-stop') {
                    throw new Error('Unexpected color-hint token in compact stop serialization');
                }

                return token.value;
            });
        }

        return tokens.map((token) => {
            if (token.type === 'color-hint') {
                return `${this._formatPercent(token.position)}%`;
            }

            if (token.positions.length === 2) {
                return `${token.value} ${this._formatPercent(token.positions[0])}% ${this._formatPercent(token.positions[1])}%`;
            }

            return `${token.value} ${this._formatPercent(token.positions[0])}%`;
        });
    }

    protected _buildSerializedStopTokens(): SerializedStopToken[] {
        const result: SerializedStopToken[] = [];
        const stops = this.getStops();

        for (let index = 0; index < stops.length; index++) {
            const current = stops[index];

            if (current.type === 'color-hint') {
                result.push({
                    type: 'color-hint',
                    position: current.position,
                });
                continue;
            }

            const next = stops[index + 1];

            if (
                next &&
                next.type === 'color-stop' &&
                next.value === current.value
            ) {
                result.push({
                    type: 'color-stop',
                    value: current.value,
                    positions: [current.position, next.position],
                });
                index += 1;
                continue;
            }

            result.push({
                type: 'color-stop',
                value: current.value,
                positions: [current.position],
            });
        }

        return result;
    }

    protected _canOmitAllStopPositions(
        tokens: SerializedStopToken[],
    ): boolean {
        const stopTokens = tokens.filter(
            (token) => token.type === 'color-stop',
        );

        if (tokens.some((token) => token.type === 'color-hint')) {
            return false;
        }

        if (stopTokens.some((token) => token.positions.length !== 1)) {
            return false;
        }

        if (stopTokens.length <= 1) {
            return false;
        }

        const epsilon = 1e-6;

        for (let index = 0; index < stopTokens.length; index++) {
            const expected = index / (stopTokens.length - 1);
            const actual = stopTokens[index].positions[0];

            if (Math.abs(actual - expected) > epsilon) {
                return false;
            }
        }

        return true;
    }

    protected _formatPercent(value: number): number {
        return roundTo(value * 100, 3);
    }

    protected static _normalizeAbiInputsToStops(
        inputs: GradientAbiInput[],
    ): GradientStop[] {
        const pending: PendingGradientStop[] = [];

        for (const input of inputs) {
            if (input.type === "color-hint") {
                pending.push({
                    type: "color-hint",
                    position: this._parsePosition(input.value),
                });
                continue;
            }

            if (input.type === "color-stop") {
                pending.push(...this._parseColorStopInput(input.value));
                continue;
            }

            throw new SyntaxError(
                `Unsupported gradient stop ABI input type: "${input.type}"`,
            );
        }

        return this._resolvePendingStops(pending);
    }

    private static _parsePosition(input: string): number {
        const value = input.trim().toLowerCase();
        const match = value.match(/^([+-]?(?:\d+\.?\d*|\.\d+))%$/);

        if (match === null) {
            throw new SyntaxError(`Invalid gradient stop position: "${input}"`);
        }

        const numeric = Number(match[1]);

        if (!Number.isFinite(numeric)) {
            throw new SyntaxError(`Invalid gradient stop position: "${input}"`);
        }

        return numeric / 100;
    }

    private static _parseColorStopInput(input: string): PendingGradientStop[] {
        const parts = splitTopLevelByWhitespace(input);

        if (parts.length === 0) {
            throw new SyntaxError("Color-stop input cannot be empty");
        }

        const positions: number[] = [];

        while (parts.length > 0) {
            const last = parts[parts.length - 1];

            if (!/%$/.test(last)) {
                break;
            }

            positions.unshift(this._parsePosition(last));
            parts.pop();

            if (positions.length === 2) {
                break;
            }
        }

        const color = parts.join(" ").trim();

        if (color.length === 0) {
            throw new SyntaxError(`Color-stop is missing color value: "${input}"`);
        }

        if (positions.length === 0) {
            return [
                {
                    type: "color-stop",
                    value: color,
                },
            ];
        }

        if (positions.length === 1) {
            return [
                {
                    type: "color-stop",
                    value: color,
                    position: positions[0],
                },
            ];
        }

        return [
            {
                type: "color-stop",
                value: color,
                position: positions[0],
            },
            {
                type: "color-stop",
                value: color,
                position: positions[1],
            },
        ];
    }

    private static _resolvePendingStops(
        input: PendingGradientStop[],
    ): GradientStop[] {
        if (input.length === 0) {
            throw new SyntaxError("Gradient must contain at least one stop");
        }

        const stops = input.map((item) => ({ ...item }));

        const firstColorStopIndex = stops.findIndex(
            (item) => item.type === "color-stop",
        );
        const lastColorStopIndex = [...stops]
            .reverse()
            .findIndex((item) => item.type === "color-stop");

        if (firstColorStopIndex === -1) {
            throw new SyntaxError("Gradient must contain at least one color-stop");
        }

        const realLastColorStopIndex = stops.length - 1 - lastColorStopIndex;

        if (stops[firstColorStopIndex].position === undefined) {
            stops[firstColorStopIndex].position = 0;
        }

        if (stops[realLastColorStopIndex].position === undefined) {
            stops[realLastColorStopIndex].position = 1;
        }

        let segmentStart = -1;

        for (let index = 0; index < stops.length; index++) {
            const current = stops[index];

            if (current.position !== undefined) {
                if (segmentStart !== -1) {
                    const start = stops[segmentStart];
                    const end = current;
                    const gap = index - segmentStart;

                    for (let inner = 1; inner < gap; inner++) {
                        const item = stops[segmentStart + inner];

                        if (item.position === undefined) {
                            item.position =
                                start.position! +
                                ((end.position! - start.position!) * inner) / gap;
                        }
                    }
                }

                segmentStart = index;
            }
        }

        return stops.map((item) => {
            if (item.position === undefined) {
                throw new SyntaxError("Failed to resolve gradient stop position");
            }

            if (item.type === "color-stop") {
                return {
                    type: item.type,
                    value: item.value,
                    position: item.position,
                };
            }

            return {
                type: item.type,
                position: item.position,
            };
        });
    }

    private _cloneStops(stops: TStop[]): TStop[] {
        return structuredClone(stops);
    }

    private _getSortedStops(stops: TStop[]): TStop[] {
        return stops
            .map((stop, index) => ({ stop, index }))
            .sort((a, b) => {
                if (a.stop.position !== b.stop.position) {
                    return a.stop.position - b.stop.position;
                }
                return a.index - b.index; // сохраняем порядок
            })
            .map((item) => item.stop);
    }

    private _validateStops(stops: TStop[]): void {
        this._validateStopsShape(stops);
        this._validateStopsSequence(stops);
    }

    private _validateStopsShape(value: TStop[]): void {
        if (!Array.isArray(value)) {
            throw new TypeError("Gradient stops must be an array");
        }

        for (const stop of value) {
            if (typeof stop !== "object" || stop === null) {
                throw new TypeError("Gradient stop must be an object");
            }

            const stopType = (stop as { type?: unknown }).type;

            if (stopType !== "color-stop" && stopType !== "color-hint") {
                throw new TypeError(`Invalid gradient stop type: ${String(stopType)}`);
            }
            if (stop.type === "color-stop" && typeof stop.value !== "string") {
                throw new TypeError("Gradient stop value must be a string");
            }
            if (typeof stop.position !== "number" || Number.isNaN(stop.position)) {
                throw new TypeError("Gradient stop position must be a valid number");
            }
        }
    }

    private _validateStopsSequence(value: TStop[]): void {
        if (value.length < this.minColorStopsCount()) {
            throw new TypeError(`Gradient must contain at least ${this.minColorStopsCount()} stop`);
        }
        if (value[0].type !== "color-stop") {
            throw new TypeError("Gradient stop sequence must start with a color-stop");
        }
        if (value[value.length - 1].type === "color-hint") {
            throw new TypeError("Gradient stop sequence cannot end with a color-hint");
        }

        for (let index = 1; index < value.length; index++) {
            const prev = value[index - 1];
            const current = value[index];

            if (prev.type === "color-hint" && current.type !== "color-stop") {
                throw new TypeError(
                    "A color-hint must be followed by a color-stop",
                );
            }
        }
    }
}
