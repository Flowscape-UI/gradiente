import { GradientMesh } from "../../../kind/mesh";
import {
    buildMeshEdgeSkirtTriangles,
    buildMeshRenderContext,
    buildPatchTriangles,
    formatNumber,
    formatRgbaTupleAsCss,
    getAverageMeshTriangleColor,
    resolveMeshRenderSubdivisions,
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
const TRIANGLE_OVERLAP = 0.04;

function expandTrianglePoint(
    point: MeshTriangle[number],
    center: { x: number; y: number },
): string {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    const length = Math.hypot(dx, dy);

    if (length === 0) {
        return `${formatNumber(point.x)} ${formatNumber(point.y)}`;
    }

    const x = point.x + (dx / length) * TRIANGLE_OVERLAP;
    const y = point.y + (dy / length) * TRIANGLE_OVERLAP;

    return `${formatNumber(x)} ${formatNumber(y)}`;
}

function triangleToPolygon(triangle: MeshTriangle): string {
    const [a, b, c] = triangle;
    const average = getAverageMeshTriangleColor(triangle);
    const color = formatRgbaTupleAsCss(
        [
            Math.round(average[0] * 255),
            Math.round(average[1] * 255),
            Math.round(average[2] * 255),
            average[3],
        ],
    );
    const center = {
        x: (a.x + b.x + c.x) / 3,
        y: (a.y + b.y + c.y) / 3,
    };
    const points = [
        expandTrianglePoint(a, center),
        expandTrianglePoint(b, center),
        expandTrianglePoint(c, center),
    ].join(" ");

    return `<polygon points="${points}" fill="${color}"/>`;
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
        const subdivisions = resolveMeshRenderSubdivisions(config, {
            bilinear: BILINEAR_SUBDIVISIONS,
            bicubic: BICUBIC_SUBDIVISIONS,
        });
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
