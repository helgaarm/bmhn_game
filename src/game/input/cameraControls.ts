export interface MovementAxes {
  x: number
  z: number
}

export const DEFAULT_CAMERA_YAW = 0
export const DEFAULT_CAMERA_PITCH = 0
export const MIN_CAMERA_PITCH = -0.9
export const MAX_CAMERA_PITCH = 1.15

export function clampCameraPitch(pitch: number) {
  return Math.min(MAX_CAMERA_PITCH, Math.max(MIN_CAMERA_PITCH, pitch))
}

export function rotateMovementByCamera(
  movement: MovementAxes,
  cameraYaw: number,
): MovementAxes {
  const cos = Math.cos(cameraYaw)
  const sin = Math.sin(cameraYaw)
  return {
    x: movement.x * cos + movement.z * sin,
    z: movement.z * cos - movement.x * sin,
  }
}

export function applyCameraRotation(
  yaw: number,
  pitch: number,
  deltaX: number,
  deltaY: number,
  sensitivity: number,
) {
  const safeSensitivity = Math.min(2, Math.max(0.25, sensitivity))
  const radiansPerPixel = 0.0032 * safeSensitivity
  return {
    yaw: yaw - deltaX * radiansPerPixel,
    pitch: clampCameraPitch(pitch + deltaY * radiansPerPixel),
  }
}
