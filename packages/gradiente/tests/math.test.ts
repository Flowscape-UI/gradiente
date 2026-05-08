import { describe, it, expect } from 'vitest';
import {
    angleValueFromString,
    // Base math functions
    ceilTo,
    clamp,
    degToRad,
    floorTo,
    fromPercent,
    gradToRad,

    // Angle math functions
    isAngle,
    isAngleUnit,
    normalizeAngleDeg,
    normalizeAngleRad,
    radToDeg,
    roundTo,
    toPercent,
    truncTo,
    turnToRad,
} from '../src';

describe('Math', () => {
    describe('Base math', () => {
        it('roundTo should round value to the given number of digits', () => {
            expect(roundTo(1.23456, 2)).toBe(1.23);
            expect(roundTo(1.23556, 2)).toBe(1.24);
            expect(roundTo(1.999, 2)).toBe(2);
            expect(roundTo(1.4, 0)).toBe(1);
            expect(roundTo(1.5, 0)).toBe(2);
            expect(roundTo(-1.23456, 2)).toBe(-1.23);
            expect(roundTo(-1.23556, 2)).toBe(-1.24);
        });

        it('floorTo should floor value to the given number of digits', () => {
            expect(floorTo(1.239, 2)).toBe(1.23);
            expect(floorTo(1.999, 2)).toBe(1.99);
            expect(floorTo(1.9, 0)).toBe(1);
            expect(floorTo(1.1, 0)).toBe(1);
            expect(floorTo(-1.231, 2)).toBe(-1.24);
            expect(floorTo(-1.999, 2)).toBe(-2);
        });

        it('ceilTo should ceil value to the given number of digits', () => {
            expect(ceilTo(1.231, 2)).toBe(1.24);
            expect(ceilTo(1.001, 2)).toBe(1.01);
            expect(ceilTo(1.1, 0)).toBe(2);
            expect(ceilTo(1.9, 0)).toBe(2);
            expect(ceilTo(-1.239, 2)).toBe(-1.23);
            expect(ceilTo(-1.001, 2)).toBe(-1);
        });

        it('truncTo should truncate value to the given number of digits', () => {
            expect(truncTo(1.239, 2)).toBe(1.23);
            expect(truncTo(1.999, 2)).toBe(1.99);
            expect(truncTo(1.9, 0)).toBe(1);
            expect(truncTo(1.1, 0)).toBe(1);
            expect(truncTo(-1.239, 2)).toBe(-1.23);
            expect(truncTo(-1.999, 2)).toBe(-1.99);
        });

        it('clamp should return value when it is inside range', () => {
            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(-5, 0, 10)).toBe(0);
            expect(clamp(15, 0, 10)).toBe(10);
            expect(clamp(0, 0, 10)).toBe(0);
            expect(clamp(10, 0, 10)).toBe(10);
        });

        it('toPercent should convert percent value to normalized value', () => {
            expect(toPercent(0)).toBe(0);
            expect(toPercent(50)).toBe(0.5);
            expect(toPercent(100)).toBe(1);
            expect(toPercent(150)).toBe(1.5);
            expect(toPercent(-25)).toBe(-0.25);

        });

        it('fromPercent should convert normalized value to percent value', () => {
            expect(fromPercent(0)).toBe(0);
            expect(fromPercent(0.5)).toBe(50);
            expect(fromPercent(1)).toBe(100);
            expect(fromPercent(1.5)).toBe(150);
            expect(fromPercent(-0.25)).toBe(-25);
        });

        it('toPercent and fromPercent should be reversible', () => {
            expect(fromPercent(toPercent(25))).toBe(25);
            expect(toPercent(fromPercent(0.75))).toBe(0.75);
        });
    });

    describe('Angle math', () => {
        it('isAngleUnit should return true for valid angle units', () => {
            // Positive case
            expect(isAngleUnit('deg')).toBe(true);
            expect(isAngleUnit('rad')).toBe(true);
            expect(isAngleUnit('turn')).toBe(true);
            expect(isAngleUnit('grad')).toBe(true);

            // Negative case
            expect(isAngleUnit('px')).toBe(false);
            expect(isAngleUnit('percent')).toBe(false);
            expect(isAngleUnit('')).toBe(false);
            expect(isAngleUnit('DEG')).toBe(false);
        });

        it('isAngle should return true for valid angle strings', () => {
            // Basic values
            expect(isAngle('90deg')).toBe(true);
            expect(isAngle('1.5rad')).toBe(true);
            expect(isAngle('0.5turn')).toBe(true);
            expect(isAngle('200grad')).toBe(true);

            // Negative values
            expect(isAngle('-90deg')).toBe(true);
            expect(isAngle('-1.25rad')).toBe(true);

            // Special values
            expect(isAngle('12.5deg')).toBe(true);
            expect(isAngle('.5rad')).toBe(true);
            expect(isAngle('0.125turn')).toBe(true);
            expect(isAngle('+90deg')).toBe(true);

            // Should return `false` for non angle values
            expect(isAngle('90')).toBe(false);
            expect(isAngle('deg')).toBe(false);
            expect(isAngle('90 px')).toBe(false);
            expect(isAngle('90degrees')).toBe(false);
            expect(isAngle('hello')).toBe(false);
            expect(isAngle('')).toBe(false);
        });

        it('degToRad should convert degrees to radians', () => {
            // Support basic values
            expect(degToRad(0)).toBe(0);
            expect(degToRad(90)).toBeCloseTo(Math.PI / 2);
            expect(degToRad(180)).toBeCloseTo(Math.PI);
            expect(degToRad(360)).toBeCloseTo(Math.PI * 2);

            // Support negative values
            expect(degToRad(-90)).toBeCloseTo(-Math.PI / 2);

            // Support special values
            expect(degToRad(+90)).toBeCloseTo(Math.PI / 2);
            expect(degToRad(.1)).toBeCloseTo(0.005);
        });

        it('radToDeg should convert radians to degrees', () => {
            expect(radToDeg(0)).toBe(0);
            expect(radToDeg(Math.PI / 2)).toBeCloseTo(90);
            expect(radToDeg(Math.PI)).toBeCloseTo(180);
            expect(radToDeg(Math.PI * 2)).toBeCloseTo(360);

            // Should support negative values
            expect(radToDeg(-Math.PI / 2)).toBeCloseTo(-90);

            // Should be reversible
            expect(radToDeg(degToRad(45))).toBeCloseTo(45);
            expect(radToDeg(degToRad(270))).toBeCloseTo(270);
        });

        it('turnToRad should convert turns to radians', () => {
            expect(turnToRad(0)).toBe(0);
            expect(turnToRad(0.5)).toBeCloseTo(Math.PI);
            expect(turnToRad(1)).toBeCloseTo(Math.PI * 2);

            // Should support negative values
            expect(turnToRad(-0.5)).toBeCloseTo(-Math.PI);
        });

        it('gradToRad should convert gradians to radians', () => {
            expect(gradToRad(0)).toBe(0);
            expect(gradToRad(100)).toBeCloseTo(Math.PI / 2);
            expect(gradToRad(200)).toBeCloseTo(Math.PI);
            expect(gradToRad(400)).toBeCloseTo(Math.PI * 2);

            // Should support negative values
            expect(gradToRad(-100)).toBeCloseTo(-Math.PI / 2);
        });;

        it('normalizeAngleDeg should normalize positive overflow angles', () => {
            expect(normalizeAngleDeg(360)).toBe(0);
            expect(normalizeAngleDeg(450)).toBe(90);
            expect(normalizeAngleDeg(720)).toBe(0);

            // Should normalize negative values
            expect(normalizeAngleDeg(-90)).toBe(270);
            expect(normalizeAngleDeg(-180)).toBe(180);
            expect(normalizeAngleDeg(-360)).toBe(0);

            // Should preserve decimal precision
            expect(normalizeAngleDeg(450.1234, 2)).toBe(90.12);
            expect(normalizeAngleDeg(-90.5678, 3)).toBe(269.432);
        });

        it('normalizeAngleRad should normalize positive overflow radians', () => {
            expect(normalizeAngleRad(Math.PI * 2)).toBeCloseTo(0);
            expect(normalizeAngleRad(Math.PI * 2 + Math.PI / 2)).toBeCloseTo(Math.PI / 2);

            // Should normalize negative radians
            expect(normalizeAngleRad(-Math.PI / 2)).toBeCloseTo((Math.PI * 3) / 2);
            expect(normalizeAngleRad(-Math.PI)).toBeCloseTo(Math.PI);

            // Should preserve already normalized radians
            expect(normalizeAngleRad(Math.PI / 2)).toBeCloseTo(Math.PI / 2);
            expect(normalizeAngleRad(Math.PI)).toBeCloseTo(Math.PI);
        });

        it('angleValueFromString should parse degrees to radians', () => {
            expect(angleValueFromString('0deg')).toBe(0);
            expect(angleValueFromString('90deg')).toBeCloseTo(Math.PI / 2);
            expect(angleValueFromString('180deg')).toBeCloseTo(Math.PI);
            expect(angleValueFromString('360deg')).toBeCloseTo(Math.PI * 2);
            
            // Should parse radians as-is
            expect(angleValueFromString('0rad')).toBe(0);
            expect(angleValueFromString('1rad')).toBe(1);
            expect(angleValueFromString(`${Math.PI}rad`)).toBeCloseTo(Math.PI);
            
            // Should parse turns to radians
            expect(angleValueFromString('0turn')).toBe(0);
            expect(angleValueFromString('.25turn')).toBeCloseTo(Math.PI / 2);
            expect(angleValueFromString('.5turn')).toBeCloseTo(Math.PI);
            expect(angleValueFromString('1turn')).toBeCloseTo(Math.PI * 2);
            
            // Should parse gradians to radians
            expect(angleValueFromString('0grad')).toBe(0);
            expect(angleValueFromString('100grad')).toBeCloseTo(Math.PI / 2);
            expect(angleValueFromString('200grad')).toBeCloseTo(Math.PI);
            expect(angleValueFromString('400grad')).toBeCloseTo(Math.PI * 2);
            
            // Should support positive and negative signs
            expect(angleValueFromString('+90deg')).toBeCloseTo(Math.PI / 2);
            expect(angleValueFromString('-90deg')).toBeCloseTo(-Math.PI / 2);
            expect(angleValueFromString('+.5turn')).toBeCloseTo(Math.PI);
            expect(angleValueFromString('-.5turn')).toBeCloseTo(-Math.PI);
            
            // Should support decimal values without leading zero
            expect(angleValueFromString('.5rad')).toBeCloseTo(0.5);
            expect(angleValueFromString('.5turn')).toBeCloseTo(Math.PI);
            expect(angleValueFromString('.5deg')).toBeCloseTo(Math.PI / 360);

            // Should throw for invalid angle strings
            expect(() => angleValueFromString('90')).toThrow();
            expect(() => angleValueFromString('deg')).toThrow();
            expect(() => angleValueFromString('90px')).toThrow();
            expect(() => angleValueFromString('90 deg')).toThrow();
            expect(() => angleValueFromString('..5turn')).toThrow();
            expect(() => angleValueFromString('+-90deg')).toThrow();
            expect(() => angleValueFromString('')).toThrow();
        });
    });
});