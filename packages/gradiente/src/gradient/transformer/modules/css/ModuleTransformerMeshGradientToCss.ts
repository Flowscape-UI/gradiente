import { GradientMesh } from "../../../kind/mesh";
import {
    buildMeshRenderContext,
    buildMeshEdgeSkirtTriangles,
    buildPatchTriangles,
    encodeSvgDataUrlCss,
    formatRgbaTupleAsCss,
    rasterizeMeshTriangle,
    resolveMeshRenderSubdivisions,
    type MeshTriangle,
} from "../helpers";
import { GradientTransformerModule } from "../GradientTransformerModule";

const CSS_SAMPLE_SIZE = 96;

function paintTriangle(
    colors: Array<[number, number, number, number] | null>,
    width: number,
    height: number,
    triangle: MeshTriangle,
): void {
    rasterizeMeshTriangle(width, height, triangle, (x, y, color) => {
        const offset = y * width + x;

        if (colors[offset] !== null) {
            return;
        }

        colors[offset] = [
            Math.round(color[0] * 255),
            Math.round(color[1] * 255),
            Math.round(color[2] * 255),
            color[3],
        ];
    });
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
        const subdivisions = resolveMeshRenderSubdivisions(config);
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

        for (const triangle of renderTriangles) {
            paintTriangle(
                colors,
                CSS_SAMPLE_SIZE,
                CSS_SAMPLE_SIZE,
                triangle,
            );
        }

        for (let y = 0; y < CSS_SAMPLE_SIZE; y += 1) {
            for (let x = 0; x < CSS_SAMPLE_SIZE; x += 1) {
                const color = colors[y * CSS_SAMPLE_SIZE + x];

                if (!color) {
                    continue;
                }

                rects.push(
                    `<rect x="${x}" y="${y}" width="1" height="1" fill="${formatRgbaTupleAsCss(color, 3, ",")}"/>`,
                );
            }
        }

        const svg = [
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CSS_SAMPLE_SIZE} ${CSS_SAMPLE_SIZE}" preserveAspectRatio="none" shape-rendering="crispEdges">`,
            ...rects,
            "</svg>",
        ].join("");

        return encodeSvgDataUrlCss(svg);
    }
}
