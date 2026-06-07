import { GradientMesh } from "../../../kind/mesh";
import {
    buildMeshRenderContext,
    buildMeshEdgeSkirtTriangles,
    buildPatchTriangles,
    type MeshRenderVertex,
} from "../helpers";
import { GradientTransformerModule } from "../GradientTransformerModule";

const CSS_SAMPLE_SIZE = 96;
const BICUBIC_SUBDIVISIONS = 24;

function formatRgba(color: [number, number, number, number]): string {
    return `rgba(${color[0]},${color[1]},${color[2]},${Number(color[3].toFixed(3))})`;
}

function getBarycentric(
    x: number,
    y: number,
    a: MeshRenderVertex,
    b: MeshRenderVertex,
    c: MeshRenderVertex,
): [number, number, number] | null {
    const denominator =
        (b.y - c.y) * (a.x - c.x) +
        (c.x - b.x) * (a.y - c.y);

    if (Math.abs(denominator) < 0.000001) {
        return null;
    }

    const wA =
        ((b.y - c.y) * (x - c.x) + (c.x - b.x) * (y - c.y)) /
        denominator;
    const wB =
        ((c.y - a.y) * (x - c.x) + (a.x - c.x) * (y - c.y)) /
        denominator;
    const wC = 1 - wA - wB;

    if (wA < -0.0001 || wB < -0.0001 || wC < -0.0001) {
        return null;
    }

    return [wA, wB, wC];
}

function mixTriangleColor(
    weights: [number, number, number],
    a: MeshRenderVertex,
    b: MeshRenderVertex,
    c: MeshRenderVertex,
): [number, number, number, number] {
    const [wA, wB, wC] = weights;

    return [
        Math.round((a.color[0] * wA + b.color[0] * wB + c.color[0] * wC) * 255),
        Math.round((a.color[1] * wA + b.color[1] * wB + c.color[1] * wC) * 255),
        Math.round((a.color[2] * wA + b.color[2] * wB + c.color[2] * wC) * 255),
        a.color[3] * wA + b.color[3] * wB + c.color[3] * wC,
    ];
}

function paintTriangle(
    colors: Array<[number, number, number, number] | null>,
    width: number,
    height: number,
    a: MeshRenderVertex,
    b: MeshRenderVertex,
    c: MeshRenderVertex,
): void {
    const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)));
    const maxX = Math.min(width - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
    const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)));
    const maxY = Math.min(height - 1, Math.ceil(Math.max(a.y, b.y, c.y)));

    for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
            const offset = y * width + x;

            if (colors[offset] !== null) {
                continue;
            }

            const weights = getBarycentric(x + 0.5, y + 0.5, a, b, c);

            if (!weights) {
                continue;
            }

            colors[offset] = mixTriangleColor(weights, a, b, c);
        }
    }
}

function encodeSvgDataUrl(svg: string): string {
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export class ModuleTransformerMeshGradientToCss
extends GradientTransformerModule<GradientMesh, string> {
    constructor() {
        super({
            target: "css",
            gradientType: "mesh-gradient",
            gradientClass: GradientMesh,
            expectedName: "GradientMesh",
        });
    }

    protected transform(gradient: GradientMesh): string {
        const { config, patches, vertexMap, grid, sampler } =
            buildMeshRenderContext(gradient, CSS_SAMPLE_SIZE, CSS_SAMPLE_SIZE);
        const subdivisions = config.method === "bicubic"
            ? BICUBIC_SUBDIVISIONS
            : 1;
        const triangles = patches.flatMap((patch) =>
            buildPatchTriangles(sampler, patch, vertexMap, subdivisions),
        );
        const edgeTriangles = buildMeshEdgeSkirtTriangles(
            sampler,
            patches,
            grid,
            CSS_SAMPLE_SIZE,
            CSS_SAMPLE_SIZE,
            subdivisions,
        );
        const renderTriangles = [
            ...triangles,
            ...edgeTriangles,
        ];
        const colors: Array<[number, number, number, number] | null> =
            Array.from({ length: CSS_SAMPLE_SIZE * CSS_SAMPLE_SIZE }, () => null);
        const rects: string[] = [];

        for (const [a, b, c] of renderTriangles) {
            paintTriangle(
                colors,
                CSS_SAMPLE_SIZE,
                CSS_SAMPLE_SIZE,
                a,
                b,
                c,
            );
        }

        for (let y = 0; y < CSS_SAMPLE_SIZE; y += 1) {
            for (let x = 0; x < CSS_SAMPLE_SIZE; x += 1) {
                const color = colors[y * CSS_SAMPLE_SIZE + x];

                if (!color) {
                    continue;
                }

                rects.push(
                    `<rect x="${x}" y="${y}" width="1" height="1" fill="${formatRgba(color)}"/>`,
                );
            }
        }

        const svg = [
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CSS_SAMPLE_SIZE} ${CSS_SAMPLE_SIZE}" preserveAspectRatio="none" shape-rendering="crispEdges">`,
            ...rects,
            "</svg>",
        ].join("");

        return encodeSvgDataUrl(svg);
    }
}
