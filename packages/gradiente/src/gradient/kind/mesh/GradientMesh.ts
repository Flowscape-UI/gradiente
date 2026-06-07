import { parse as parseColor } from "culori";
import {
    splitTopLevelByWhitespace,
    type GradientAbi,
} from "../../../abi";
import {
    formatGradientLengthPercentage,
    parseGradientLengthPercentage,
    type GradientInterpolation,
    validateGradientLengthPercentage,
} from "../base";
import { GradientBase } from "../base";
import {
    isGradientColorSpace,
    isGradientHueInterpolation,
    isGradientPolarColorSpace,
} from "../hue";
import {
    createMeshColorSampler,
    readMeshVertexGridCoordinate,
    type GradientMeshColorSampler,
    type GradientMeshGridCoordinate,
} from "./mesh-sampler";
import type {
    GradientMeshConfig,
    GradientMeshConfigInput,
    GradientMeshHandle,
    GradientMeshInterpolationMethod,
    GradientMeshJSON,
    GradientMeshPatch,
    GradientMeshPatchSide,
    GradientMeshType,
    GradientMeshVertex,
    IGradientMesh,
} from "./types";

type GradientMeshGridSize = {
    rows: number;
    columns: number;
};

type PendingGradientMeshHandle = {
    patchId: string;
    side: GradientMeshPatchSide;
    from: GradientMeshHandle;
    to: GradientMeshHandle;
};

const MESH_ID_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*$/;
const MESH_PATCH_SIDES: readonly GradientMeshPatchSide[] = [
    "top",
    "right",
    "bottom",
    "left",
];

