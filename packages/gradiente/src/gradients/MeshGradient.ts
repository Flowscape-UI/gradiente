import { parse as parseColor } from "culori";
import {
    splitTopLevelByWhitespace,
    type GradientAbi,
} from "../abi";
import type { GradientLike } from "./GradientBase";
import {
    isGradientColorSpace,
    isGradientHueInterpolation,
    isGradientPolarColorSpace,
} from "./helpers";
import type {
    GradientInterpolation,
    GradientLengthPercentage,
    GradientLengthUnit,
} from "./types";

export type MeshGradientInterpolationMethod = "bilinear" | "bicubic";
export type MeshGradientPatchSide = "top" | "right" | "bottom" | "left";

const MESH_ID_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const MESH_LENGTH_UNITS: readonly GradientLengthUnit[] = [
    "px",
    "em",
    "rem",
    "vw",
    "vh",
    "vmin",
    "vmax",
    "cm",
    "mm",
    "in",
    "pt",
    "pc",
];

export type MeshGradientConfig = {
    rows: number;
    columns: number;
    method: MeshGradientInterpolationMethod;
    interpolation?: GradientInterpolation;
};

export type MeshGradientVertex = {
    id: string;
    x: GradientLengthPercentage;
    y: GradientLengthPercentage;
    color: string;
};

export type MeshGradientHandle = {
    x: GradientLengthPercentage;
    y: GradientLengthPercentage;
};

export type MeshGradientPatch = {
    id: string;
    topLeft: string;
    topRight: string;
    bottomRight: string;
    bottomLeft: string;
    handles?: {
        top?: { from: MeshGradientHandle; to: MeshGradientHandle };
        right?: { from: MeshGradientHandle; to: MeshGradientHandle };
        bottom?: { from: MeshGradientHandle; to: MeshGradientHandle };
        left?: { from: MeshGradientHandle; to: MeshGradientHandle };
    };
};

export type MeshGradientData = {
    config: MeshGradientConfig;
    vertices: MeshGradientVertex[];
    patches: MeshGradientPatch[];
};

export class MeshGradient implements GradientLike<MeshGradientData> {
    public readonly type = "mesh-gradient";

    private readonly _config: MeshGradientConfig;
    private readonly _vertices: MeshGradientVertex[];
    private readonly _patches: MeshGradientPatch[];

    constructor(input: MeshGradientData) {
        const config = structuredClone(input.config);
        if (config.interpolation) {
            config.interpolation = MeshGradient._normalizeInterpolation(config.interpolation);
        }

        this._config = config;
        this._vertices = structuredClone(input.vertices);
        this._patches = structuredClone(input.patches);

        this._validate();
    }

    public get config(): MeshGradientConfig {
        return structuredClone(this._config);
    }

    public get vertices(): MeshGradientVertex[] {
        return structuredClone(this._vertices);
    }

    public get patches(): MeshGradientPatch[] {
        return structuredClone(this._patches);
    }

    public static fromString(input: string): MeshGradient {
        const { functionName, isRepeating, inputs } = MeshGradient._parseFunction(input);

        if (functionName !== "mesh-gradient") {
            throw new Error("Invalid function name for MeshGradient");
        }

        if (isRepeating) {
            throw new Error("MeshGradient does not support repeating gradients");
        }

        let config: MeshGradientConfig | null = null;
        const vertices: MeshGradientVertex[] = [];
        const patches: MeshGradientPatch[] = [];
        const handles: Array<{
            patchId: string;
            side: MeshGradientPatchSide;
            from: MeshGradientHandle;
            to: MeshGradientHandle;
        }> = [];

        for (const rawInput of inputs) {
            const tokens = splitTopLevelByWhitespace(rawInput);
            const kind = tokens[0];

            if (kind === "grid") {
                if (config !== null) {
                    throw new Error("mesh-gradient can only contain one grid config");
                }

                config = this._parseConfig(tokens);
                continue;
            }

            if (kind === "vertex") {
                vertices.push(this._parseVertex(tokens));
                continue;
            }

            if (kind === "patch") {
                patches.push(this._parsePatch(tokens));
                continue;
            }

            if (kind === "handle") {
                handles.push(this._parseHandle(tokens));
                continue;
            }

            throw new Error(`Unsupported mesh-gradient input: ${rawInput}`);
        }

        if (!config) {
            throw new Error("mesh-gradient requires a grid config");
        }

        const patchesWithHandles = this._attachHandles(patches, handles);

        return new MeshGradient({
            config,
            vertices,
            patches: patchesWithHandles,
        });
    }

