import { converter } from "culori";
import type {
    GradientLengthPercentage,
    MeshGradient,
    MeshGradientPatch,
    MeshGradientVertex,
} from "../../../gradients";

const toRgb = converter("rgb");

export type MeshColor = [number, number, number, number];

export type MeshRenderVertex = {
    id: string;
    x: number;
    y: number;
    color: MeshColor;
};

export type MeshTriangle = [
    MeshRenderVertex,
    MeshRenderVertex,
    MeshRenderVertex,
];

function toColor(input: string): MeshColor {
    const color = toRgb(input);

    if (!color) {
        throw new Error(`Failed to convert color: ${input}`);
    }

    return [
        color.r ?? 0,
        color.g ?? 0,
        color.b ?? 0,
        color.alpha ?? 1,
    ];
}

function resolveLengthPercentage(
    value: GradientLengthPercentage,
    reference: number,
): number {
    if (value.kind === "percent") {
        return (value.value / 100) * reference;
    }

    if (value.unit === "px") {
        return value.value;
    }

    throw new Error(`Unsupported mesh-gradient length unit: ${value.unit}`);
}

export function resolveMeshVertex(
    vertex: MeshGradientVertex,
    width: number,
    height: number,
): MeshRenderVertex {
    return {
        id: vertex.id,
        x: resolveLengthPercentage(vertex.x, width),
        y: resolveLengthPercentage(vertex.y, height),
        color: toColor(vertex.color),
    };
}

export function buildMeshVertexMap(
    gradient: MeshGradient,
    width: number,
    height: number,
): Map<string, MeshRenderVertex> {
    return new Map(
        gradient.vertices.map((vertex) => [
            vertex.id,
            resolveMeshVertex(vertex, width, height),
        ]),
    );
}

export function buildRegularMeshGrid(
    gradient: MeshGradient,
    vertexMap: Map<string, MeshRenderVertex>,
): MeshRenderVertex[][] {
    const idGrid = buildRegularMeshGridFromVertexIds(gradient, vertexMap);

    if (idGrid) {
        return idGrid;
    }

    const vertices = gradient.vertices
        .map((vertex) => {
            const resolved = vertexMap.get(vertex.id);

            if (!resolved) {
                throw new Error(`Missing mesh vertex: ${vertex.id}`);
            }

            return resolved;
        })
        .sort((a, b) => {
            if (Math.abs(a.y - b.y) > 0.0001) {
                return a.y - b.y;
            }

            return a.x - b.x;
        });
    const result: MeshRenderVertex[][] = [];

    for (let row = 0; row < gradient.config.rows; row += 1) {
        const start = row * gradient.config.columns;
        const end = start + gradient.config.columns;

        result.push(vertices.slice(start, end));
    }

    return result;
}

function buildRegularMeshGridFromVertexIds(
    gradient: MeshGradient,
    vertexMap: Map<string, MeshRenderVertex>,
): MeshRenderVertex[][] | null {
    const result: MeshRenderVertex[][] = Array.from(
        { length: gradient.config.rows },
        () => [],
    );

    for (const vertex of gradient.vertices) {
        const match = vertex.id.match(/^v(\d+)(\d+)$/);

        if (!match) {
            return null;
        }

        const column = Number(match[1]);
        const row = Number(match[2]);

        if (
            !Number.isInteger(row) ||
            !Number.isInteger(column) ||
            row < 0 ||
            column < 0 ||
            row >= gradient.config.rows ||
            column >= gradient.config.columns
        ) {
            return null;
        }

        const resolved = vertexMap.get(vertex.id);

        if (!resolved) {
            throw new Error(`Missing mesh vertex: ${vertex.id}`);
        }

        if (result[row][column]) {
            return null;
        }

        result[row][column] = resolved;
    }

    if (
        result.some((row) =>
            row.length !== gradient.config.columns ||
            row.some((vertex) => vertex === undefined),
        )
    ) {
        return null;
    }

    return result;
}

export function findPatchCell(
    grid: MeshRenderVertex[][],
    patch: MeshGradientPatch,
): { row: number; column: number } {
    for (let row = 0; row < grid.length - 1; row += 1) {
        for (let column = 0; column < grid[row].length - 1; column += 1) {
            if (
                grid[row][column].id === patch.topLeft &&
                grid[row][column + 1].id === patch.topRight &&
                grid[row + 1][column + 1].id === patch.bottomRight &&
                grid[row + 1][column].id === patch.bottomLeft
            ) {
                return { row, column };
            }
        }
    }

    throw new Error(
        `Mesh patch does not match adjacent regular grid vertices: ${patch.id}`,
    );
}

