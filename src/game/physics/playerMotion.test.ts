import { describe, expect, it } from 'vitest'
import {
  advanceHorizontalVelocity,
  clampPlayerSpeed,
  MAX_PLAYER_SPEED,
  MIN_PLAYER_SPEED,
} from './playerMotion'

describe('player motion', () => {
  it('accelerates toward the configured speed without jumping instantly', () => {
    const velocity = advanceHorizontalVelocity(
      { x: 0, z: 0 },
      { x: 0, z: -1 },
      1 / 60,
      3.6,
    )
    expect(velocity.z).toBeLessThan(0)
    expect(Math.abs(velocity.z)).toBeLessThan(3.6)
  })

  it('normalises diagonal input and decelerates when input stops', () => {
    const moving = advanceHorizontalVelocity(
      { x: 0, z: 0 },
      { x: 1, z: -1 },
      0.1,
      3.6,
    )
    expect(Math.hypot(moving.x, moving.z)).toBeCloseTo(1.4)

    const slowing = advanceHorizontalVelocity(moving, { x: 0, z: 0 }, 0.02)
    expect(Math.hypot(slowing.x, slowing.z)).toBeLessThan(
      Math.hypot(moving.x, moving.z),
    )
  })

  it('clamps unsafe speed settings', () => {
    expect(clampPlayerSpeed(0)).toBe(MIN_PLAYER_SPEED)
    expect(clampPlayerSpeed(99)).toBe(MAX_PLAYER_SPEED)
  })
})
