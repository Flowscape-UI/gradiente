import { roundTo } from "./base";

export type AngleUnit = 'deg' | 'rad' | 'turn' | 'grad';

export function isAngleUnit(unit: string): unit is AngleUnit {
    return (
        unit === 'deg' ||
        unit === 'rad' ||
        unit === 'turn' ||
        unit === 'grad'
    );
}

export function degToRad(value: number): number {
    return (value * Math.PI) / 180;
}

export function radToDeg(value: number): number {
    return (value * 180) / Math.PI;
}

export function turnToRad(value: number): number {
    return value * Math.PI * 2;
}

export function gradToRad(value: number): number {
    return (value * Math.PI) / 200;
}


export function normalizeAngleDeg(value: number, digits: number = 3): number {
    const normalized = ((value % 360) + 360) % 360;
    return roundTo(normalized, digits);
}

export function normalizeAngleRad(value: number): number {
    const tau = Math.PI * 2;
    return ((value % tau) + tau) % tau;
}

export function toAngleRad(value: number, unit: AngleUnit): number {
    switch (unit) {
        case 'deg':
            return degToRad(value);
        case 'rad':
            return value;
        case 'turn':
            return turnToRad(value);
        case 'grad':
            return gradToRad(value);
        default: {
            const exhaustiveCheck: never = unit;
            throw new Error(`Unsupported angle unit: ${String(exhaustiveCheck)}`);
        }
    }
}

export function normalizeAngle(
    value: number,
    unit: AngleUnit,
    digits = 6,
): number {
    return roundTo(normalizeAngleRad(toAngleRad(value, unit)), digits);
}