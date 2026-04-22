import { splitTopLevelByWhitespace, type GradientAbi, type GradientAbiInput } from "../abi";
import { roundTo } from "../utils";
import type { GradientStop } from "./types";

export type GradientType = string;

export interface GradientData<TConfig = unknown> {
    isRepeating: boolean;
    config: TConfig;
    stops: GradientStop[];
}


export interface IGradientBase<TConfig = unknown> {
    readonly type: GradientType;
    readonly isRepeating: boolean;
    readonly config: TConfig;
    readonly stops: GradientStop[];

    clone(): this;
    toString(): string;
    toJSON(): GradientData<TConfig>;
    addStop(stop: GradientStop): void;
    removeStop(index: number): void;
    equals(other: IGradientBase<TConfig>): boolean;
}

export abstract class GradientBase<TConfig = unknown> implements IGradientBase<TConfig> {
    public abstract readonly type: GradientType;
    private _isRepeating: boolean;
    private _config: TConfig;
    private _stops: GradientStop[];

    constructor(options: GradientData<TConfig>) {
        this._isRepeating = options.isRepeating;
        this._config = this._cloneConfig(options.config);
        this._stops = this._getSortedStops(this._cloneStops(options.stops));

        this._validateConfig(this._config);
        this._validateStops(this._stops);
    }

    public get isRepeating(): boolean {
        return this._isRepeating;
    }

    public get config(): TConfig {
        return this._cloneConfig(this._config);
    }

    public get stops(): GradientStop[] {
        return this._cloneStops(this._stops);
    }

    public abstract clone(): this;
    public abstract toString(): string;

    public toJSON(): GradientData<TConfig> & {type: GradientType} {
        return {
            type: this.type,
            isRepeating: this.isRepeating,
            config: this.config,
            stops: this.stops
        };
    }

    public addStop(stop: GradientStop): void {
        const nextStops = [
            ...this._cloneStops(this._stops),
            ...this._cloneStops([stop]),
        ];
        const sortedStops = this._getSortedStops(nextStops);
        this._validateStops(sortedStops);
        this._stops = sortedStops;
    }

    public static fromString(_: string): void {
        throw new Error("Not implimented");
    }
    public static fromAbi(_: GradientAbi): void {
        throw new Error("Not implimented");
    }

    public removeStop(index: number): void {
        if (!Number.isInteger(index)) {
            throw new TypeError("Gradient stop index must be an integer");
        }
        if (index < 0 || index >= this._stops.length) {
            throw new RangeError("Gradient stop index is out of bounds");
        }
        const colorStopCount = this._stops.filter(stop => stop.type === "color-stop").length;
        if (colorStopCount <= this._minColorStopsCount()) {
            throw new Error(`Color stop count should be greather than ${this._minColorStopsCount()}`);
        }

        const nextIndex = index + 1 > this._stops.length - 1 ? this._stops.length - 1 : index + 1;
        const prevIndex = index - 1 >= 0 ? index - 1 : 0;

        // Check if next is not color-hint
        if (index !== nextIndex && this._stops[nextIndex].type === "color-hint") {
            this._stops.splice(nextIndex, 1);
        }

        this._stops.splice(index, 1);

        // Check if prev is not color-hint
        if (index !== prevIndex && this._stops[prevIndex].type === "color-hint") {
            this._stops.splice(prevIndex, 1);
        }
    }

    public equals(other: IGradientBase<TConfig>): boolean {
        if (this.type !== other.type) {
            return false;
        }
        if (this.isRepeating !== other.isRepeating) {
            return false;
        }
        if (JSON.stringify(this.config) !== JSON.stringify(other.config)) {
            return false;
        }
        if (this.stops.length !== other.stops.length) {
            return false;
        }

        for (let index = 0; index < this.stops.length; index++) {
            const left = this.stops[index];
            const right = other.stops[index];

            if (
                left.type !== right.type ||
                left.value !== right.value ||
                left.position !== right.position
            ) {
                return false;
            }
        }

        return true;
    }

    protected _minColorStopsCount(): number {
        return 0;
    }

