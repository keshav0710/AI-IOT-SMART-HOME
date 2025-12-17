import { WATER_TANK_THRESHOLDS } from './constants';
import type { WaterTankStatus } from '../types/sensor.types';

/**
 * Calculate water tank status based on distance sensor reading
 * @param distance - Distance from sensor to water surface in cm
 * @returns Water tank status with percentage, status text, and color
 */
export function getWaterTankStatus(distance: number): WaterTankStatus {
    if (distance <= WATER_TANK_THRESHOLDS.OVERFLOW) {
        return {
            percentage: 95,
            status: 'overflow',
            color: 'text-red-500'
        };
    } else if (distance <= WATER_TANK_THRESHOLDS.FULL) {
        return {
            percentage: 85,
            status: 'full',
            color: 'text-green-500'
        };
    } else if (distance <= WATER_TANK_THRESHOLDS.NORMAL_HIGH) {
        return {
            percentage: 70,
            status: 'normal',
            color: 'text-blue-500'
        };
    } else if (distance <= WATER_TANK_THRESHOLDS.NORMAL_LOW) {
        return {
            percentage: 45,
            status: 'normal',
            color: 'text-blue-500'
        };
    } else if (distance <= WATER_TANK_THRESHOLDS.LOW) {
        return {
            percentage: 20,
            status: 'low',
            color: 'text-yellow-500'
        };
    } else {
        return {
            percentage: 5,
            status: 'empty',
            color: 'text-red-500'
        };
    }
}

/**
 * Get human-readable water tank status message
 */
export function getWaterTankMessage(distance: number): string {
    const status = getWaterTankStatus(distance);
    return `Water tank is ${status.status} (${status.percentage}% full, distance: ${distance.toFixed(1)}cm from surface).`;
}
