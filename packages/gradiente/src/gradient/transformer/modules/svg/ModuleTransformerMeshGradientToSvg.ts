import { GradientMesh } from "../../../kind/mesh";
import {
    buildMeshEdgeSkirtTriangles,
    buildMeshRenderContext,
    buildPatchTriangles,
    type MeshRenderVertex,
    type MeshTriangle,
} from "../helpers";
import { GradientTransformerModule } from "../GradientTransformerModule";
import type { ISvgGradientResult } from "../types";
import {
    buildSvgGradientResult,
    encodeSvgDataUrl,
    escapeXml,
} from "./helpers";

const DEFAULT_ID = "gradiente-mesh-gradient";
const MESH_VIEW_BOX_SIZE = 100;
const BILINEAR_SUBDIVISIONS = 32;
const BICUBIC_SUBDIVISIONS = 40;

function formatRgba(color: [number, number, number, number]): string {
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${Number(color[3].toFixed(4))})`;
}

function getTriangleColor(
    a: MeshRenderVertex,
    b: MeshRenderVertex,
    c: MeshRenderVertex,
): [number, number, number, number] {
    return [
        Math.round(((a.color[0] + b.color[0] + c.color[0]) / 3) * 255),
        Math.round(((a.color[1] + b.color[1] + c.color[1]) / 3) * 255),
        Math.round(((a.color[2] + b.color[2] + c.color[2]) / 3) * 255),
        (a.color[3] + b.color[3] + c.color[3]) / 3,
    ];
}

function formatNumber(value: number): string {
    return `${Number(value.toFixed(3))}`;
}

function triangleToPolygon(triangle: MeshTriangle): string {
    const [a, b, c] = triangle;
    const color = formatRgba(getTriangleColor(a, b, c));
    const points = [
        `${formatNumber(a.x)} ${formatNumber(a.y)}`,
        `${formatNumber(b.x)} ${formatNumber(b.y)}`,
        `${formatNumber(c.x)} ${formatNumber(c.y)}`,
    ].join(" ");

    return `<polygon points="${points}" fill="${color}" stroke="${color}" stroke-width="0.08"/>`;
}

export class ModuleTransformerMeshGradientToSvg
extends GradientTransformerModule<GradientMesh, ISvgGradientResult> {
    constructor() {
        super({
            target: "svg",
            gradientType: "mesh-gradient",
            gradientClass: GradientMesh,
            expectedName: "GradientMesh",
        });
    }

    protected transform(gradientValue: GradientMesh): ISvgGradientResult {
        const id = DEFAULT_ID;
        const { config, patches, vertexMap, grid, sampler } =
            buildMeshRenderContext(
                gradientValue,
                MESH_VIEW_BOX_SIZE,
                MESH_VIEW_BOX_SIZE,
            );
        const subdivisions = config.method === "bicubic"
            ? BICUBIC_SUBDIVISIONS
            : BILINEAR_SUBDIVISIONS;
        const patchTriangles = patches.flatMap((patch) =>
            buildPatchTriangles(sampler, patch, vertexMap, subdivisions),
        );
        const edgeTriangles = buildMeshEdgeSkirtTriangles(
            sampler,
            patches,
            grid,
            MESH_VIEW_BOX_SIZE,
            MESH_VIEW_BOX_SIZE,
            subdivisions,
        );
        const triangles = [
            ...patchTriangles,
            ...edgeTriangles,
        ];
        const polygons = triangles.map(triangleToPolygon);

        const imageSvg = [
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MESH_VIEW_BOX_SIZE} ${MESH_VIEW_BOX_SIZE}" width="${MESH_VIEW_BOX_SIZE}" height="${MESH_VIEW_BOX_SIZE}" preserveAspectRatio="none">`,
            ...polygons,
            "</svg>",
        ].join("");
        const gradient = [
            `<pattern id="${id}" patternUnits="objectBoundingBox" width="1" height="1" viewBox="0 0 ${MESH_VIEW_BOX_SIZE} ${MESH_VIEW_BOX_SIZE}" preserveAspectRatio="none">`,
            `<image width="${MESH_VIEW_BOX_SIZE}" height="${MESH_VIEW_BOX_SIZE}" href="${escapeXml(encodeSvgDataUrl(imageSvg))}"/>`,
            "</pattern>",
        ].join("");

        return buildSvgGradientResult({
            id,
            type: "pattern",
            gradient,
        });
    }
}
