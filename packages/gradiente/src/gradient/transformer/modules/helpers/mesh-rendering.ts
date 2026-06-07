import type {
    GradientLengthPercentage,
} from "../../../kind/base";
import type {
    GradientMesh,
    GradientMeshConfig,
    GradientMeshPatch,
    GradientMeshVertex,
} from "../../../kind/mesh";
import {
    createMeshColorSampler,
    readMeshVertexGridCoordinate,
    toMeshRgbColor,
    type GradientMeshColorSampler,
} from "../../../kind/mesh/mesh-sampler";

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

export type MeshRenderContext = {
    config: GradientMeshConfig;
    patches: GradientMeshPatch[];
    vertexMap: Map<string, MeshRenderVertex>;
    grid: MeshRenderVertex[][];
    sampler: GradientMeshColorSampler;
};

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
    vertex: GradientMeshVertex,
    width: number,
    height: number,
): MeshRenderVertex {
    return {
        id: vertex.id,
        x: resolveLengthPercentage(vertex.x, width),
        y: resolveLengthPercentage(vertex.y, height),
        color: toMeshRgbColor(vertex.color),
    };
}

function buildMeshVertexMapFromVertices(
    vertices: GradientMeshVertex[],
    width: number,
    height: number,
): Map<string, MeshRenderVertex> {
    return new Map(
        vertices.map((vertex) => [
            vertex.id,
            resolveMeshVertex(vertex, width, height),
        ]),
    );
}

export function buildMeshVertexMap(
    gradient: GradientMesh,
    width: number,
    height: number,
): Map<string, MeshRenderVertex> {
    return buildMeshVertexMapFromVertices(
        gradient.getVertices(),
        width,
        height,
    );
}

export function buildRegularMeshGrid(
    gradient: GradientMesh,
    vertexMap: Map<string, MeshRenderVertex>,
): MeshRenderVertex[][] {
    return buildRegularMeshGridFromVertices(
        gradient.getConfig(),
        gradient.getVertices(),
        vertexMap,
    );
}

function buildRegularMeshGridFromVertices(
    config: GradientMeshConfig,
    vertices: GradientMeshVertex[],
    vertexMap: Map<string, MeshRenderVertex>,
): MeshRenderVertex[][] {
    const idGrid = buildRegularMeshGridFromVertexIds(
        config,
        vertices,
        vertexMap,
    );

    if (idGrid) {
        return idGrid;
    }

    const resolvedVertices = vertices
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

    for (let row = 0; row < config.rows; row += 1) {
        const start = row * config.columns;
        const end = start + config.columns;

        result.push(resolvedVertices.slice(start, end));
    }

    return result;
}

function buildRegularMeshGridFromVertexIds(
    config: GradientMeshConfig,
    vertices: GradientMeshVertex[],
    vertexMap: Map<string, MeshRenderVertex>,
): MeshRenderVertex[][] | null {
    const result: MeshRenderVertex[][] = Array.from(
        { length: config.rows },
        () => [],
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

        const resolved = vertexMap.get(vertex.id);

        if (!resolved) {
            throw new Error(`Missing mesh vertex: ${vertex.id}`);
        }

        if (result[coordinate.row][coordinate.column]) {
            return null;
        }

        result[coordinate.row][coordinate.column] = resolved;
    }

    if (
        result.some((row) =>
                row.length !== config.columns ||
            row.some((vertex) => vertex === undefined),
        )
    ) {
        return null;
    }

    return result;
}

export function buildMeshRenderContext(
    gradient: GradientMesh,
    width: number,
    height: number,
): MeshRenderContext {
    const config = gradient.getConfig();
    const vertices = gradient.getVertices();
    const patches = gradient.getPatches();
    const vertexMap = buildMeshVertexMapFromVertices(vertices, width, height);
    const grid = buildRegularMeshGridFromVertices(config, vertices, vertexMap);
    const sampler = createMeshColorSampler(vertices, patches, config);

    return {
        config,
        patches,
        vertexMap,
        grid,
        sampler,
    };
}