    public static fromAbi(abi: GradientAbi): MeshGradient {
        if (abi.functionName !== "mesh-gradient") {
            throw new Error("Invalid function name for MeshGradient");
        }

        if (abi.isRepeating) {
            throw new Error("MeshGradient does not support repeating gradients");
        }

        return MeshGradient.fromString(
            `${abi.functionName}(${abi.inputs.map((input) => input.value).join(", ")})`,
        );
    }

    public clone(): this {
        return new MeshGradient(this.toJSON()) as this;
    }

    public toJSON(): MeshGradientData & { type: "mesh-gradient" } {
        return {
            type: this.type,
            config: this.config,
            vertices: this.vertices,
            patches: this.patches,
        };
    }

    public toString(): string {
        const parts = [
            this._serializeConfig(),
            ...this._vertices.map((vertex) => this._serializeVertex(vertex)),
            ...this._patches.map((patch) => this._serializePatch(patch)),
            ...this._patches.flatMap((patch) => this._serializeHandles(patch)),
        ];

        return `${this.type}(${parts.join(", ")})`;
    }

    public getVertex(id: string): MeshGradientVertex | null {
        const vertex = this._vertices.find((item) => item.id === id);

        return vertex ? structuredClone(vertex) : null;
    }

    private _serializeConfig(): string {
        const parts = [
            "grid",
            String(this._config.rows),
            String(this._config.columns),
            "method",
            this._config.method,
        ];

        if (this._config.interpolation) {
            parts.push("in", this._config.interpolation.colorSpace);

            if (this._config.interpolation.hue) {
                parts.push(this._config.interpolation.hue, "hue");
            }
        }

        return parts.join(" ");
    }

    private _serializeVertex(vertex: MeshGradientVertex): string {
        return [
            "vertex",
            vertex.id,
            this._formatLengthPercentage(vertex.x),
            this._formatLengthPercentage(vertex.y),
            vertex.color,
        ].join(" ");
    }

    private _serializePatch(patch: MeshGradientPatch): string {
        return [
            "patch",
            patch.id,
            patch.topLeft,
            patch.topRight,
            patch.bottomRight,
            patch.bottomLeft,
        ].join(" ");
    }

    private _serializeHandles(patch: MeshGradientPatch): string[] {
        if (!patch.handles) {
            return [];
        }

        const result: string[] = [];
        const sides: MeshGradientPatchSide[] = ["top", "right", "bottom", "left"];

        for (const side of sides) {
            const handle = patch.handles[side];

            if (!handle) {
                continue;
            }

            result.push([
                "handle",
                patch.id,
                side,
                this._formatLengthPercentage(handle.from.x),
                this._formatLengthPercentage(handle.from.y),
                this._formatLengthPercentage(handle.to.x),
                this._formatLengthPercentage(handle.to.y),
            ].join(" "));
        }

        return result;
    }

    private _formatLengthPercentage(value: GradientLengthPercentage): string {
        if (value.kind === "percent") {
            return `${value.value}%`;
        }

        return `${value.value}${value.unit}`;
    }

