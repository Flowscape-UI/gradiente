import {
    converter,
    fixupHueDecreasing,
    fixupHueIncreasing,
    fixupHueLonger,
    fixupHueShorter,
    formatRgb,
    getMode,
    interpolate,
} from "culori";
import type { GradientInterpolation } from "../base";
import type {
    GradientColorSpace,
    GradientHueInterpolation,
} from "../hue";
import type {
    GradientMeshConfig,
    GradientMeshPatch,
    GradientMeshVertex,
} from "./types";

export type GradientMeshGridCoordinate = {
    row: number;
    column: number;
};

export type GradientMeshSampledColor = [number, number, number, number];

export type GradientMeshColorSampler = {
    samplePatchColor(patchId: string, u: number, v: number): string;
    samplePatchColorRgb(
        patchId: string,
        u: number,
        v: number,
    ): GradientMeshSampledColor;
};

type GradientMeshCuloriInterpolationMode =
    | "rgb"
    | "oklab"
    | "lch"
    | "oklch"
    | "hsl"
    | "hwb"
    | "lab"
    | "rec2020"
    | "a98"
    | "p3"
    | "prophoto"
    | "xyz65";

type GradientMeshCuloriColor = {
    mode: GradientMeshCuloriInterpolationMode;
} & Record<string, number | string | undefined>;

type GradientMeshRgbColor = {
    mode: "rgb";
    r: number;
    g: number;
    b: number;
    alpha?: number;
};

type GradientMeshBicubicSampleContext = {
    grid: GradientMeshVertex[][];
    patchCells: Map<string, GradientMeshGridCoordinate>;
    mode: GradientMeshCuloriInterpolationMode;
    channels: string[];
    hue?: GradientHueInterpolation;
    vertexChannels: Map<string, Map<string, number>>;
};

type CuloriColorInterpolator = (t: number) => unknown;

const toRgb = converter("rgb");

function getHueFixup(hue?: GradientHueInterpolation) {
    switch (hue) {
        case "longer":
            return fixupHueLonger;
        case "increasing":
            return fixupHueIncreasing;
        case "decreasing":
            return fixupHueDecreasing;
        default:
            return fixupHueShorter;
    }
}

function colorSpaceToCuloriMode(
    colorSpace: GradientColorSpace,
): GradientMeshCuloriInterpolationMode {
    switch (colorSpace) {
        case "a98-rgb":
            return "a98";
        case "display-p3":
            return "p3";
        case "prophoto-rgb":
            return "prophoto";
        case "xyz":
            return "xyz65";
        case "srgb":
        case "srgb-linear":
            return "rgb";
        default:
            return colorSpace;
    }
}

function getCuloriModeChannels(
    mode: GradientMeshCuloriInterpolationMode,
): string[] {
    const definition = getMode(mode);

    if (definition === undefined) {
        throw new Error(`Unsupported Culori color mode: ${mode}`);
    }

    return definition.channels.filter((channel) => channel !== "alpha");
}

