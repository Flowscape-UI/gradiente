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

export function isAngle(value: string): boolean {
    try {
        return typeof angleValueFromString(value) === "number";
    } catch (e) {
        return false;
    }
}

export function angleValueFromString(value: string): number {
    const match = value.match(/^([+-]?(?:\d+\.?\d*|\.\d+))(deg|rad|turn|grad)$/);
    if (match === null) {
        throw new Error(`Invalid angle value: "${value}"`);
    }
    if (!isAngleUnit(match[2])) {
        throw new Error(`Unsupported angle unit: "${match[2]}"`);
    }
    if (!Number.isFinite(+match[1])) {
        throw new SyntaxError(`Invalid angle value: "${match[1]}"`);
    }
    const angleValue = Number(match[1]);
    switch (match[2]) {
        case 'deg':
            return degToRad(angleValue);
        case 'rad':
            return angleValue;
        case 'turn':
            return turnToRad(angleValue);
        case 'grad':
            return gradToRad(angleValue);
    }
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