    private _validate(): void {
        if (!Number.isInteger(this._config.rows) || this._config.rows < 2) {
            throw new Error("Mesh gradient rows must be an integer >= 2");
        }

        if (!Number.isInteger(this._config.columns) || this._config.columns < 2) {
            throw new Error("Mesh gradient columns must be an integer >= 2");
        }

        if (this._config.method !== "bilinear" && this._config.method !== "bicubic") {
            throw new Error("Invalid mesh gradient interpolation method");
        }

        if (
            this._config.interpolation &&
            !isGradientColorSpace(this._config.interpolation.colorSpace)
        ) {
            throw new Error(
                `Invalid mesh gradient color space: ${this._config.interpolation.colorSpace}`,
            );
        }

        const expectedVertexCount = this._config.rows * this._config.columns;
        const expectedPatchCount =
            (this._config.rows - 1) * (this._config.columns - 1);

        if (this._vertices.length !== expectedVertexCount) {
            throw new Error(
                `Mesh gradient expected ${expectedVertexCount} vertices for ${this._config.rows}x${this._config.columns} grid, received ${this._vertices.length}`,
            );
        }

        if (this._patches.length !== expectedPatchCount) {
            throw new Error(
                `Mesh gradient expected ${expectedPatchCount} patches for ${this._config.rows}x${this._config.columns} grid, received ${this._patches.length}`,
            );
        }

        const vertexIds = new Set<string>();

        for (const vertex of this._vertices) {
            this._validateId(vertex.id, "vertex");

            if (vertexIds.has(vertex.id)) {
                throw new Error(`Duplicate mesh vertex id: ${vertex.id}`);
            }

            vertexIds.add(vertex.id);
            this._validateLengthPercentage(vertex.x, `vertex ${vertex.id} x`);
            this._validateLengthPercentage(vertex.y, `vertex ${vertex.id} y`);

            if (!parseColor(vertex.color)) {
                throw new Error(`Invalid mesh vertex color: ${vertex.color}`);
            }
        }

        const patchIds = new Set<string>();

        for (const patch of this._patches) {
            this._validateId(patch.id, "patch");

            if (patchIds.has(patch.id)) {
                throw new Error(`Duplicate mesh patch id: ${patch.id}`);
            }

            patchIds.add(patch.id);

            const ids = [
                patch.topLeft,
                patch.topRight,
                patch.bottomRight,
                patch.bottomLeft,
            ];

            if (new Set(ids).size !== 4) {
                throw new Error(`Mesh patch must use 4 unique vertices: ${patch.id}`);
            }

            for (const id of ids) {
                if (!vertexIds.has(id)) {
                    throw new Error(`Mesh patch references missing vertex: ${id}`);
                }
            }

            if (patch.handles) {
                this._validateHandles(patch);
            }
        }

        if (this._patches.length === 0) {
            throw new Error("Mesh gradient requires at least one patch");
        }
    }

    private _validateId(id: string, label: string): void {
        if (!MESH_ID_PATTERN.test(id)) {
            throw new Error(`Invalid mesh ${label} id: ${id}`);
        }
    }

    private _validateHandles(patch: MeshGradientPatch): void {
        if (!patch.handles) {
            return;
        }

        const sides: MeshGradientPatchSide[] = ["top", "right", "bottom", "left"];

        for (const side of sides) {
            const handle = patch.handles[side];

            if (!handle) {
                continue;
            }

            this._validateLengthPercentage(
                handle.from.x,
                `patch ${patch.id} ${side} handle from x`,
            );
            this._validateLengthPercentage(
                handle.from.y,
                `patch ${patch.id} ${side} handle from y`,
            );
            this._validateLengthPercentage(
                handle.to.x,
                `patch ${patch.id} ${side} handle to x`,
            );
            this._validateLengthPercentage(
                handle.to.y,
                `patch ${patch.id} ${side} handle to y`,
            );
        }
    }

    private _validateLengthPercentage(
        value: GradientLengthPercentage,
        label: string,
    ): void {
        if (value.kind === "percent") {
            if (!Number.isFinite(value.value)) {
                throw new Error(`Invalid mesh ${label}`);
            }
            return;
        }

        if (!Number.isFinite(value.value)) {
            throw new Error(`Invalid mesh ${label}`);
        }
    }