function createCuloriInterpolationOverrides(
    interpolation: GradientInterpolation,
): object | undefined {
    if (interpolation.hue === undefined) {
        return undefined;
    }

    return {
        h: {
            fixup: getHueFixup(interpolation.hue),
        },
    };
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

function clampUnit(value: number): number {
    return clamp(value, 0, 1);
}

function clampIndex(index: number, length: number): number {
    return clamp(index, 0, length - 1);
}

function catmullRom(
    p0: number,
    p1: number,
    p2: number,
    p3: number,
    t: number,
): number {
    const t2 = t * t;
    const t3 = t2 * t;

    return 0.5 * (
        2 * p1 +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
}

function normalizeHue(value: number): number {
    const normalized = value % 360;

    return normalized < 0 ? normalized + 360 : normalized;
}

function formatMeshColor(input: unknown): string {
    const color = toRgb(input as never) as GradientMeshRgbColor | undefined;

    if (!color) {
        throw new Error("Failed to convert sampled mesh color to rgb");
    }

    const formatted = formatRgb(color);

    if (formatted === undefined) {
        throw new Error("Failed to format sampled mesh color");
    }

    return formatted;
}

export function toMeshRgbColor(input: unknown): GradientMeshSampledColor {
    const color = toRgb(input as never) as GradientMeshRgbColor | undefined;

    if (!color) {
        throw new Error("Failed to convert sampled mesh color to rgb");
    }

    return [
        clampUnit(color.r ?? 0),
        clampUnit(color.g ?? 0),
        clampUnit(color.b ?? 0),
        clampUnit(color.alpha ?? 1),
    ];
}

export function readMeshVertexGridCoordinate(
    id: string,
): GradientMeshGridCoordinate | null {
    const separated = id.match(/^v(\d+)[_-](\d+)$/);

    if (separated !== null) {
        return {
            column: Number(separated[1]),
            row: Number(separated[2]),
        };
    }

    const compact = id.match(/^v(\d)(\d)$/);

    if (compact !== null) {
        return {
            column: Number(compact[1]),
            row: Number(compact[2]),
        };
    }

    return null;
}

function buildRegularVertexGrid(
    vertices: GradientMeshVertex[],
    config: GradientMeshConfig,
): GradientMeshVertex[][] {
    const grid = buildRegularVertexGridFromIds(vertices, config);

    if (grid === null) {
        throw new Error(
            "Bicubic mesh sampling requires regular vertex ids such as v00, v10, v01, v11",
        );
    }

    return grid;
}

function buildRegularVertexGridFromIds(
    vertices: GradientMeshVertex[],
    config: GradientMeshConfig,
): GradientMeshVertex[][] | null {
    const result: Array<Array<GradientMeshVertex | undefined>> = Array.from(
        { length: config.rows },
        () => Array.from({ length: config.columns }),
    );

    for (const vertex of vertices) {
        const coordinate = readMeshVertexGridCoordinate(vertex.id);

        if (coordinate === null) {
            return null;
        }

        if (
            coordinate.row < 0 ||
            coordinate.column < 0 ||
            coordinate.row >= config.rows ||
            coordinate.column >= config.columns
        ) {
            return null;
        }

        if (result[coordinate.row][coordinate.column] !== undefined) {
            return null;
        }

        result[coordinate.row][coordinate.column] = vertex;
    }

    if (
        result.some((row) =>
            row.some((vertex) => vertex === undefined),
        )
    ) {
        return null;
    }

    return result as GradientMeshVertex[][];
}

function findPatchCell(
    grid: GradientMeshVertex[][],
    patch: GradientMeshPatch,
): GradientMeshGridCoordinate {
    for (let row = 0; row < grid.length - 1; row += 1) {
        for (let column = 0; column < grid[row].length - 1; column += 1) {
            if (
                grid[row][column].id === patch.topLeft &&
                grid[row][column + 1].id === patch.topRight &&
                grid[row + 1][column + 1].id === patch.bottomRight &&
                grid[row + 1][column].id === patch.bottomLeft
            ) {
                return {
                    row,
                    column,
                };
            }
        }
    }

    throw new Error(
        `Mesh patch does not match adjacent regular grid vertices: ${patch.id}`,
    );
}

function normalizeHueSamples(
    values: number[],
    hue: GradientHueInterpolation | undefined,
): number[] {
    const result = [...values];

    for (let index = 1; index < result.length; index += 1) {
        const previous = result[index - 1];
        let current = result[index];

        if (hue === "increasing") {
            while (current < previous) {
                current += 360;
            }
        } else if (hue === "decreasing") {
            while (current > previous) {
                current -= 360;
            }
        } else if (hue === "longer") {
            const delta = current - previous;

            if (delta > 0 && delta < 180) {
                current -= 360;
            } else if (delta < 0 && delta > -180) {
                current += 360;
            }
        } else {
            while (current - previous > 180) {
                current -= 360;
            }

            while (current - previous < -180) {
                current += 360;
            }
        }

        result[index] = current;
    }

    return result;
}

export function createMeshColorSampler(
    vertices: GradientMeshVertex[],
    patches: GradientMeshPatch[],
    config: GradientMeshConfig,
): GradientMeshColorSampler {
    const vertexById = new Map(vertices.map((vertex) => [vertex.id, vertex]));
    const patchById = new Map(patches.map((patch) => [patch.id, patch]));
    const mode = colorSpaceToCuloriMode(config.interpolation.colorSpace);
    const interpolationOverrides =
        createCuloriInterpolationOverrides(config.interpolation);
    const pairInterpolatorCache = new Map<string, CuloriColorInterpolator>();
    let bicubicContext: GradientMeshBicubicSampleContext | undefined;

    function getVertexOrThrow(id: string): GradientMeshVertex {
        const vertex = vertexById.get(id);

        if (vertex === undefined) {
            throw new Error(`Mesh vertex not found: ${id}`);
        }

        return vertex;
    }

    function getPatchOrThrow(id: string): GradientMeshPatch {
        const patch = patchById.get(id);

        if (patch === undefined) {
            throw new Error(`Mesh patch not found: ${id}`);
        }

        return patch;
    }

    function getPairInterpolator(
        left: string,
        right: string,
    ): CuloriColorInterpolator {
        const cacheKey = `${left}\u0000${right}`;
        const cached = pairInterpolatorCache.get(cacheKey);

        if (cached !== undefined) {
            return cached;
        }

        const colorInterpolator = interpolate(
            [left, right],
            mode as never,
            interpolationOverrides as never,
        ) as CuloriColorInterpolator;

        pairInterpolatorCache.set(cacheKey, colorInterpolator);

        return colorInterpolator;
    }

    function interpolateColor(
        left: string | unknown,
        right: string | unknown,
        t: number,
    ): unknown {
        if (typeof left === "string" && typeof right === "string") {
            return getPairInterpolator(left, right)(t);
        }

        const colorInterpolator = interpolate(
            [left, right] as never,
            mode as never,
            interpolationOverrides as never,
        ) as CuloriColorInterpolator;

        return colorInterpolator(t);
    }

    function sampleBilinearPatchColor(
        patch: GradientMeshPatch,
        u: number,
        v: number,
    ): unknown {
        const topLeft = getVertexOrThrow(patch.topLeft);
        const topRight = getVertexOrThrow(patch.topRight);
        const bottomRight = getVertexOrThrow(patch.bottomRight);
        const bottomLeft = getVertexOrThrow(patch.bottomLeft);
        const top = interpolateColor(topLeft.color, topRight.color, u);
        const bottom = interpolateColor(
            bottomLeft.color,
            bottomRight.color,
            u,
        );

        return interpolateColor(top, bottom, v);
    }

    function buildBicubicSampleContext(): GradientMeshBicubicSampleContext {
        const grid = buildRegularVertexGrid(vertices, config);
        const channels = getCuloriModeChannels(mode);
        const toMode = converter(mode);
        const vertexChannels = new Map<string, Map<string, number>>();
        const patchCells = new Map<string, GradientMeshGridCoordinate>();

        for (const vertex of vertices) {
            const values = new Map<string, number>();
            const rgb = toRgb(vertex.color);

            if (!rgb) {
                throw new Error(`Failed to convert mesh vertex color: ${vertex.color}`);
            }

            values.set("alpha", rgb.alpha ?? 1);

            const color = toMode(vertex.color) as
                | Record<string, number | string | undefined>
                | undefined;

            if (color === undefined) {
                throw new Error(`Failed to convert mesh vertex color: ${vertex.color}`);
            }

            for (const channel of channels) {
                const value = color[channel];

                values.set(
                    channel,
                    typeof value === "number" && Number.isFinite(value)
                        ? value
                        : 0,
                );
            }

            vertexChannels.set(vertex.id, values);
        }

        for (const patch of patches) {
            patchCells.set(patch.id, findPatchCell(grid, patch));
        }

        return {
            grid,
            patchCells,
            mode,
            channels,
            hue: config.interpolation.hue,
            vertexChannels,
        };
    }

    function getBicubicSampleContext(): GradientMeshBicubicSampleContext {
        bicubicContext ??= buildBicubicSampleContext();

        return bicubicContext;
    }

    function readColorChannel(
        context: GradientMeshBicubicSampleContext,
        vertex: GradientMeshVertex,
        channel: string,
    ): number {
        const channels = context.vertexChannels.get(vertex.id);

        if (channels === undefined) {
            throw new Error(`Failed to read mesh vertex color: ${vertex.color}`);
        }

        return channels.get(channel) ?? 0;
    }

    function sampleBicubicColorChannel(
        context: GradientMeshBicubicSampleContext,
        row: number,
        column: number,
        channel: string,
        u: number,
        v: number,
    ): number {
        const rows = context.grid.length;
        const columns = context.grid[0]?.length ?? 0;
        const horizontal: number[] = [];

        for (let y = -1; y <= 2; y += 1) {
            const sampleRow = context.grid[clampIndex(row + y, rows)];
            const values = [
                readColorChannel(
                    context,
                    sampleRow[clampIndex(column - 1, columns)],
                    channel,
                ),
                readColorChannel(
                    context,
                    sampleRow[clampIndex(column, columns)],
                    channel,
                ),
                readColorChannel(
                    context,
                    sampleRow[clampIndex(column + 1, columns)],
                    channel,
                ),
                readColorChannel(
                    context,
                    sampleRow[clampIndex(column + 2, columns)],
                    channel,
                ),
            ];
            const fixedValues = channel === "h"
                ? normalizeHueSamples(values, context.hue)
                : values;

            horizontal.push(catmullRom(
                fixedValues[0],
                fixedValues[1],
                fixedValues[2],
                fixedValues[3],
                u,
            ));
        }

        const vertical = channel === "h"
            ? normalizeHueSamples(horizontal, context.hue)
            : horizontal;
        const sampled = catmullRom(
            vertical[0],
            vertical[1],
            vertical[2],
            vertical[3],
            v,
        );

        return channel === "h" ? normalizeHue(sampled) : sampled;
    }

    function sampleBicubicPatchColor(
        patch: GradientMeshPatch,
        u: number,
        v: number,
    ): GradientMeshCuloriColor {
        const context = getBicubicSampleContext();
        const cell = context.patchCells.get(patch.id);

        if (cell === undefined) {
            throw new Error(
                `Mesh patch does not match adjacent regular grid vertices: ${patch.id}`,
            );
        }

        const color: GradientMeshCuloriColor = {
            mode: context.mode,
        };

        for (const channel of context.channels) {
            color[channel] = sampleBicubicColorChannel(
                context,
                cell.row,
                cell.column,
                channel,
                u,
                v,
            );
        }

        color.alpha = clampUnit(sampleBicubicColorChannel(
            context,
            cell.row,
            cell.column,
            "alpha",
            u,
            v,
        ));

        return color;
    }

    function samplePatchColorValue(
        patchId: string,
        u: number,
        v: number,
    ): unknown {
        const patch = getPatchOrThrow(patchId);

        if (config.method === "bicubic") {
            return sampleBicubicPatchColor(patch, u, v);
        }

        return sampleBilinearPatchColor(patch, u, v);
    }

    return {
        samplePatchColor: (patchId, u, v) =>
            formatMeshColor(samplePatchColorValue(patchId, u, v)),
        samplePatchColorRgb: (patchId, u, v) =>
            toMeshRgbColor(samplePatchColorValue(
                patchId,
                clampUnit(u),
                clampUnit(v),
            )),
    };
}
