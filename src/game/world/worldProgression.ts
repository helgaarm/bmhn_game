export type WorldZone =
  | 'showroom'
  | 'mirror-hall'
  | 'responsibility-warehouse'
  | 'connection-bridge'

export interface WorldPosition {
  x: number
  y: number
  z: number
}

export const SHOWROOM_HALF_SIZE = 10
export const SHOWROOM_WALL_HALF_HEIGHT = 3
export const THIRD_PERSON_CAMERA_OFFSET_Z = 6.2

export const PROGRESSION_PORTAL = {
  z: -4.1,
  halfWidth: 1.25,
  entryThresholdZ: -4.35,
} as const

export const MIRROR_HALL = {
  centerZ: -46,
  halfWidth: 12,
  halfDepth: 14,
  wallHeight: 5.2,
  showroomApproachPosition: { x: 0, y: 1, z: -2.7 },
  entryPosition: { x: 0, y: 1, z: -39 },
  returnThresholdZ: -33.15,
  showroomReturnPosition: { x: 0, y: 1, z: -3.15 },
} as const

export const RESPONSIBILITY_WAREHOUSE = {
  centerX: 38,
  centerZ: -46,
  halfWidth: 12,
  halfDepth: 12,
  wallHeight: 5.6,
  entryPosition: { x: 38, y: 1, z: -42 },
} as const

export const CONNECTION_BRIDGE = {
  centerX: 76,
  centerZ: -46,
  halfWidth: 12,
  halfDepth: 13,
  wallHeight: 5.8,
  entryPosition: { x: 76, y: 1, z: -41.5 },
} as const

export type PortalTransition = 'enter-mirror-hall' | 'return-to-showroom'

export function getPortalTransition(
  zone: WorldZone,
  position: WorldPosition,
  insideMirrorHall: boolean,
): PortalTransition | null {
  if (zone !== 'mirror-hall') return null

  if (
    !insideMirrorHall &&
    Math.abs(position.x) <= PROGRESSION_PORTAL.halfWidth &&
    position.z <= PROGRESSION_PORTAL.entryThresholdZ
  ) {
    return 'enter-mirror-hall'
  }

  if (
    insideMirrorHall &&
    Math.abs(position.x) <= PROGRESSION_PORTAL.halfWidth &&
    position.z >= MIRROR_HALL.returnThresholdZ
  ) {
    return 'return-to-showroom'
  }

  return null
}
