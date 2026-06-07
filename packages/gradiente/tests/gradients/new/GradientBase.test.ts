import { describe, expect, it } from "vitest";
import {
    GradientBase,
    GradientWithStopsBase,
    type GradientInterpolation,
    type GradientStop,
    type GradientWithStopsJSONExtra,
} from "../../../src/gradient";

type TestGradientConfig = {
    name: string;
};

type TestGradientWithStopsConfig = GradientWithStopsJSONExtra & {
    interpolation: GradientInterpolation;
    name: string;
};

class TestGradient extends GradientBase<TestGradientConfig> {
    constructor(config?: TestGradientConfig) {
        super("test-gradient", {
            name: config?.name ?? "test-gradient",
            ...config,
        });
    }

    public override clone(): this {
        return new TestGradient(this.getConfig()) as this;
    }

    public override equals(other: unknown): boolean {
        return (
            other instanceof TestGradient &&
            JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON())
        );
    }

    public override toString(): string {
        return "test-gradient()";
    }

    protected override _validateConfig(config: TestGradientConfig): void {
        if (config.name.length === 0) {
            throw new Error("Test gradient name cannot be empty");
        }
    }
}

class TestGradientWithStops extends GradientWithStopsBase<
    GradientStop,
    TestGradientWithStopsConfig
> {
    constructor(
        stops: GradientStop[],
        config?: TestGradientWithStopsConfig,
    ) {
        super(
            "test-gradient-with-stops",
            stops,
            {
                interpolation: config?.interpolation ?? { colorSpace: "srgb" },
                isRepeating: config?.isRepeating ?? false,
                name: config?.name ?? "test-gradient-with-stops",
                ...config,
            }
        );
    }

    public override clone(): this {
        return new TestGradientWithStops(
            this.getStops(),
            this.getConfig(),
        ) as this;
    }

    public override equals(other: unknown): boolean {
        return (
            other instanceof TestGradientWithStops &&
            JSON.stringify(this.toJSON()) === JSON.stringify(other.toJSON()) &&
            JSON.stringify(this.getStops()) === JSON.stringify(other.getStops())
        );
    }

    public override toString(): string {
        return "test-gradient-with-stops()";
    }

    protected override _validateConfig(
        config: TestGradientWithStopsConfig,
    ): void {
        if (config.name.length === 0) {
            throw new Error("Test gradient with stops name cannot be empty");
        }
    }
}

describe("GradientBase", () => {
    describe("Basic implementation", () => {
        it("Should create an instance of GradientBase", () => {
            const gradient = new TestGradient();
            const gradientWithStops = new TestGradientWithStops([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);
            expect(gradient).toBeInstanceOf(TestGradient);
            expect(gradientWithStops).toBeInstanceOf(TestGradientWithStops);
        });

        it("Should set and get config correctly", () => {
            const config: TestGradientConfig = { name: "custom-gradient" };
            const gradient = new TestGradient(config);
            const gradientWithStops = new TestGradientWithStops([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);
            expect(gradient.getConfig()).toEqual(config);
            expect(gradientWithStops.getConfig()).toEqual({
                isRepeating: false,
                interpolation: { colorSpace: "srgb" },
                name: "test-gradient-with-stops",
            });
        });

        it("Should allow change config from constructor", () => {
            const config: TestGradientConfig = { name: "custom-gradient" };
            const gradient = new TestGradient(config);
            const gradientWithStops = new TestGradientWithStops([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "blue", position: 1 },
            ], {
                isRepeating: true,
                interpolation: { colorSpace: "oklab" },
                name: "custom-gradient-with-stops",
            });
            expect(gradient.getConfig()).toEqual(config);
            expect(gradientWithStops.getConfig()).toEqual({
                isRepeating: true,
                interpolation: { colorSpace: "oklab" },
                name: "custom-gradient-with-stops",
            });
        });
    });

    describe("Mutability", () => {
        it("Should not allow changing config properties after creation", () => {
            const configGradient: TestGradientConfig = { name: "immutable-gradient" };

            const stops: any = [
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "blue", position: 1 },
            ];
            const configGradientWithStops: TestGradientWithStopsConfig = {
                isRepeating: false,
                interpolation: { colorSpace: "srgb" },
                name: "immutable-gradient-with-stops",
            };

            const gradient = new TestGradient(configGradient);
            const gradientWithStops = new TestGradientWithStops(stops, configGradientWithStops);

            // Does not change the original config objects
            gradient.getConfig().name = "changed-name";
            gradientWithStops.getConfig().name = "changed-name";
            gradientWithStops.getStops()[0].type = "green";

            // Does not change the config of the gradient instances
            configGradient.name = "changed-name";
            configGradientWithStops.name = "changed-name";
            stops[0].type = "green";


            expect(gradient.getConfig().name).toBe("immutable-gradient");
            expect(gradientWithStops.getConfig().name).toBe("immutable-gradient-with-stops");
            expect(gradientWithStops.getStops()[0].type).toBe("color-stop");
            expect(gradientWithStops.getStops()[0].value).toBe("red");
            expect(gradientWithStops.getStops()[0].position).toBe(0);
        });
    });

    describe("Stops", () => {
        it("Should add and remove stops correctly", () => {
            const gradientWithStops = new TestGradientWithStops([
                { type: "color-stop", value: "blue", position: 1 },
                { type: "color-stop", value: "red", position: 0 },
            ]);

            expect(gradientWithStops.getStops()).toEqual([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);

            gradientWithStops.addStop({ type: "color-stop", value: "green", position: 0.5 });
            expect(gradientWithStops.getStops()).toEqual([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "green", position: 0.5 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);

            gradientWithStops.removeStop(1);
            expect(gradientWithStops.getStops()).toEqual([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);

            // Adding removing color-hint stops
            gradientWithStops.addStop({ type: "color-hint", position: 0.25 });
            expect(gradientWithStops.getStops()).toEqual([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-hint", position: 0.25 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);

            gradientWithStops.removeStop(1);
            expect(gradientWithStops.getStops()).toEqual([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);
        });

        it("Should throw if add color-hint stop not between two color-stops", () => {
            const gradientWithStops = new TestGradientWithStops([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);

            expect(() => {
                gradientWithStops.addStop({ type: "color-hint", position: -0.1 });
            }).toThrow();

            expect(() => {
                gradientWithStops.addStop({ type: "color-hint", position: 1.1 });
            }).toThrow();

            expect(() => {
                gradientWithStops.addStop({ type: "color-hint", position: 1 });
            }).toThrow();

            // Valid color-hint stop
            expect(() => {
                gradientWithStops.addStop({ type: "color-hint", position: 0.5 });
            }).not.toThrow();
        });
    });

    describe("Interpolation", () => {
        it("Should set default interpolation to srgb", () => {
            const gradientWithStops = new TestGradientWithStops([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);

            expect(gradientWithStops.getConfig().interpolation).toEqual({ colorSpace: "srgb" });
        });

        it("Should allow setting interpolation from constructor", () => {
            const gradientWithStops = new TestGradientWithStops([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "blue", position: 1 },
            ], {
                name: "custom-gradient-with-stops",
                interpolation: { colorSpace: "oklab" },
            });

            expect(gradientWithStops.getConfig().interpolation).toEqual({ colorSpace: "oklab" });
        });
    });
});
