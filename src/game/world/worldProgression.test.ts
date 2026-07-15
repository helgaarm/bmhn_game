import { describe, expect, it } from 'vitest'
import {
  getPortalTransition,
  MIRROR_HALL,
  PROGRESSION_PORTAL,
  RESPONSIBILITY_WAREHOUSE,
  SHOWROOM_HALF_SIZE,
  THIRD_PERSON_CAMERA_OFFSET_Z,
} from './worldProgression'

describe('world progression portal', () => {
  it('keeps the mirror hall unreachable while its journey stage is locked', () => {
    expect(
      getPortalTransition(
        'showroom',
        { x: 0, y: 1, z: PROGRESSION_PORTAL.entryThresholdZ },
        false,
      ),
    ).toBeNull()
  })

  it('transitions only through the unlocked portal opening', () => {
    expect(
      getPortalTransition(
        'mirror-hall',
        { x: 0, y: 1, z: PROGRESSION_PORTAL.entryThresholdZ },
        false,
      ),
    ).toBe('enter-mirror-hall')
    expect(
      getPortalTransition(
        'mirror-hall',
        { x: PROGRESSION_PORTAL.halfWidth + 0.1, y: 1, z: -4.5 },
        false,
      ),
    ).toBeNull()
  })

  it('provides a controlled return transition from inside the enclosed hall', () => {
    expect(
      getPortalTransition(
        'mirror-hall',
        { x: 0, y: 1, z: MIRROR_HALL.returnThresholdZ },
        true,
      ),
    ).toBe('return-to-showroom')
  })

  it('makes the mirror hall materially larger than the showroom footprint', () => {
    const showroomArea = (SHOWROOM_HALF_SIZE * 2) ** 2
    const mirrorHallArea =
      MIRROR_HALL.halfWidth * 2 * MIRROR_HALL.halfDepth * 2

    expect(mirrorHallArea).toBeGreaterThan(showroomArea)
  })

  it('places the responsibility warehouse entry inside its enclosed footprint', () => {
    expect(
      Math.abs(
        RESPONSIBILITY_WAREHOUSE.entryPosition.x -
          RESPONSIBILITY_WAREHOUSE.centerX,
      ),
    ).toBeLessThan(RESPONSIBILITY_WAREHOUSE.halfWidth)
    expect(
      Math.abs(
        RESPONSIBILITY_WAREHOUSE.entryPosition.z -
          RESPONSIBILITY_WAREHOUSE.centerZ,
      ),
    ).toBeLessThan(RESPONSIBILITY_WAREHOUSE.halfDepth)
  })

  it('keeps the camera inside each room at the first frame after entry', () => {
    const mirrorFrontWallZ = MIRROR_HALL.centerZ + MIRROR_HALL.halfDepth
    const warehouseFrontWallZ =
      RESPONSIBILITY_WAREHOUSE.centerZ + RESPONSIBILITY_WAREHOUSE.halfDepth

    expect(
      MIRROR_HALL.entryPosition.z + THIRD_PERSON_CAMERA_OFFSET_Z,
    ).toBeLessThan(mirrorFrontWallZ - 0.2)
    expect(
      RESPONSIBILITY_WAREHOUSE.entryPosition.z + THIRD_PERSON_CAMERA_OFFSET_Z,
    ).toBeLessThan(warehouseFrontWallZ - 0.2)
  })
})
