"use client";

export function getContrastColor(hex: string): string {
    if (!hex) return '#FFFFFF';

    let cleanHex = hex.replace('#', '');

    if (cleanHex.length === 3) {
        cleanHex = cleanHex.split('').map(c => c + c).join('');
    }

    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    const luminance = (r * 299 + g * 587 + b * 114) / 1000;

    return luminance > 128 ? '#000000' : '#FFFFFF';
}