function clampColor(value: number): number {
    return Math.min(1, Math.max(0, value));
}

function mix(a: number, b: number, t: number): number {
    return a + (b - a) * t;
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
    sampler: GradientMeshColorSampler,
    patchId: string,
    u: number,
    v: number,
): MeshColor {
    return sampler.samplePatchColorRgb(
        patchId,
        clampColor(u),
        clampColor(v),
    );
}

export function buildPatchTriangles(
    sampler: GradientMeshColorSampler,
    patch: GradientMeshPatch,
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

    const samples: MeshRenderVertex[][] = [];

    for (let y = 0; y <= subdivisions; y += 1) {
        const row: MeshRenderVertex[] = [];
        const v = y / subdivisions;

        for (let x = 0; x <= subdivisions; x += 1) {
            const u = x / subdivisions;
            const position = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u, v);
            const color = samplePatchColor(
                sampler,
                patch.id,
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
    sampler: GradientMeshColorSampler,
    patchId: string,
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
            sampler,
            patchId,
            u,
            v,
        ),
    };
}

function createPatchVertexKey(
    topLeft: string,
    topRight: string,
    bottomRight: string,
    bottomLeft: string,
): string {
    return `${topLeft}\u0000${topRight}\u0000${bottomRight}\u0000${bottomLeft}`;
}

function buildPatchIdsByVertices(
    patches: GradientMeshPatch[],
): Map<string, string> {
    return new Map(
        patches.map((patch) => [
            createPatchVertexKey(
                patch.topLeft,
                patch.topRight,
                patch.bottomRight,
                patch.bottomLeft,
            ),
            patch.id,
        ]),
    );
}

function findPatchIdByVertices(
    patchIdsByVertices: Map<string, string>,
    topLeft: MeshRenderVertex,
    topRight: MeshRenderVertex,
    bottomRight: MeshRenderVertex,
    bottomLeft: MeshRenderVertex,
): string {
    const patchId = patchIdsByVertices.get(createPatchVertexKey(
        topLeft.id,
        topRight.id,
        bottomRight.id,
        bottomLeft.id,
    ));

    if (patchId === undefined) {
        throw new Error(
            `Missing mesh patch for cell ${topLeft.id}/${topRight.id}/${bottomRight.id}/${bottomLeft.id}`,
        );
    }

    return patchId;
}