function clampIndex(index: number, length: number): number {
    return Math.min(length - 1, Math.max(0, index));
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

function clampColor(value: number): number {
    return Math.min(1, Math.max(0, value));
}

function mix(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

export function mixColor(a: MeshColor, b: MeshColor, t: number): MeshColor {
    return [
        mix(a[0], b[0], t),
        mix(a[1], b[1], t),
        mix(a[2], b[2], t),
        mix(a[3], b[3], t),
    ];
}

export function sampleBilinearColor(
    topLeft: MeshRenderVertex,
    topRight: MeshRenderVertex,
    bottomRight: MeshRenderVertex,
    bottomLeft: MeshRenderVertex,
    u: number,
    v: number,
): MeshColor {
    return mixColor(
        mixColor(topLeft.color, topRight.color, u),
        mixColor(bottomLeft.color, bottomRight.color, u),
        v,
    );
}

export function sampleBicubicColor(
    grid: MeshRenderVertex[][],
    row: number,
    column: number,
    u: number,
    v: number,
): MeshColor {
    const rows = grid.length;
    const columns = grid[0]?.length ?? 0;
    const color: MeshColor = [0, 0, 0, 0];

    for (let channel = 0; channel < 4; channel += 1) {
        const values: number[] = [];

        for (let y = -1; y <= 2; y += 1) {
            const sampleRow = grid[clampIndex(row + y, rows)];
            const p0 = sampleRow[clampIndex(column - 1, columns)].color[channel];
            const p1 = sampleRow[clampIndex(column, columns)].color[channel];
            const p2 = sampleRow[clampIndex(column + 1, columns)].color[channel];
            const p3 = sampleRow[clampIndex(column + 2, columns)].color[channel];

            values.push(catmullRom(p0, p1, p2, p3, u));
        }

        color[channel] = clampColor(
            catmullRom(values[0], values[1], values[2], values[3], v),
        );
    }

    return color;
}

function samplePosition(
    topLeft: MeshRenderVertex,
    topRight: MeshRenderVertex,
    bottomRight: MeshRenderVertex,
    bottomLeft: MeshRenderVertex,
    u: number,
    v: number,
): { x: number; y: number } {
    const topX = mix(topLeft.x, topRight.x, u);
    const topY = mix(topLeft.y, topRight.y, u);
    const bottomX = mix(bottomLeft.x, bottomRight.x, u);
    const bottomY = mix(bottomLeft.y, bottomRight.y, u);

    return {
        x: mix(topX, bottomX, v),
        y: mix(topY, bottomY, v),
    };
}

function samplePatchColor(
    gradient: MeshGradient,
    grid: MeshRenderVertex[][],
    row: number,
    column: number,
    topLeft: MeshRenderVertex,
    topRight: MeshRenderVertex,
    bottomRight: MeshRenderVertex,
    bottomLeft: MeshRenderVertex,
    u: number,
    v: number,
): MeshColor {
    if (gradient.config.method === "bicubic") {
        return sampleBicubicColor(grid, row, column, u, v);
    }

    return sampleBilinearColor(topLeft, topRight, bottomRight, bottomLeft, u, v)
        .map(clampColor) as MeshColor;
}

export function buildPatchTriangles(
    gradient: MeshGradient,
    grid: MeshRenderVertex[][],
    patch: MeshGradientPatch,
    vertexMap: Map<string, MeshRenderVertex>,
    subdivisions: number,
): MeshTriangle[] {
    const topLeft = vertexMap.get(patch.topLeft);
    const topRight = vertexMap.get(patch.topRight);
    const bottomRight = vertexMap.get(patch.bottomRight);
    const bottomLeft = vertexMap.get(patch.bottomLeft);

    if (!topLeft || !topRight || !bottomRight || !bottomLeft) {
        throw new Error(`Mesh patch references missing vertex: ${patch.id}`);
    }

    const cell = findPatchCell(grid, patch);
    const samples: MeshRenderVertex[][] = [];

    for (let y = 0; y <= subdivisions; y += 1) {
        const row: MeshRenderVertex[] = [];
        const v = y / subdivisions;

        for (let x = 0; x <= subdivisions; x += 1) {
            const u = x / subdivisions;
            const position = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u, v);
            const color = samplePatchColor(
                gradient,
                grid,
                cell.row,
                cell.column,
                topLeft,
                topRight,
                bottomRight,
                bottomLeft,
                u,
                v,
            );

            row.push({
                id: `${patch.id}:${x}:${y}`,
                x: position.x,
                y: position.y,
                color,
            });
        }

        samples.push(row);
    }

    const triangles: MeshTriangle[] = [];

    for (let y = 0; y < subdivisions; y += 1) {
        for (let x = 0; x < subdivisions; x += 1) {
            const topLeftSample = samples[y][x];
            const topRightSample = samples[y][x + 1];
            const bottomRightSample = samples[y + 1][x + 1];
            const bottomLeftSample = samples[y + 1][x];

            triangles.push(
                [topLeftSample, topRightSample, bottomRightSample],
                [topLeftSample, bottomRightSample, bottomLeftSample],
            );
        }
    }

    return triangles;
}

function samplePatchVertexAt(
    gradient: MeshGradient,
    grid: MeshRenderVertex[][],
    row: number,
    column: number,
    topLeft: MeshRenderVertex,
    topRight: MeshRenderVertex,
    bottomRight: MeshRenderVertex,
    bottomLeft: MeshRenderVertex,
    u: number,
    v: number,
    x: number,
    y: number,
    id: string,
): MeshRenderVertex {
    return {
        id,
        x,
        y,
        color: samplePatchColor(
            gradient,
            grid,
            row,
            column,
            topLeft,
            topRight,
            bottomRight,
            bottomLeft,
            u,
            v,
        ),
    };
}

export function buildMeshEdgeSkirtTriangles(
    gradient: MeshGradient,
    grid: MeshRenderVertex[][],
    width: number,
    height: number,
    subdivisions: number,
): MeshTriangle[] {
    const triangles: MeshTriangle[] = [];
    const rows = grid.length;
    const columns = grid[0]?.length ?? 0;

    if (rows < 2 || columns < 2) {
        return triangles;
    }

    for (let column = 0; column < columns - 1; column += 1) {
        const topLeft = grid[0][column];
        const topRight = grid[0][column + 1];
        const bottomRight = grid[1][column + 1];
        const bottomLeft = grid[1][column];

        for (let index = 0; index < subdivisions; index += 1) {
            const u0 = index / subdivisions;
            const u1 = (index + 1) / subdivisions;
            const top0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u0, 0);
            const top1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u1, 0);
            const bottom0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u0, 1);
            const bottom1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u1, 1);
            const v0 = Math.min(0, (0 - top0.y) / Math.max(bottom0.y - top0.y, 0.0001));
            const v1 = Math.min(0, (0 - top1.y) / Math.max(bottom1.y - top1.y, 0.0001));
            const boundary0 = samplePatchVertexAt(gradient, grid, 0, column, topLeft, topRight, bottomRight, bottomLeft, u0, 0, top0.x, top0.y, `top:${column}:${index}:b0`);
            const boundary1 = samplePatchVertexAt(gradient, grid, 0, column, topLeft, topRight, bottomRight, bottomLeft, u1, 0, top1.x, top1.y, `top:${column}:${index}:b1`);
            const projected0 = samplePatchVertexAt(gradient, grid, 0, column, topLeft, topRight, bottomRight, bottomLeft, u0, v0, top0.x, 0, `top:${column}:${index}:p0`);
            const projected1 = samplePatchVertexAt(gradient, grid, 0, column, topLeft, topRight, bottomRight, bottomLeft, u1, v1, top1.x, 0, `top:${column}:${index}:p1`);

            triangles.push(
                [projected0, projected1, boundary1],
                [projected0, boundary1, boundary0],
            );
        }
    }

    for (let column = 0; column < columns - 1; column += 1) {
        const row = rows - 2;
        const topLeft = grid[row][column];
        const topRight = grid[row][column + 1];
        const bottomRight = grid[row + 1][column + 1];
        const bottomLeft = grid[row + 1][column];

        for (let index = 0; index < subdivisions; index += 1) {
            const u0 = index / subdivisions;
            const u1 = (index + 1) / subdivisions;
            const top0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u0, 0);
            const top1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u1, 0);
            const bottom0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u0, 1);
            const bottom1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u1, 1);
            const v0 = Math.max(1, (height - top0.y) / Math.max(bottom0.y - top0.y, 0.0001));
            const v1 = Math.max(1, (height - top1.y) / Math.max(bottom1.y - top1.y, 0.0001));
            const boundary0 = samplePatchVertexAt(gradient, grid, row, column, topLeft, topRight, bottomRight, bottomLeft, u0, 1, bottom0.x, bottom0.y, `bottom:${column}:${index}:b0`);
            const boundary1 = samplePatchVertexAt(gradient, grid, row, column, topLeft, topRight, bottomRight, bottomLeft, u1, 1, bottom1.x, bottom1.y, `bottom:${column}:${index}:b1`);
            const projected0 = samplePatchVertexAt(gradient, grid, row, column, topLeft, topRight, bottomRight, bottomLeft, u0, v0, bottom0.x, height, `bottom:${column}:${index}:p0`);
            const projected1 = samplePatchVertexAt(gradient, grid, row, column, topLeft, topRight, bottomRight, bottomLeft, u1, v1, bottom1.x, height, `bottom:${column}:${index}:p1`);

            triangles.push(
                [boundary0, boundary1, projected1],
                [boundary0, projected1, projected0],
            );
        }
    }

    for (let row = 0; row < rows - 1; row += 1) {
        const topLeft = grid[row][0];
        const topRight = grid[row][1];
        const bottomRight = grid[row + 1][1];
        const bottomLeft = grid[row + 1][0];

        for (let index = 0; index < subdivisions; index += 1) {
            const v0 = index / subdivisions;
            const v1 = (index + 1) / subdivisions;
            const left0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 0, v0);
            const left1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 0, v1);
            const right0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 1, v0);
            const right1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 1, v1);
            const u0 = Math.min(0, (0 - left0.x) / Math.max(right0.x - left0.x, 0.0001));
            const u1 = Math.min(0, (0 - left1.x) / Math.max(right1.x - left1.x, 0.0001));
            const boundary0 = samplePatchVertexAt(gradient, grid, row, 0, topLeft, topRight, bottomRight, bottomLeft, 0, v0, left0.x, left0.y, `left:${row}:${index}:b0`);
            const boundary1 = samplePatchVertexAt(gradient, grid, row, 0, topLeft, topRight, bottomRight, bottomLeft, 0, v1, left1.x, left1.y, `left:${row}:${index}:b1`);
            const projected0 = samplePatchVertexAt(gradient, grid, row, 0, topLeft, topRight, bottomRight, bottomLeft, u0, v0, 0, left0.y, `left:${row}:${index}:p0`);
            const projected1 = samplePatchVertexAt(gradient, grid, row, 0, topLeft, topRight, bottomRight, bottomLeft, u1, v1, 0, left1.y, `left:${row}:${index}:p1`);

            triangles.push(
                [projected0, boundary0, boundary1],
                [projected0, boundary1, projected1],
            );
        }
    }

    for (let row = 0; row < rows - 1; row += 1) {
        const column = columns - 2;
        const topLeft = grid[row][column];
        const topRight = grid[row][column + 1];
        const bottomRight = grid[row + 1][column + 1];
        const bottomLeft = grid[row + 1][column];

        for (let index = 0; index < subdivisions; index += 1) {
            const v0 = index / subdivisions;
            const v1 = (index + 1) / subdivisions;
            const left0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 0, v0);
            const left1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 0, v1);
            const right0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 1, v0);
            const right1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 1, v1);
            const u0 = Math.max(1, (width - left0.x) / Math.max(right0.x - left0.x, 0.0001));
            const u1 = Math.max(1, (width - left1.x) / Math.max(right1.x - left1.x, 0.0001));
            const boundary0 = samplePatchVertexAt(gradient, grid, row, column, topLeft, topRight, bottomRight, bottomLeft, 1, v0, right0.x, right0.y, `right:${row}:${index}:b0`);
            const boundary1 = samplePatchVertexAt(gradient, grid, row, column, topLeft, topRight, bottomRight, bottomLeft, 1, v1, right1.x, right1.y, `right:${row}:${index}:b1`);
            const projected0 = samplePatchVertexAt(gradient, grid, row, column, topLeft, topRight, bottomRight, bottomLeft, u0, v0, width, right0.y, `right:${row}:${index}:p0`);
            const projected1 = samplePatchVertexAt(gradient, grid, row, column, topLeft, topRight, bottomRight, bottomLeft, u1, v1, width, right1.y, `right:${row}:${index}:p1`);

            triangles.push(
                [boundary0, projected0, projected1],
                [boundary0, projected1, boundary1],
            );
        }
    }

    return triangles;
}
