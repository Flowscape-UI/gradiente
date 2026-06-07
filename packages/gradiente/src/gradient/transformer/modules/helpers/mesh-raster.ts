import type {
    MeshColor,
    MeshRenderVertex,
    MeshTriangle,
} from "./mesh-rendering";

export type MeshBarycentricWeights = [number, number, number];

/**
 * RU: Считает barycentric-веса точки внутри mesh-треугольника.
 * EN: Computes barycentric weights for a point inside a mesh triangle.
 */
export function getMeshBarycentricWeights(
    x: number,
    y: number,
    a: MeshRenderVertex,
    b: MeshRenderVertex,
    c: MeshRenderVertex,
): MeshBarycentricWeights | null {
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
    const epsilon = -0.0001;

    if (wA < epsilon || wB < epsilon || wC < epsilon) {
        return null;
    }

    return [wA, wB, wC];
}

/**
 * RU: Смешивает цвета вершин mesh-треугольника по barycentric-весам.
 * EN: Mixes mesh triangle vertex colors using barycentric weights.
 */
export function mixMeshTriangleColor(
    weights: MeshBarycentricWeights,
    a: MeshRenderVertex,
    b: MeshRenderVertex,
    c: MeshRenderVertex,
): MeshColor {
    const [wA, wB, wC] = weights;

    return [
        a.color[0] * wA + b.color[0] * wB + c.color[0] * wC,
        a.color[1] * wA + b.color[1] * wB + c.color[1] * wC,
        a.color[2] * wA + b.color[2] * wB + c.color[2] * wC,
        a.color[3] * wA + b.color[3] * wB + c.color[3] * wC,
    ];
}

/**
 * RU: Возвращает средний цвет треугольника по трем вершинам.
 * EN: Returns the average color of a triangle from its three vertices.
 */
export function getAverageMeshTriangleColor(
    triangle: MeshTriangle,
): MeshColor {
    const [a, b, c] = triangle;

    return [
        (a.color[0] + b.color[0] + c.color[0]) / 3,
        (a.color[1] + b.color[1] + c.color[1]) / 3,
        (a.color[2] + b.color[2] + c.color[2]) / 3,
        (a.color[3] + b.color[3] + c.color[3]) / 3,
    ];
}

/**
 * RU: Проходит по пикселям внутри mesh-треугольника и вызывает callback с цветом.
 * EN: Iterates pixels inside a mesh triangle and calls back with the mixed color.
 */
export function rasterizeMeshTriangle(
    width: number,
    height: number,
    triangle: MeshTriangle,
    visit: (x: number, y: number, color: MeshColor) => void,
): void {
    const [a, b, c] = triangle;
    const minX = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)));
    const maxX = Math.min(width - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
    const minY = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)));
    const maxY = Math.min(height - 1, Math.ceil(Math.max(a.y, b.y, c.y)));

    for (let y = minY; y <= maxY; y += 1) {
        for (let x = minX; x <= maxX; x += 1) {
            const weights = getMeshBarycentricWeights(
                x + 0.5,
                y + 0.5,
                a,
                b,
                c,
            );

            if (!weights) {
                continue;
            }

            visit(x, y, mixMeshTriangleColor(weights, a, b, c));
        }
    }
}
