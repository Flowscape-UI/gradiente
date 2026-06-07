import {
    GradientDiamond,
} from "../../../kind/diamond";
import {
    getRenderableColorStops,
    expandRepeatingStopsTo,
    formatNumber,
    encodeSvgDataUrlCss,
    getMaxVisibleDiamondT,
    resolveDiamondRadii,
    resolveGradientPosition,
    resolveRenderableGradientStops,
    sampleColorStopAtPosition,
} from "../helpers";
import { GradientTransformerModule } from "../GradientTransformerModule";

const DIAMOND_SAMPLE_COUNT = 96;

function buildDiamondPolygon(
    center: { x: number; y: number },
    radii: { x: number; y: number },
    position: number,
): string {
    const x = radii.x * position;
    const y = radii.y * position;

    return [
        `${formatNumber(center.x)} ${formatNumber(center.y - y)}`,
        `${formatNumber(center.x + x)} ${formatNumber(center.y)}`,
        `${formatNumber(center.x)} ${formatNumber(center.y + y)}`,
        `${formatNumber(center.x - x)} ${formatNumber(center.y)}`,
    ].join(" ");
}

export class ModuleTransformerDiamondGradientToCss
extends GradientTransformerModule<GradientDiamond, string> {
    constructor() {
        super({
            target: "css",
            gradientType: "diamond-gradient",
            gradientClass: GradientDiamond,
            expectedName: "GradientDiamond",
        });
    }

    protected transform(gradient: GradientDiamond): string {
        const config = gradient.getConfig();
        const isRepeating = gradient.isRepeating();
        const center = resolveGradientPosition(
            config.position,
            100,
            100,
            {
                context: "CSS diamond gradient",
            },
        );
        const radii = resolveDiamondRadii(
            config.size,
            config.shape,
            center,
            100,
            100,
            {
                context: "CSS diamond gradient",
            },
        );
        const maxVisibleT = getMaxVisibleDiamondT(center, radii, 100, 100);
        const maxT = isRepeating ? maxVisibleT : 1;
        const baseStops = resolveRenderableGradientStops(
            gradient,
            DIAMOND_SAMPLE_COUNT,
        );
        const stops = getRenderableColorStops(
            isRepeating
                ? expandRepeatingStopsTo(baseStops, 0, maxVisibleT)
                : baseStops,
        );
        const outerColor = sampleColorStopAtPosition(stops, maxT);
        const polygons: string[] = [];
        const sampleCount = Math.max(
            DIAMOND_SAMPLE_COUNT,
            Math.ceil(DIAMOND_SAMPLE_COUNT * maxT),
        );

        for (let index = sampleCount; index >= 0; index -= 1) {
            const position = (index / sampleCount) * maxT;
            const color = sampleColorStopAtPosition(stops, position);
            const points = buildDiamondPolygon(center, radii, position);

            polygons.push(`<polygon points="${points}" fill="${color}"/>`);
        }

        const svg = [
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">',
            `<rect width="100" height="100" fill="${outerColor}"/>`,
            ...polygons,
            "</svg>",
        ].join("");

        return encodeSvgDataUrlCss(svg);
    }
}
