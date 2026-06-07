import { describe, expect, it } from "vitest";
import { GradientLinear } from "../../../src/gradient";
import { resolveRenderableGradientStops } from "../../../src/gradient/transformer/modules/helpers";

const HINTED_LINEAR_GRADIENT =
    "linear-gradient(to right in srgb, red 0%, 35%, blue 100%)";

function getColorAtPosition(
    stops: Array<{ type: string; value?: string; position: number }>,
    position: number,
): string {
    const stop = stops.find((item) =>
        item.type === "color-stop" &&
        Math.abs(item.position - position) < 1e-6,
    );

    if (stop?.value === undefined) {
        throw new Error(`Expected color stop at ${position}`);
    }

    return stop.value;
}

describe("GradientTransformer color hints", () => {
    it("uses color-hint as the midpoint of renderer sampling", () => {
        const gradient = GradientLinear.fromString(HINTED_LINEAR_GRADIENT);
        const stops = resolveRenderableGradientStops(gradient, 100);

        expect(getColorAtPosition(stops, 0.35)).toBe("rgb(128, 0, 128)");
    });
});