    private static _parseConfig(tokens: string[]): MeshGradientConfig {
        if (tokens.length < 3) {
            throw new Error("Invalid mesh grid config");
        }

        const rows = Number(tokens[1]);
        const columns = Number(tokens[2]);
        let method: MeshGradientInterpolationMethod = "bilinear";
        let interpolation: GradientInterpolation | undefined;

        for (let index = 3; index < tokens.length; index += 1) {
            const token = tokens[index];

            if (token === "method") {
                const value = tokens[index + 1];

                if (value !== "bilinear" && value !== "bicubic") {
                    throw new Error(`Invalid mesh gradient method: ${value}`);
                }

                method = value;
                index += 1;
                continue;
            }

            if (token === "in") {
                const colorSpace = tokens[index + 1];
                const maybeHue = tokens[index + 2];
                const maybeHueKeyword = tokens[index + 3];

                if (!isGradientColorSpace(colorSpace)) {
                    throw new Error(`Invalid mesh gradient color space: ${colorSpace}`);
                }

                if (
                    maybeHue !== undefined &&
                    maybeHueKeyword === "hue" &&
                    isGradientHueInterpolation(maybeHue)
                ) {
                    interpolation = this._normalizeInterpolation({
                        colorSpace,
                        hue: maybeHue,
                    });
                    index += 3;
                    continue;
                }

                interpolation = { colorSpace };
                index += 1;
                continue;
            }

            throw new Error(`Unsupported mesh grid config token: ${token}`);
        }

        return {
            rows,
            columns,
            method,
            interpolation,
        };
    }

    private static _parseVertex(tokens: string[]): MeshGradientVertex {
        if (tokens.length < 5) {
            throw new Error("Invalid mesh vertex input");
        }

        return {
            id: tokens[1],
            x: this._parseLengthPercentage(tokens[2]),
            y: this._parseLengthPercentage(tokens[3]),
            color: tokens.slice(4).join(" "),
        };
    }

    private static _parsePatch(tokens: string[]): MeshGradientPatch {
        if (tokens.length !== 6) {
            throw new Error("Invalid mesh patch input");
        }

        return {
            id: tokens[1],
            topLeft: tokens[2],
            topRight: tokens[3],
            bottomRight: tokens[4],
            bottomLeft: tokens[5],
        };
    }

    private static _parseHandle(tokens: string[]): {
        patchId: string;
        side: MeshGradientPatchSide;
        from: MeshGradientHandle;
        to: MeshGradientHandle;
    } {
        if (tokens.length !== 7) {
            throw new Error("Invalid mesh handle input");
        }

        const side = tokens[2];

        if (side !== "top" && side !== "right" && side !== "bottom" && side !== "left") {
            throw new Error(`Invalid mesh handle side: ${side}`);
        }

        return {
            patchId: tokens[1],
            side,
            from: {
                x: this._parseLengthPercentage(tokens[3]),
                y: this._parseLengthPercentage(tokens[4]),
            },
            to: {
                x: this._parseLengthPercentage(tokens[5]),
                y: this._parseLengthPercentage(tokens[6]),
            },
        };
    }

    private static _attachHandles(
        patches: MeshGradientPatch[],
        handles: Array<{
            patchId: string;
            side: MeshGradientPatchSide;
            from: MeshGradientHandle;
            to: MeshGradientHandle;
        }>,
    ): MeshGradientPatch[] {
        if (handles.length === 0) {
            return patches;
        }

        const patchMap = new Map(patches.map((patch) => [patch.id, patch]));
        const nextPatches = patches.map((patch) => structuredClone(patch));
        const nextPatchMap = new Map(nextPatches.map((patch) => [patch.id, patch]));

        for (const handle of handles) {
            if (!patchMap.has(handle.patchId)) {
                throw new Error(`Mesh handle references missing patch: ${handle.patchId}`);
            }

            const patch = nextPatchMap.get(handle.patchId)!;
            patch.handles ??= {};

            if (patch.handles[handle.side]) {
                throw new Error(
                    `Duplicate mesh handle for patch ${handle.patchId} side ${handle.side}`,
                );
            }

            patch.handles[handle.side] = {
                from: handle.from,
                to: handle.to,
            };
        }

        return nextPatches;
    }

