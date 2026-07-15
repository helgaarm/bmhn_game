import type { MovementAxes } from '../input/cameraControls'

export const DEFAULT_PLAYER_SPEED = 3.6
export const MIN_PLAYER_SPEED = 2.4
export const MAX_PLAYER_SPEED = 5.2
export const PLAYER_ACCELERATION = 14
export const PLAYER_DECELERATION = 20

export function clampPlayerSpeed(speed: number) {
  return Math.min(MAX_PLAYER_SPEED, Math.max(MIN_PLAYER_SPEED, speed))
}

export function advanceHorizontalVelocity(
  current: MovementAxes,
  direction: MovementAxes,
  deltaSeconds: number,
  maximumSpeed = DEFAULT_PLAYER_SPEED,
): MovementAxes {
  const directionLength = Math.hypot(direction.x, direction.z)
  const hasInput = directionLength > 0
  const speed = clampPlayerSpeed(maximumSpeed)
  const targetX = hasInput ? (direction.x / directionLength) * speed : 0
  const targetZ = hasInput ? (direction.z / directionLength) * speed : 0
  const rate = hasInput ? PLAYER_ACCELERATION : PLAYER_DECELERATION
  const maxDelta = rate * Math.min(Math.max(deltaSeconds, 0), 0.1)
  const deltaX = targetX - current.x
  const deltaZ = targetZ - current.z
  const deltaLength = Math.hypot(deltaX, deltaZ)

  if (deltaLength <= maxDelta || deltaLength === 0) {
    return { x: targetX, z: targetZ }
  }

  return {
    x: current.x + (deltaX / deltaLength) * maxDelta,
    z: current.z + (deltaZ / deltaLength) * maxDelta,
  }
}
