import { describe, it, expect } from "vitest";
import { GradientBase, GradientData, GradientStop } from "../../src";


class Gradient<TConfig = any> extends GradientBase<TConfig> {
    public readonly type = "gradient";
    public override clone(): this {
        return new Gradient(this.toJSON()) as this;
    }
    public override toString(): string {
        return "gradient()";
    }
    protected override _validateConfig(_: TConfig): void {

    }
    protected override _minColorStopsCount(): number {
        return 1;
    }
}

describe("GradientBase", () => {
    const validConfig = {};
    const validStops: GradientStop[] = [
        {
            type: "color-stop",
            value: "red",
            position: 0,
        },
        {
            type: "color-hint",
            value: "",
            position: 0.2,
        },
        {
            type: "color-stop",
            value: "red",
            position: 1,
        },
    ];
    const validStopsUnsorted: GradientStop[] = [
        {
            type: "color-stop",
            value: "red",
            position: 0,
        },
        {
            type: "color-stop",
            value: "red",
            position: 1,
        },
        {
            type: "color-hint",
            value: "",
            position: 0.2,
        },
    ];
    const validGradientData: GradientData = {
        isRepeating: false,
        config: validConfig,
        stops: validStops,
    };


    describe("Init Gradient", () => {
        it("Should init with default values", () => {
            const gradient = new Gradient(validGradientData);
            expect(gradient.type).toEqual("gradient");
            expect(gradient.isRepeating).toEqual(false);
            expect(gradient.config).toEqual(validConfig);
            expect(gradient.stops).toEqual(validStops);
        });

        it("Should sort stops", () => {
            const validUnsortedData = { ...validGradientData, stops: validStopsUnsorted };
            const gradient = new Gradient(validUnsortedData);
            expect(validUnsortedData).not.toEqual(validGradientData);
            expect(gradient.stops).toEqual(validStops);
        });

        it("Should return json", () => {
            const gradient = new Gradient(validGradientData);
            expect(gradient.toJSON()).toEqual({
                type: gradient.type,
                isRepeating: gradient.isRepeating,
                config: gradient.config,
                stops: gradient.stops
            });
        });
    });

    describe("Object Contract (Core Methods)", () => {
        it("Should return string representation of gradient", () => {
            const gradient = new Gradient(validGradientData);
            expect(gradient.toString()).toEqual("gradient()");
        });

        it("Should show if two array are identical", () => {
            const validUnsortedData = { ...validGradientData, stops: validStopsUnsorted };
            const gradientA = new Gradient(validGradientData);
            const gradientB = new Gradient(validUnsortedData);
            const gradientBCopy = gradientB.clone();

            validUnsortedData.stops.push({
                type: "color-stop",
                value: "red",
                position: 1,
            });
            const gradientC = new Gradient(validUnsortedData);
            expect(gradientA.equals(gradientB)).toEqual(true);
            expect(gradientB.equals(gradientA)).toEqual(true);
            expect(gradientBCopy.equals(gradientA)).toEqual(true);
            expect(gradientC.equals(gradientA)).toEqual(false);
        });

        it("should create a new instance with the same data", () => {
            const gradient = new Gradient(validGradientData);
            const gradientCopy = gradient.clone();
            expect(gradient.type).toEqual(gradientCopy.type);
            expect(gradient.isRepeating).toEqual(gradientCopy.isRepeating);
            expect(gradient.config).toEqual(gradientCopy.config);
            expect(gradient.stops).toEqual(gradientCopy.stops);
            expect(gradient.toJSON()).toEqual(gradientCopy.toJSON());
            expect(gradient.toString()).toEqual(gradientCopy.toString());
        });

        it("should ensure deep copy (mutation safety)", () => {
            const gradient = new Gradient(validGradientData);
            const gradientCopy0 = gradient.clone();
            const gradientCopy1 = gradient.clone();

            // Check if child can"t mutate parent
            gradientCopy0.removeStop(0);
            expect(gradient.stops.length).greaterThan(gradientCopy0.stops.length);

            // Check if parent can"t mutate child
            gradient.removeStop(0);
            expect(gradient.stops.length).lessThan(gradientCopy1.stops.length);
        });
    });

    describe("Gradient addStop", () => {
        it("adds a color-stop to the end when its position is greater than all existing stops", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            gradient.addStop({
                type: "color-stop",
                value: "green",
                position: 1.5,
            });

            expect(gradient.stops).toEqual([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "blue", position: 1 },
                { type: "color-stop", value: "green", position: 1.5 },
            ]);
        });

        it("inserts a color-stop in sorted order when its position is between existing stops", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            gradient.addStop({
                type: "color-stop",
                value: "green",
                position: 0.5,
            });

            expect(gradient.stops).toEqual([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "green", position: 0.5 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);
        });

        it("keeps valid sequence when adding a color-stop before an existing color-hint", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-hint", value: "50%", position: 0.5 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            gradient.addStop({
                type: "color-stop",
                value: "green",
                position: 0.25,
            });

            expect(gradient.stops).toEqual([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "green", position: 0.25 },
                { type: "color-hint", value: "50%", position: 0.5 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);
        });

        it("allows adding a color-stop at the same position as an existing color-stop", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0.5 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            gradient.addStop({
                type: "color-stop",
                value: "green",
                position: 0.5,
            });

            expect(gradient.stops).toEqual([
                { type: "color-stop", value: "red", position: 0.5 },
                { type: "color-stop", value: "green", position: 0.5 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);
        });

        it("clones the inserted stop instead of storing the original external object reference", () => {
            const stop = {
                type: "color-stop" as const,
                value: "green",
                position: 0.5,
            };

            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            gradient.addStop(stop);
            stop.value = "broken";

            expect(gradient.stops).toEqual([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "green", position: 0.5 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);
        });

        it("throws when trying to add an invalid stop shape", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            expect(() =>
                gradient.addStop({
                    type: "color-stop",
                    value: "green",
                    position: Number.NaN,
                } as any),
            ).toThrow();
        });

        it("throws when adding a color-hint would break the base stop sequence rules", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            expect(() =>
                gradient.addStop({
                    type: "color-hint",
                    value: "50%",
                    position: 1.5,
                }),
            ).toThrow();
        });
    });

    describe("Gradient removeStop", () => {
        it("removes a middle color-stop by raw index when there are no color-hints around it", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "green", position: 0.5 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            gradient.removeStop(1);

            expect(gradient.stops).toEqual([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);
        });

        it("removes the right-side color-hint when deleting the first color-stop", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-hint", value: "25%", position: 0.25 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            gradient.removeStop(0);

            expect(gradient.stops).toEqual([
                { type: "color-stop", value: "blue", position: 1 },
            ]);
        });

        it("removes the left-side color-hint when deleting the last color-stop", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-hint", value: "75%", position: 0.75 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            gradient.removeStop(2);

            expect(gradient.stops).toEqual([
                { type: "color-stop", value: "red", position: 0 },
            ]);
        });

        it("removes both adjacent color-hints when deleting a middle color-stop surrounded by hints", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-hint", value: "25%", position: 0.25 },
                    { type: "color-stop", value: "green", position: 0.5 },
                    { type: "color-hint", value: "75%", position: 0.75 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            gradient.removeStop(2);

            expect(gradient.stops).toEqual([
                { type: "color-stop", value: "red", position: 0 },
                { type: "color-stop", value: "blue", position: 1 },
            ]);
        });

        it("throws when index is not an integer", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            expect(() => gradient.removeStop(1.5)).toThrow(TypeError);
        });

        it("throws when index is negative", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            expect(() => gradient.removeStop(-1)).toThrow(RangeError);
        });

        it("throws when index is out of bounds", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            expect(() => gradient.removeStop(999)).toThrow(RangeError);
        });

        it("throws when trying to remove the last remaining color-stop", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                ],
            });

            expect(() => gradient.removeStop(0)).toThrow(Error);
        });

        it("keeps the remaining sequence valid after removal", () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: "color-stop", value: "red", position: 0 },
                    { type: "color-hint", value: "20%", position: 0.2 },
                    { type: "color-stop", value: "green", position: 0.4 },
                    { type: "color-hint", value: "70%", position: 0.7 },
                    { type: "color-stop", value: "blue", position: 1 },
                ],
            });

            gradient.removeStop(2);

            expect(gradient.stops[0].type).toBe("color-stop");
            expect(gradient.stops[gradient.stops.length - 1].type).toBe("color-stop");

            for (let index = 1; index < gradient.stops.length; index++) {
                const previous = gradient.stops[index - 1];
                const current = gradient.stops[index];

                if (previous.type === "color-hint") {
                    expect(current.type).toBe("color-stop");
                }
            }
        });
    });

    describe('Gradient defensive copy behavior', () => {
        it('constructor clones input stops array so external array mutations do not affect internal state', () => {
            const externalStops = [
                { type: 'color-stop' as const, value: 'red', position: 0 },
                { type: 'color-stop' as const, value: 'blue', position: 1 },
            ];

            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: externalStops,
            });

            externalStops.push({
                type: 'color-stop',
                value: 'green',
                position: 0.5,
            });

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0 },
                { type: 'color-stop', value: 'blue', position: 1 },
            ]);
        });

        it('constructor clones input stop objects so external stop object mutations do not affect internal state', () => {
            const redStop = {
                type: 'color-stop' as const,
                value: 'red',
                position: 0,
            };

            const blueStop = {
                type: 'color-stop' as const,
                value: 'blue',
                position: 1,
            };

            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [redStop, blueStop],
            });

            redStop.value = 'broken';
            blueStop.position = 999;

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0 },
                { type: 'color-stop', value: 'blue', position: 1 },
            ]);
        });

        it('constructor clones config so external config mutations do not affect internal state', () => {
            const externalConfig = { angle: 0 };

            const gradient = new Gradient({
                isRepeating: false,
                config: externalConfig,
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            externalConfig.angle = 999;

            expect(gradient.config).toEqual({ angle: 0 });
        });

        it('config getter returns a defensive copy so mutating returned config does not affect internal state', () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const config = gradient.config;
            config.angle = 123;

            expect(gradient.config).toEqual({ angle: 0 });
        });

        it('stops getter returns a new array so mutating returned array does not affect internal state', () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const stops = gradient.stops;
            stops.push({
                type: 'color-stop',
                value: 'green',
                position: 0.5,
            });

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0 },
                { type: 'color-stop', value: 'blue', position: 1 },
            ]);
        });

        it('stops getter returns cloned stop objects so mutating returned stop objects does not affect internal state', () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const stops = gradient.stops;
            stops[0].value = 'broken';
            stops[1].position = 999;

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0 },
                { type: 'color-stop', value: 'blue', position: 1 },
            ]);
        });

        it('toJSON returns cloned config and stops so mutating returned snapshot does not affect internal state', () => {
            const gradient = new Gradient({
                isRepeating: true,
                config: { angle: 1.5 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-hint', value: '50%', position: 0.5 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const snapshot = gradient.toJSON();

            
            snapshot.config.angle = 999;
            snapshot.stops.push({
                type: 'color-stop',
                value: 'green',
                position: 0.25,
            });
            snapshot.stops[0].value = 'broken';

            expect(gradient.toJSON()).toEqual({
                type: 'gradient',
                isRepeating: true,
                config: { angle: 1.5 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-hint', value: '50%', position: 0.5 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });
        });

        it('clone returns a fully independent gradient instance', () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const cloned = gradient.clone();

            cloned.addStop({
                type: 'color-stop',
                value: 'green',
                position: 0.5,
            });

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0 },
                { type: 'color-stop', value: 'blue', position: 1 },
            ]);

            expect(cloned.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0 },
                { type: 'color-stop', value: 'green', position: 0.5 },
                { type: 'color-stop', value: 'blue', position: 1 },
            ]);
        });

        it('clone does not share config reference with the original gradient', () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const cloned = gradient.clone();
            const cloneConfig = cloned.config;

            cloneConfig.angle = 777;

            expect(cloned.config).toEqual({ angle: 0 });
            expect(gradient.config).toEqual({ angle: 0 });
        });

        it('clone does not share stop object references with the original gradient', () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const cloned = gradient.clone();
            const cloneStops = cloned.stops;

            cloneStops[0].value = 'broken';
            cloneStops[1].position = 123;

            expect(cloned.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0 },
                { type: 'color-stop', value: 'blue', position: 1 },
            ]);

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0 },
                { type: 'color-stop', value: 'blue', position: 1 },
            ]);
        });

        it('addStop clones the incoming stop so later external mutations do not affect internal state', () => {
            const gradient = new Gradient({
                isRepeating: false,
                config: { angle: 0 },
                stops: [
                    { type: 'color-stop', value: 'red', position: 0 },
                    { type: 'color-stop', value: 'blue', position: 1 },
                ],
            });

            const externalStop = {
                type: 'color-stop' as const,
                value: 'green',
                position: 0.5,
            };

            gradient.addStop(externalStop);
            externalStop.value = 'broken';
            externalStop.position = 999;

            expect(gradient.stops).toEqual([
                { type: 'color-stop', value: 'red', position: 0 },
                { type: 'color-stop', value: 'green', position: 0.5 },
                { type: 'color-stop', value: 'blue', position: 1 },
            ]);
        });
    });
});