export function buildMeshEdgeSkirtTriangles(
    sampler: GradientMeshColorSampler,
    patches: GradientMeshPatch[],
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

    const patchIdsByVertices = buildPatchIdsByVertices(patches);

    for (let column = 0; column < columns - 1; column += 1) {
        const topLeft = grid[0][column];
        const topRight = grid[0][column + 1];
        const bottomRight = grid[1][column + 1];
        const bottomLeft = grid[1][column];
        const patchId = findPatchIdByVertices(
            patchIdsByVertices,
            topLeft,
            topRight,
            bottomRight,
            bottomLeft,
        );

        for (let index = 0; index < subdivisions; index += 1) {
            const u0 = index / subdivisions;
            const u1 = (index + 1) / subdivisions;
            const top0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u0, 0);
            const top1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u1, 0);
            const bottom0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u0, 1);
            const bottom1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u1, 1);
            const v0 = Math.min(0, (0 - top0.y) / Math.max(bottom0.y - top0.y, 0.0001));
            const v1 = Math.min(0, (0 - top1.y) / Math.max(bottom1.y - top1.y, 0.0001));
            const boundary0 = samplePatchVertexAt(sampler, patchId, u0, 0, top0.x, top0.y, `top:${column}:${index}:b0`);
            const boundary1 = samplePatchVertexAt(sampler, patchId, u1, 0, top1.x, top1.y, `top:${column}:${index}:b1`);
            const projected0 = samplePatchVertexAt(sampler, patchId, u0, v0, top0.x, 0, `top:${column}:${index}:p0`);
            const projected1 = samplePatchVertexAt(sampler, patchId, u1, v1, top1.x, 0, `top:${column}:${index}:p1`);

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
        const patchId = findPatchIdByVertices(
            patchIdsByVertices,
            topLeft,
            topRight,
            bottomRight,
            bottomLeft,
        );

        for (let index = 0; index < subdivisions; index += 1) {
            const u0 = index / subdivisions;
            const u1 = (index + 1) / subdivisions;
            const top0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u0, 0);
            const top1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u1, 0);
            const bottom0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u0, 1);
            const bottom1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, u1, 1);
            const v0 = Math.max(1, (height - top0.y) / Math.max(bottom0.y - top0.y, 0.0001));
            const v1 = Math.max(1, (height - top1.y) / Math.max(bottom1.y - top1.y, 0.0001));
            const boundary0 = samplePatchVertexAt(sampler, patchId, u0, 1, bottom0.x, bottom0.y, `bottom:${column}:${index}:b0`);
            const boundary1 = samplePatchVertexAt(sampler, patchId, u1, 1, bottom1.x, bottom1.y, `bottom:${column}:${index}:b1`);
            const projected0 = samplePatchVertexAt(sampler, patchId, u0, v0, bottom0.x, height, `bottom:${column}:${index}:p0`);
            const projected1 = samplePatchVertexAt(sampler, patchId, u1, v1, bottom1.x, height, `bottom:${column}:${index}:p1`);

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
        const patchId = findPatchIdByVertices(
            patchIdsByVertices,
            topLeft,
            topRight,
            bottomRight,
            bottomLeft,
        );

        for (let index = 0; index < subdivisions; index += 1) {
            const v0 = index / subdivisions;
            const v1 = (index + 1) / subdivisions;
            const left0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 0, v0);
            const left1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 0, v1);
            const right0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 1, v0);
            const right1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 1, v1);
            const u0 = Math.min(0, (0 - left0.x) / Math.max(right0.x - left0.x, 0.0001));
            const u1 = Math.min(0, (0 - left1.x) / Math.max(right1.x - left1.x, 0.0001));
            const boundary0 = samplePatchVertexAt(sampler, patchId, 0, v0, left0.x, left0.y, `left:${row}:${index}:b0`);
            const boundary1 = samplePatchVertexAt(sampler, patchId, 0, v1, left1.x, left1.y, `left:${row}:${index}:b1`);
            const projected0 = samplePatchVertexAt(sampler, patchId, u0, v0, 0, left0.y, `left:${row}:${index}:p0`);
            const projected1 = samplePatchVertexAt(sampler, patchId, u1, v1, 0, left1.y, `left:${row}:${index}:p1`);

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
        const patchId = findPatchIdByVertices(
            patchIdsByVertices,
            topLeft,
            topRight,
            bottomRight,
            bottomLeft,
        );

        for (let index = 0; index < subdivisions; index += 1) {
            const v0 = index / subdivisions;
            const v1 = (index + 1) / subdivisions;
            const left0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 0, v0);
            const left1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 0, v1);
            const right0 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 1, v0);
            const right1 = samplePosition(topLeft, topRight, bottomRight, bottomLeft, 1, v1);
            const u0 = Math.max(1, (width - left0.x) / Math.max(right0.x - left0.x, 0.0001));
            const u1 = Math.max(1, (width - left1.x) / Math.max(right1.x - left1.x, 0.0001));
            const boundary0 = samplePatchVertexAt(sampler, patchId, 1, v0, right0.x, right0.y, `right:${row}:${index}:b0`);
            const boundary1 = samplePatchVertexAt(sampler, patchId, 1, v1, right1.x, right1.y, `right:${row}:${index}:b1`);
            const projected0 = samplePatchVertexAt(sampler, patchId, u0, v0, width, right0.y, `right:${row}:${index}:p0`);
            const projected1 = samplePatchVertexAt(sampler, patchId, u1, v1, width, right1.y, `right:${row}:${index}:p1`);

            triangles.push(
                [boundary0, projected0, projected1],
                [boundary0, projected1, boundary1],
            );
        }
    }

    return triangles;
}
