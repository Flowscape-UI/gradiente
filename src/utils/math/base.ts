export function roundTo(value: number, digits: number): number {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
}

export function floorTo(value: number, digits: number): number {
    const factor = 10 ** digits;
    return Math.floor(value * factor) / factor;
}

export function ceilTo(value: number, digits: number): number {
    const factor = 10 ** digits;
    return Math.ceil(value * factor) / factor;
}

export function truncTo(value: number, digits: number): number {
    const factor = 10 ** digits;
    return Math.trunc(value * factor) / factor;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

export function toPercent(value: number): number {
    return value / 100;
}

export function fromPercent(value: number): number {
    return value * 100;
}