    private static _parseLengthPercentage(input: string): GradientLengthPercentage {
        if (input.endsWith("%")) {
            const value = parseFloat(input);

            if (!Number.isFinite(value)) {
                throw new Error(`Invalid mesh length-percentage: ${input}`);
            }

            return {
                kind: "percent",
                value,
            };
        }

        const match = input.match(/^(-?\d*\.?\d+)([a-zA-Z]+)$/);

        if (!match) {
            throw new Error(`Invalid mesh length-percentage: ${input}`);
        }

        const unit = match[2] as GradientLengthUnit;

        if (!MESH_LENGTH_UNITS.includes(unit)) {
            throw new Error(`Unsupported mesh length unit: ${match[2]}`);
        }

        return {
            kind: "length",
            value: parseFloat(match[1]),
            unit,
        };
    }

    private static _normalizeInterpolation(value: GradientInterpolation): GradientInterpolation {
        const { colorSpace, hue } = value;

        if (hue === undefined || !isGradientPolarColorSpace(colorSpace)) {
            return { colorSpace };
        }

        return { colorSpace, hue };
    }

    private static _parseFunction(input: string): {
        functionName: string;
        isRepeating: boolean;
        inputs: string[];
    } {
        const source = input.trim();
        const openIndex = source.indexOf("(");

        if (openIndex <= 0) {
            throw new Error("Expected mesh-gradient function call");
        }

        let functionName = source.slice(0, openIndex).trim();
        const isRepeating = functionName.startsWith("repeating-");

        if (isRepeating) {
            functionName = functionName.slice("repeating-".length);
        }

        const closeIndex = this._findOuterClosingParenIndex(source, openIndex);

        if (closeIndex === -1) {
            throw new Error("Unclosed mesh-gradient function parenthesis");
        }

        const trailing = source.slice(closeIndex + 1).trim();

        if (
            trailing.length > 0 &&
            !trailing.startsWith(`${functionName}(`) &&
            !trailing.startsWith(`repeating-${functionName}(`)
        ) {
            throw new Error(`Unexpected mesh-gradient trailing input: ${trailing}`);
        }

        const body = source.slice(openIndex + 1, closeIndex);

        return {
            functionName,
            isRepeating,
            inputs: this._splitTopLevelInputs(body),
        };
    }

    private static _findOuterClosingParenIndex(
        value: string,
        openIndex: number,
    ): number {
        let depth = 0;

        for (let index = openIndex; index < value.length; index += 1) {
            const char = value[index];

            if (char === "(") {
                depth += 1;
                continue;
            }

            if (char === ")") {
                depth -= 1;

                if (depth === 0) {
                    return index;
                }

                if (depth < 0) {
                    return -1;
                }
            }
        }

        return -1;
    }

    private static _splitTopLevelInputs(value: string): string[] {
        const result: string[] = [];
        let current = "";
        let parenDepth = 0;

        for (let index = 0; index < value.length; index += 1) {
            const char = value[index];

            if (char === "(") {
                parenDepth += 1;
                current += char;
                continue;
            }

            if (char === ")") {
                parenDepth -= 1;

                if (parenDepth < 0) {
                    throw new Error("Unbalanced mesh-gradient input parentheses");
                }

                current += char;
                continue;
            }

            if (char === "," && parenDepth === 0) {
                this._pushTrimmed(result, current);
                current = "";
                continue;
            }

            current += char;
        }

        this._pushTrimmed(result, current);

        if (parenDepth !== 0) {
            throw new Error("Unbalanced mesh-gradient input parentheses");
        }

        return result;
    }

    private static _pushTrimmed(target: string[], value: string): void {
        const trimmed = value.trim();

        if (trimmed.length > 0) {
            target.push(trimmed);
        }
    }
}
