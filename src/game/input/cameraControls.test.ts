import { describe, expect, it } from 'vitest'
import {
  applyCameraRotation,
  clampCameraPitch,
  MAX_CAMERA_PITCH,
  MIN_CAMERA_PITCH,
  rotateMovementByCamera,
} from './cameraControls'

describe('camera controls', () => {
  it('keeps movement unchanged at the default camera heading', () => {
    expect(rotateMovementByCamera({ x: 0, z: -1 }, 0)).toEqual({
      x: 0,
      z: -1,
    })
  })

  it('makes forward movement follow a quarter-turn camera heading', () => {
    const movement = rotateMovementByCamera({ x: 0, z: -1 }, Math.PI / 2)
    expect(movement.x).toBeCloseTo(-1)
    expect(movement.z).toBeCloseTo(0)
  })

  it('applies sensitivity and clamps vertical rotation', () => {
    const normal = applyCameraRotation(0, 0, 10, 10, 1)
    const sensitive = applyCameraRotation(0, 0, 10, 10, 2)
    expect(Math.abs(sensitive.yaw)).toBeCloseTo(Math.abs(normal.yaw) * 2)
    expect(clampCameraPitch(20)).toBe(MAX_CAMERA_PITCH)
    expect(clampCameraPitch(-20)).toBe(MIN_CAMERA_PITCH)
  })
})