    protected _getSortedStops(stops: GradientStop[]): GradientStop[] {
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

    protected abstract _validateConfig(value: TConfig): void;

    private _validateStops(value: GradientStop[]): void {
        this._validateStopsShape(value);
        this._validateStopsSequence(value);
    }

    protected _validateStopsShape(value: GradientStop[]): void {
        if (!Array.isArray(value)) {
            throw new TypeError("Gradient stops must be an array");
        }

        for (const stop of value) {
            if (typeof stop !== "object" || stop === null) {
                throw new TypeError("Gradient stop must be an object");
            }
            if (stop.type !== "color-stop" && stop.type !== "color-hint") {
                throw new TypeError(`Invalid gradient stop type: ${String(stop.type)}`);
            }
            if (typeof stop.value !== "string") {
                throw new TypeError("Gradient stop value must be a string");
            }
            if (typeof stop.position !== "number" || Number.isNaN(stop.position)) {
                throw new TypeError("Gradient stop position must be a valid number");
            }
        }
    }

    protected _validateStopsSequence(value: GradientStop[]): void {
        if (value.length < this._minColorStopsCount()) {
            throw new TypeError(`Gradient must contain at least ${this._minColorStopsCount()} stop`);
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

    private _cloneStops(stops: readonly GradientStop[]): GradientStop[] {
        return stops.map((stop) => ({ ...stop }));
    }

    private _cloneConfig(value: TConfig): TConfig {
        if (typeof value !== 'object' || value === null) {
            return value;
        }

        if (Array.isArray(value)) {
            return [...value] as TConfig;
        }

        return { ...(value as Record<string, unknown>) } as TConfig;
    }



    protected _buildSerializedStopTokens(): Array<
        | { type: 'color-hint'; position: number }
        | { type: 'color-stop'; value: string; positions: [number] | [number, number] }
    > {
        const result: Array<
            | { type: 'color-hint'; position: number }
            | { type: 'color-stop'; value: string; positions: [number] | [number, number] }
        > = [];

        for (let index = 0; index < this.stops.length; index++) {
            const current = this.stops[index];

            if (current.type === 'color-hint') {
                result.push({
                    type: 'color-hint',
                    position: current.position,
                });
                continue;
            }

            const next = this.stops[index + 1];

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
        tokens: Array<
            | { type: 'color-hint'; position: number }
            | { type: 'color-stop'; value: string; positions: [number] | [number, number] }
        >,
    ): boolean {
        const stopTokens = tokens.filter(
            (token) => token.type === 'color-stop',
        ) as Array<{ type: 'color-stop'; value: string; positions: [number] | [number, number] }>;

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

    protected _formatPercent(value: number): number {
        return roundTo(value * 100, 3);
    }

    protected static _normalizeAbiInputsToStops(
        inputs: GradientAbiInput[],
    ): GradientStop[] {
        const pending: (Omit<GradientStop, "position"> & { position?: number })[] = [];

        for (const input of inputs) {
            if (input.type === 'color-hint') {
                pending.push({
                    type: 'color-hint',
                    value: input.value,
                    position: this._parsePosition(input.value),
                });
                continue;
            }

            if (input.type === 'color-stop') {
                const parsed = this._parseColorStopInput(input.value);
                pending.push(...parsed);
                continue;
            }

            throw new SyntaxError(
                `Unsupported linear gradient ABI input type: "${input.type}"`,
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

    private static _parseColorStopInput(input: string): (Omit<GradientStop, "position"> & { position?: number })[] {
        const parts = splitTopLevelByWhitespace(input);

        if (parts.length === 0) {
            throw new SyntaxError('Color-stop input cannot be empty');
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

        const color = parts.join(' ').trim();

        if (color.length === 0) {
            throw new SyntaxError(`Color-stop is missing color value: "${input}"`);
        }

        if (positions.length === 0) {
            return [
                {
                    type: 'color-stop',
                    value: color,
                },
            ];
        }

        if (positions.length === 1) {
            return [
                {
                    type: 'color-stop',
                    value: color,
                    position: positions[0],
                },
            ];
        }

        return [
            {
                type: 'color-stop',
                value: color,
                position: positions[0],
            },
            {
                type: 'color-stop',
                value: color,
                position: positions[1],
            },
        ];
    }

    private static _resolvePendingStops(
        input: (Omit<GradientStop, "position"> & { position?: number })[],
    ): GradientStop[] {
        if (input.length === 0) {
            throw new SyntaxError('Linear gradient must contain at least one stop');
        }

        const stops = input.map((item) => ({ ...item }));

        const firstColorStopIndex = stops.findIndex((item) => item.type === 'color-stop');
        const lastColorStopIndex = [...stops]
            .reverse()
            .findIndex((item) => item.type === 'color-stop');

        if (firstColorStopIndex === -1) {
            throw new SyntaxError('Linear gradient must contain at least one color-stop');
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
                throw new SyntaxError('Failed to resolve gradient stop position');
            }

            return {
                type: item.type,
                value: item.value,
                position: item.position,
            };
        });
    }
}