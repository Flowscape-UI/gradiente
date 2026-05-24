import {
    MeshGradient,
    type GradientLike,
} from "../../../gradients";
import {
    buildMeshVertexMap,
    buildMeshEdgeSkirtTriangles,
    buildPatchTriangles,
    buildRegularMeshGrid,
    type MeshRenderVertex,
} from "../helpers";
import type { IGradientTransformerModule } from "../types";

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

function encodeSvgDataUrl(svg: string): string {
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export class ModuleTransformerMeshGradientToCss
    implements IGradientTransformerModule<string> {
    public readonly target = "css";
    public readonly gradientType = "mesh-gradient";

    public to(input: GradientLike): string {
        if (!(input instanceof MeshGradient)) {
            throw new Error("Expected MeshGradient");
        }

        const vertexMap = buildMeshVertexMap(input, CSS_SAMPLE_SIZE, CSS_SAMPLE_SIZE);
        const grid = buildRegularMeshGrid(input, vertexMap);
        const subdivisions = input.config.method === "bicubic"
            ? BICUBIC_SUBDIVISIONS
            : 1;
        const triangles = input.patches.flatMap((patch) =>
            buildPatchTriangles(input, grid, patch, vertexMap, subdivisions),
        );
        const edgeTriangles = buildMeshEdgeSkirtTriangles(
            input,
            grid,
            CSS_SAMPLE_SIZE,
            CSS_SAMPLE_SIZE,
            subdivisions,
        );
        const renderTriangles = [
            ...triangles,
            ...edgeTriangles,
        ];
        const rects: string[] = [];

        for (let y = 0; y < CSS_SAMPLE_SIZE; y += 1) {
            for (let x = 0; x < CSS_SAMPLE_SIZE; x += 1) {
                const sampleX = x + 0.5;
                const sampleY = y + 0.5;
                let color: [number, number, number, number] | null = null;

                for (const [a, b, c] of renderTriangles) {
                    const weights = getBarycentric(sampleX, sampleY, a, b, c);

                    if (!weights) {
                        continue;
                    }

                    color = mixTriangleColor(weights, a, b, c);
                    break;
                }

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