export class GradientMesh
extends GradientBase<GradientMeshConfig>
implements IGradientMesh {
    private static readonly DEFAULT_CONFIG: GradientMeshConfig = {
        rows: 2,
        columns: 2,
        method: "bilinear",
        interpolation: {
            colorSpace: "srgb",
        },
    };

    public declare readonly type: GradientMeshType;

    private readonly _vertices: GradientMeshVertex[];
    private readonly _patches: GradientMeshPatch[];
    private _colorSampler?: GradientMeshColorSampler;

    constructor(
        vertices: GradientMeshVertex[],
        patches: GradientMeshPatch[],
        config?: GradientMeshConfigInput,
    ) {
        super(
            "mesh-gradient",
            GradientMesh._resolveConfig(vertices, patches, config),
        );

        this._vertices = structuredClone(vertices);
        this._patches = structuredClone(patches);
        this._validateMesh();
    }

    public static normalizeConfig(input: string): GradientMeshConfig {
        const tokens = splitTopLevelByWhitespace(input.trim().toLowerCase());

        if (tokens.length === 0) {
            throw new SyntaxError("Mesh gradient config cannot be empty");
        }

        return GradientMesh._resolveConfig([], [], GradientMesh._parseConfig(tokens));
    }

    public static fromString(input: string): GradientMesh {
        const { functionName, isRepeating, inputs } =
            GradientMesh._parseFunction(input);

        if (functionName !== "mesh-gradient") {
            throw new Error("Invalid function name for GradientMesh");
        }

        if (isRepeating) {
            throw new Error("GradientMesh does not support repeating gradients");
        }

        let config: GradientMeshConfigInput | undefined;
        const vertices: GradientMeshVertex[] = [];
        const patches: GradientMeshPatch[] = [];
        const handles: PendingGradientMeshHandle[] = [];

        for (const rawInput of inputs) {
            const tokens = splitTopLevelByWhitespace(rawInput);
            const kind = tokens[0];

            if (kind === "grid") {
                if (config !== undefined) {
                    throw new Error("mesh-gradient can only contain one grid config");
                }

                config = GradientMesh._parseConfig(tokens);
                continue;
            }

            if (kind === "vertex") {
                vertices.push(GradientMesh._parseVertex(tokens));
                continue;
            }

            if (kind === "patch") {
                patches.push(GradientMesh._parsePatch(tokens));
                continue;
            }

            if (kind === "handle") {
                handles.push(GradientMesh._parseHandle(tokens));
                continue;
            }

            throw new Error(`Unsupported mesh-gradient input: ${rawInput}`);
        }

        return new GradientMesh(
            vertices,
            GradientMesh._attachHandles(patches, handles),
            config,
        );
    }

    public static fromAbi(abi: GradientAbi): GradientMesh {
        if (abi.functionName !== "mesh-gradient") {
            throw new Error("Invalid function name for GradientMesh");
        }

        if (abi.isRepeating) {
            throw new Error("GradientMesh does not support repeating gradients");
        }

        return GradientMesh.fromString(
            `${abi.functionName}(${abi.inputs
                .map((input) => input.value)
                .join(", ")})`,
        );
    }

    public override clone(): this {
        const snapshot = this.toJSON();

        return new GradientMesh(
            snapshot.vertices,
            snapshot.patches,
            snapshot.config,
        ) as this;
    }

    public override equals(other: unknown): boolean {
        return (
            other instanceof GradientMesh &&
            JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON())
        );
    }

    public override toJSON(): GradientMeshJSON {
        return {
            ...super.toJSON(),
            vertices: this.getVertices(),
            patches: this.getPatches(),
        } as GradientMeshJSON;
    }

    public override toString(): string {
        const parts = [
            this._serializeConfig(this.getConfig()),
            ...this._vertices.map((vertex) => this._serializeVertex(vertex)),
            ...this._patches.map((patch) => this._serializePatch(patch)),
            ...this._patches.flatMap((patch) => this._serializeHandles(patch)),
        ];

        return `${this.type}(${parts.join(", ")})`;
    }

    public getVertices(): GradientMeshVertex[] {
        return structuredClone(this._vertices);
    }

    public getPatches(): GradientMeshPatch[] {
        return structuredClone(this._patches);
    }

    public getVertex(id: string): GradientMeshVertex | null {
        const vertex = this._vertices.find((item) => item.id === id);

        return vertex ? structuredClone(vertex) : null;
    }

    public getPatch(id: string): GradientMeshPatch | null {
        const patch = this._patches.find((item) => item.id === id);

        return patch ? structuredClone(patch) : null;
    }

    public samplePatchColor(patchId: string, u: number, v: number): string {
        this._validateSampleCoordinate(u, "u");
        this._validateSampleCoordinate(v, "v");

        return this._getColorSampler().samplePatchColor(patchId, u, v);
    }

    protected override _validateConfig(config: GradientMeshConfig): void {
        if (!Number.isInteger(config.rows) || config.rows < 2) {
            throw new TypeError("Mesh gradient rows must be an integer >= 2");
        }

        if (!Number.isInteger(config.columns) || config.columns < 2) {
            throw new TypeError("Mesh gradient columns must be an integer >= 2");
        }

        if (!GradientMesh._isInterpolationMethod(config.method)) {
            throw new TypeError("Invalid mesh gradient interpolation method");
        }

        if (
            typeof config.interpolation !== "object" ||
            config.interpolation === null
        ) {
            throw new TypeError("Mesh gradient interpolation must be an object");
        }

        if (!isGradientColorSpace(config.interpolation.colorSpace)) {
            throw new TypeError(
                `Invalid mesh gradient color space: "${String(config.interpolation.colorSpace)}"`,
            );
        }

        if (
            config.interpolation.hue !== undefined &&
            !isGradientHueInterpolation(config.interpolation.hue)
        ) {
            throw new TypeError(
                `Invalid mesh gradient hue interpolation: "${String(config.interpolation.hue)}"`,
            );
        }
    }

    private static _resolveConfig(
        vertices: GradientMeshVertex[],
        patches: GradientMeshPatch[],
        input: GradientMeshConfigInput = {},
    ): GradientMeshConfig {
        const inferred = GradientMesh._inferGridSize(vertices, patches);
        const rows =
            input.rows ??
            inferred?.rows ??
            GradientMesh.DEFAULT_CONFIG.rows;
        const columns =
            input.columns ??
            inferred?.columns ??
            GradientMesh._inferMissingColumns(vertices, rows) ??
            GradientMesh.DEFAULT_CONFIG.columns;
        const interpolation = GradientMesh._normalizeInterpolation({
            colorSpace:
                input.interpolation?.colorSpace ??
                GradientMesh.DEFAULT_CONFIG.interpolation.colorSpace,
            hue: input.interpolation?.hue,
        });

        return {
            rows,
            columns,
            method: input.method ?? GradientMesh.DEFAULT_CONFIG.method,
            interpolation,
        };
    }

    private static _inferMissingColumns(
        vertices: GradientMeshVertex[],
        rows: number,
    ): number | undefined {
        if (
            vertices.length === 0 ||
            !Number.isInteger(rows) ||
            rows < 2 ||
            vertices.length % rows !== 0
        ) {
            return undefined;
        }

        const columns = vertices.length / rows;

        return columns >= 2 ? columns : undefined;
    }

    private static _inferGridSize(
        vertices: GradientMeshVertex[],
        patches: GradientMeshPatch[],
    ): GradientMeshGridSize | undefined {
        return (
            GradientMesh._inferGridSizeFromVertexIds(vertices) ??
            GradientMesh._inferGridSizeFromCounts(vertices.length, patches.length)
        );
    }

    private static _inferGridSizeFromVertexIds(
        vertices: GradientMeshVertex[],
    ): GradientMeshGridSize | undefined {
        if (vertices.length === 0) {
            return undefined;
        }

        const coordinates = vertices.map((vertex) =>
            readMeshVertexGridCoordinate(vertex.id),
        );

        if (coordinates.some((coordinate) => coordinate === null)) {
            return undefined;
        }

        const typedCoordinates = coordinates as GradientMeshGridCoordinate[];
        const rows = Math.max(...typedCoordinates.map((item) => item.row)) + 1;
        const columns =
            Math.max(...typedCoordinates.map((item) => item.column)) + 1;

        if (rows * columns !== vertices.length) {
            return undefined;
        }

        return {
            rows,
            columns,
        };
    }

    private static _inferGridSizeFromCounts(
        vertexCount: number,
        patchCount: number,
    ): GradientMeshGridSize | undefined {
        if (vertexCount < 4 || patchCount < 1) {
            return undefined;
        }

        const candidates: GradientMeshGridSize[] = [];

        for (let rows = 2; rows <= vertexCount; rows += 1) {
            if (vertexCount % rows !== 0) {
                continue;
            }

            const columns = vertexCount / rows;

            if (columns < 2) {
                continue;
            }

            if ((rows - 1) * (columns - 1) === patchCount) {
                candidates.push({
                    rows,
                    columns,
                });
            }
        }

        if (candidates.length === 1) {
            return candidates[0];
        }

        return candidates.find((item) => item.rows === item.columns);
    }

    private static _parseConfig(tokens: string[]): GradientMeshConfigInput {
        if (tokens[0] !== "grid" || tokens.length < 3) {
            throw new SyntaxError("Invalid mesh grid config");
        }

        const rows = Number(tokens[1]);
        const columns = Number(tokens[2]);
        let method: GradientMeshInterpolationMethod | undefined;
        let interpolation: GradientMeshConfigInput["interpolation"] | undefined;
        let seenMethod = false;
        let seenInterpolation = false;

        for (let index = 3; index < tokens.length; index += 1) {
            const token = tokens[index];

            if (token === "method") {
                if (seenMethod) {
                    throw new SyntaxError("Duplicate mesh gradient method");
                }

                const value = tokens[index + 1];

                if (!GradientMesh._isInterpolationMethod(value)) {
                    throw new SyntaxError(`Invalid mesh gradient method: ${value}`);
                }

                method = value;
                seenMethod = true;
                index += 1;
                continue;
            }

            if (token === "in") {
                if (seenInterpolation) {
                    throw new SyntaxError("Duplicate mesh gradient interpolation");
                }

                const colorSpace = tokens[index + 1];

                if (
                    colorSpace === undefined ||
                    !isGradientColorSpace(colorSpace)
                ) {
                    throw new SyntaxError(
                        "Invalid mesh-gradient interpolation: missing color space",
                    );
                }

                const maybeHue = tokens[index + 2];
                const maybeHueKeyword = tokens[index + 3];

                if (maybeHue !== undefined && maybeHueKeyword === "hue") {
                    if (!isGradientHueInterpolation(maybeHue)) {
                        throw new SyntaxError(
                            `Invalid mesh-gradient hue interpolation: "${maybeHue}"`,
                        );
                    }

                    interpolation = {
                        colorSpace,
                        hue: maybeHue,
                    };
                    seenInterpolation = true;
                    index += 3;
                    continue;
                }

                interpolation = {
                    colorSpace,
                };
                seenInterpolation = true;
                index += 1;
                continue;
            }

            throw new SyntaxError(`Unsupported mesh grid config token: ${token}`);
        }

        return {
            rows,
            columns,
            method,
            interpolation,
        };
    }

    private static _parseVertex(tokens: string[]): GradientMeshVertex {
        if (tokens.length < 5) {
            throw new SyntaxError("Invalid mesh vertex input");
        }

        return {
            id: tokens[1],
            x: GradientMesh._parseLengthPercentage(tokens[2]),
            y: GradientMesh._parseLengthPercentage(tokens[3]),
            color: tokens.slice(4).join(" "),
        };
    }

    private static _parsePatch(tokens: string[]): GradientMeshPatch {
        if (tokens.length !== 6) {
            throw new SyntaxError("Invalid mesh patch input");
        }

        return {
            id: tokens[1],
            topLeft: tokens[2],
            topRight: tokens[3],
            bottomRight: tokens[4],
            bottomLeft: tokens[5],
        };
    }

    private static _parseHandle(tokens: string[]): PendingGradientMeshHandle {
        if (tokens.length !== 7) {
            throw new SyntaxError("Invalid mesh handle input");
        }

        const side = tokens[2];

        if (!GradientMesh._isPatchSide(side)) {
            throw new SyntaxError(`Invalid mesh handle side: ${side}`);
        }

        return {
            patchId: tokens[1],
            side,
            from: {
                x: GradientMesh._parseLengthPercentage(tokens[3]),
                y: GradientMesh._parseLengthPercentage(tokens[4]),
            },
            to: {
                x: GradientMesh._parseLengthPercentage(tokens[5]),
                y: GradientMesh._parseLengthPercentage(tokens[6]),
            },
        };
    }

    private static _attachHandles(
        patches: GradientMeshPatch[],
        handles: PendingGradientMeshHandle[],
    ): GradientMeshPatch[] {
        const nextPatches = patches.map((patch) => structuredClone(patch));
        const patchMap = new Map(nextPatches.map((patch) => [patch.id, patch]));

        for (const handle of handles) {
            const patch = patchMap.get(handle.patchId);

            if (patch === undefined) {
                throw new Error(`Mesh handle references missing patch: ${handle.patchId}`);
            }

            patch.handles ??= {};

            if (patch.handles[handle.side] !== undefined) {
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

    private static _parseLengthPercentage(input: string) {
        return parseGradientLengthPercentage(input);
    }

    private static _normalizeInterpolation(
        interpolation: GradientInterpolation,
    ): GradientInterpolation {
        const { colorSpace, hue } = interpolation;

        if (hue === undefined || !isGradientPolarColorSpace(colorSpace)) {
            return { colorSpace };
        }

        return {
            colorSpace,
            hue,
        };
    }

    private static _isInterpolationMethod(
        value: string | undefined,
    ): value is GradientMeshInterpolationMethod {
        return value === "bilinear" || value === "bicubic";
    }

    private static _isPatchSide(
        value: string | undefined,
    ): value is GradientMeshPatchSide {
        return (
            value === "top" ||
            value === "right" ||
            value === "bottom" ||
            value === "left"
        );
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

        const closeIndex = GradientMesh._findOuterClosingParenIndex(
            source,
            openIndex,
        );

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

        return {
            functionName,
            isRepeating,
            inputs: GradientMesh._splitTopLevelInputs(
                source.slice(openIndex + 1, closeIndex),
            ),
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
        let braceDepth = 0;
        let bracketDepth = 0;

        for (let index = 0; index < value.length; index += 1) {
            const char = value[index];

            if (char === "(") {
                parenDepth += 1;
                current += char;
                continue;
            }

            if (char === ")") {
                parenDepth -= 1;
                current += char;
                continue;
            }

            if (char === "{") {
                braceDepth += 1;
                current += char;
                continue;
            }

            if (char === "}") {
                braceDepth -= 1;
                current += char;
                continue;
            }

            if (char === "[") {
                bracketDepth += 1;
                current += char;
                continue;
            }

            if (char === "]") {
                bracketDepth -= 1;
                current += char;
                continue;
            }

            if (
                char === "," &&
                parenDepth === 0 &&
                braceDepth === 0 &&
                bracketDepth === 0
            ) {
                GradientMesh._pushTrimmed(result, current);
                current = "";
                continue;
            }

            current += char;
        }

        if (parenDepth !== 0 || braceDepth !== 0 || bracketDepth !== 0) {
            throw new Error("Unbalanced mesh-gradient input parentheses");
        }

        GradientMesh._pushTrimmed(result, current);

        return result;
    }

    private static _pushTrimmed(target: string[], value: string): void {
        const trimmed = value.trim();

        if (trimmed.length > 0) {
            target.push(trimmed);
        }
    }

    private _validateMesh(): void {
        if (!Array.isArray(this._vertices)) {
            throw new TypeError("Mesh gradient vertices must be an array");
        }

        if (!Array.isArray(this._patches)) {
            throw new TypeError("Mesh gradient patches must be an array");
        }

        const config = this.getConfig();
        const expectedVertexCount = config.rows * config.columns;
        const expectedPatchCount = (config.rows - 1) * (config.columns - 1);

        if (this._vertices.length !== expectedVertexCount) {
            throw new Error(
                `Mesh gradient expected ${expectedVertexCount} vertices for ${config.rows}x${config.columns} grid, received ${this._vertices.length}`,
            );
        }

        if (this._patches.length !== expectedPatchCount) {
            throw new Error(
                `Mesh gradient expected ${expectedPatchCount} patches for ${config.rows}x${config.columns} grid, received ${this._patches.length}`,
            );
        }

        const vertexIds = new Set<string>();

        for (const vertex of this._vertices) {
            this._validateId(vertex.id, "vertex");

            if (vertexIds.has(vertex.id)) {
                throw new Error(`Duplicate mesh vertex id: ${vertex.id}`);
            }

            vertexIds.add(vertex.id);
            validateGradientLengthPercentage(vertex.x);
            validateGradientLengthPercentage(vertex.y);

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
            this._validatePatchVertices(patch, vertexIds);
            this._validateHandles(patch);
        }

        this._validateRegularPatchTopology();
    }

    private _validateId(id: string, label: string): void {
        if (!MESH_ID_PATTERN.test(id)) {
            throw new Error(`Invalid mesh ${label} id: ${id}`);
        }
    }

    private _validatePatchVertices(
        patch: GradientMeshPatch,
        vertexIds: Set<string>,
    ): void {
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
    }

    private _validateHandles(patch: GradientMeshPatch): void {
        if (patch.handles === undefined) {
            return;
        }

        for (const side of MESH_PATCH_SIDES) {
            const handle = patch.handles[side];

            if (handle === undefined) {
                continue;
            }

            validateGradientLengthPercentage(handle.from.x);
            validateGradientLengthPercentage(handle.from.y);
            validateGradientLengthPercentage(handle.to.x);
            validateGradientLengthPercentage(handle.to.y);
        }
    }

    private _validateRegularPatchTopology(): void {
        const coordinates = new Map<string, GradientMeshGridCoordinate>();

        for (const vertex of this._vertices) {
            const coordinate = readMeshVertexGridCoordinate(vertex.id);

            if (coordinate === null) {
                return;
            }

            coordinates.set(vertex.id, coordinate);
        }

        const config = this.getConfig();
        const seenCells = new Set<string>();

        for (const [id, coordinate] of coordinates) {
            if (
                coordinate.row < 0 ||
                coordinate.column < 0 ||
                coordinate.row >= config.rows ||
                coordinate.column >= config.columns
            ) {
                throw new Error(`Mesh vertex is outside grid topology: ${id}`);
            }
        }

        for (const patch of this._patches) {
            const topLeft = coordinates.get(patch.topLeft);
            const topRight = coordinates.get(patch.topRight);
            const bottomRight = coordinates.get(patch.bottomRight);
            const bottomLeft = coordinates.get(patch.bottomLeft);

            if (
                topLeft === undefined ||
                topRight === undefined ||
                bottomRight === undefined ||
                bottomLeft === undefined
            ) {
                return;
            }

            const isAdjacent =
                topRight.row === topLeft.row &&
                topRight.column === topLeft.column + 1 &&
                bottomRight.row === topLeft.row + 1 &&
                bottomRight.column === topLeft.column + 1 &&
                bottomLeft.row === topLeft.row + 1 &&
                bottomLeft.column === topLeft.column;

            if (!isAdjacent) {
                throw new Error(
                    `Mesh patch does not match adjacent regular grid vertices: ${patch.id}`,
                );
            }

            const key = `${topLeft.row}:${topLeft.column}`;

            if (seenCells.has(key)) {
                throw new Error(`Duplicate mesh patch cell: ${patch.id}`);
            }

            seenCells.add(key);
        }
    }

    private _serializeConfig(config: GradientMeshConfig): string {
        const parts = [
            "grid",
            String(config.rows),
            String(config.columns),
            "method",
            config.method,
        ];
        const interpolation = this._serializeInterpolation(config.interpolation);

        if (interpolation.length > 0) {
            parts.push(interpolation);
        }

        return parts.join(" ");
    }

    private _serializeInterpolation(interpolation: GradientInterpolation): string {
        if (this._isDefaultInterpolation(interpolation)) {
            return "";
        }

        if (interpolation.hue === undefined) {
            return `in ${interpolation.colorSpace}`;
        }

        return `in ${interpolation.colorSpace} ${interpolation.hue} hue`;
    }

    private _serializeVertex(vertex: GradientMeshVertex): string {
        return [
            "vertex",
            vertex.id,
            formatGradientLengthPercentage(vertex.x),
            formatGradientLengthPercentage(vertex.y),
            vertex.color,
        ].join(" ");
    }

    private _serializePatch(patch: GradientMeshPatch): string {
        return [
            "patch",
            patch.id,
            patch.topLeft,
            patch.topRight,
            patch.bottomRight,
            patch.bottomLeft,
        ].join(" ");
    }

    private _serializeHandles(patch: GradientMeshPatch): string[] {
        if (patch.handles === undefined) {
            return [];
        }

        const result: string[] = [];

        for (const side of MESH_PATCH_SIDES) {
            const handle = patch.handles[side];

            if (handle === undefined) {
                continue;
            }

            result.push([
                "handle",
                patch.id,
                side,
                formatGradientLengthPercentage(handle.from.x),
                formatGradientLengthPercentage(handle.from.y),
                formatGradientLengthPercentage(handle.to.x),
                formatGradientLengthPercentage(handle.to.y),
            ].join(" "));
        }

        return result;
    }

    private _isDefaultInterpolation(
        interpolation: GradientInterpolation,
    ): boolean {
        return (
            interpolation.colorSpace ===
                GradientMesh.DEFAULT_CONFIG.interpolation.colorSpace &&
            interpolation.hue === undefined
        );
    }

    private _validateSampleCoordinate(value: number, label: string): void {
        if (!Number.isFinite(value) || value < 0 || value > 1) {
            throw new RangeError(
                `Mesh patch sample coordinate ${label} must be between 0 and 1`,
            );
        }
    }

    private _getColorSampler(): GradientMeshColorSampler {
        this._colorSampler ??= createMeshColorSampler(
            this._vertices,
            this._patches,
            this.getConfig(),
        );

        return this._colorSampler;
    }
}
