import { KeyboardControls, useKeyboardControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from '@react-three/rapier'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import type { Group } from 'three'
import { MathUtils, Vector3 } from 'three'
import {
  getMovementAxes,
  isTextEntryTarget,
  movementControlMap,
  type GameControl,
} from '../input/controlMap'
import {
  applyCameraRotation,
  DEFAULT_CAMERA_PITCH,
  DEFAULT_CAMERA_YAW,
  rotateMovementByCamera,
} from '../input/cameraControls'
import {
  getPortalTransition,
  CONNECTION_BRIDGE,
  MIRROR_HALL,
  PROGRESSION_PORTAL,
  RESPONSIBILITY_WAREHOUSE,
  SHOWROOM_HALF_SIZE,
  THIRD_PERSON_CAMERA_OFFSET_Z,
  type WorldZone,
} from '../world/worldProgression'

interface GameCanvasProps {
  reducedMotion: boolean
  cameraSensitivity: number
  zone: WorldZone
  onNpcProximityChange: (isNear: boolean) => void
  onMirrorHallPresenceChange: (isInside: boolean) => void
  onFirstFrame?: () => void
  onFpsSample?: (fps: number) => void
}

const NPC_POSITION = new Vector3(0, 1, -1.5)

function Player({
  reducedMotion,
  cameraSensitivity,
  zone,
  onNpcProximityChange,
  onMirrorHallPresenceChange,
}: Pick<
  GameCanvasProps,
  | 'reducedMotion'
  | 'cameraSensitivity'
  | 'zone'
  | 'onNpcProximityChange'
  | 'onMirrorHallPresenceChange'
>) {
  const body = useRef<RapierRigidBody>(null)
  const avatar = useRef<Group>(null)
  const proximity = useRef(false)
  const insideMirrorHall = useRef(false)
  const portalCooldownUntil = useRef(0)
  const cameraZone = useRef(zone)
  const cameraSnapRequested = useRef(false)
  const cameraPosition = useMemo(() => new Vector3(), [])
  const cameraTarget = useMemo(() => new Vector3(), [])
  const cameraYaw = useRef(DEFAULT_CAMERA_YAW)
  const cameraPitch = useRef(DEFAULT_CAMERA_PITCH)
  const draggingPointer = useRef<number | null>(null)
  const lastPointerPosition = useRef({ x: 0, y: 0 })
  const [, getControls] = useKeyboardControls<GameControl>()
  const { gl } = useThree()

  useEffect(() => {
    const canvas = gl.domElement
    const startDrag = (event: PointerEvent) => {
      if (event.button !== 0) return
      draggingPointer.current = event.pointerId
      lastPointerPosition.current = { x: event.clientX, y: event.clientY }
      canvas.setPointerCapture(event.pointerId)
      canvas.dataset.cameraDragging = 'true'
    }
    const drag = (event: PointerEvent) => {
      if (draggingPointer.current !== event.pointerId) return
      const next = applyCameraRotation(
        cameraYaw.current,
        cameraPitch.current,
        event.clientX - lastPointerPosition.current.x,
        event.clientY - lastPointerPosition.current.y,
        cameraSensitivity * (reducedMotion ? 0.6 : 1),
      )
      cameraYaw.current = next.yaw
      cameraPitch.current = next.pitch
      lastPointerPosition.current = { x: event.clientX, y: event.clientY }
    }
    const stopDrag = (event: PointerEvent) => {
      if (draggingPointer.current !== event.pointerId) return
      draggingPointer.current = null
      delete canvas.dataset.cameraDragging
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId)
      }
    }

    canvas.addEventListener('pointerdown', startDrag)
    canvas.addEventListener('pointermove', drag)
    canvas.addEventListener('pointerup', stopDrag)
    canvas.addEventListener('pointercancel', stopDrag)
    return () => {
      canvas.removeEventListener('pointerdown', startDrag)
      canvas.removeEventListener('pointermove', drag)
      canvas.removeEventListener('pointerup', stopDrag)
      canvas.removeEventListener('pointercancel', stopDrag)
      delete canvas.dataset.cameraDragging
    }
  }, [cameraSensitivity, gl, reducedMotion])

  useEffect(() => {
    if (zone === 'mirror-hall') return
    insideMirrorHall.current = false
    body.current?.setTranslation(
      zone === 'connection-bridge'
        ? CONNECTION_BRIDGE.entryPosition
        : zone === 'responsibility-warehouse'
        ? RESPONSIBILITY_WAREHOUSE.entryPosition
        : { x: 0, y: 1, z: 5 },
      true,
    )
    cameraSnapRequested.current = true
    onMirrorHallPresenceChange(false)
  }, [onMirrorHallPresenceChange, zone])

  useFrame(({ camera, clock }, delta) => {
    const rigidBody = body.current
    if (!rigidBody) return

    const keys = getControls()
    const localMovement = getMovementAxes(
      keys,
      document.activeElement,
    )
    const keyboardCameraEnabled = !isTextEntryTarget(document.activeElement)
    const cameraMotionScale = reducedMotion ? 0.55 : 1
    if (keyboardCameraEnabled) {
      const yawDirection =
        Number(Boolean(keys['camera-right'])) -
        Number(Boolean(keys['camera-left']))
      const pitchDirection =
        Number(Boolean(keys['camera-up'])) -
        Number(Boolean(keys['camera-down']))
      cameraYaw.current +=
        yawDirection * delta * 1.65 * cameraSensitivity * cameraMotionScale
      cameraPitch.current = MathUtils.clamp(
        cameraPitch.current +
          pitchDirection * delta * 1.25 * cameraSensitivity * cameraMotionScale,
        -0.9,
        1.15,
      )
      if (keys['camera-reset']) {
        cameraYaw.current = DEFAULT_CAMERA_YAW
        cameraPitch.current = DEFAULT_CAMERA_PITCH
      }
    }
    const { x: directionX, z: directionZ } = rotateMovementByCamera(
      localMovement,
      cameraYaw.current,
    )
    const length = Math.hypot(directionX, directionZ) || 1
    const velocity = rigidBody.linvel()
    const speed = 3.6

    rigidBody.setLinvel(
      {
        x: (directionX / length) * speed,
        y: velocity.y,
        z: (directionZ / length) * speed,
      },
      true,
    )

    if (avatar.current && (directionX !== 0 || directionZ !== 0)) {
      const targetRotation = Math.atan2(directionX, directionZ)
      avatar.current.rotation.y = MathUtils.damp(
        avatar.current.rotation.y,
        targetRotation,
        12,
        delta,
      )
    }

    let position = rigidBody.translation()
    if (clock.elapsedTime >= portalCooldownUntil.current) {
      const transition = getPortalTransition(
        zone,
        position,
        insideMirrorHall.current,
      )
      if (transition === 'enter-mirror-hall') {
        insideMirrorHall.current = true
        portalCooldownUntil.current = clock.elapsedTime + 0.8
        rigidBody.setTranslation(MIRROR_HALL.entryPosition, true)
        cameraSnapRequested.current = true
        onMirrorHallPresenceChange(true)
        position = rigidBody.translation()
      } else if (transition === 'return-to-showroom') {
        insideMirrorHall.current = false
        portalCooldownUntil.current = clock.elapsedTime + 0.8
        rigidBody.setTranslation(MIRROR_HALL.showroomReturnPosition, true)
        cameraSnapRequested.current = true
        onMirrorHallPresenceChange(false)
        position = rigidBody.translation()
      }
    }

    const nearNpc =
      zone === 'showroom' &&
      Math.hypot(position.x - NPC_POSITION.x, position.z - NPC_POSITION.z) <
      2.35
    if (nearNpc !== proximity.current) {
      proximity.current = nearNpc
      onNpcProximityChange(nearNpc)
    }

    if (position.y < -4) {
      rigidBody.setTranslation(
        insideMirrorHall.current
          ? MIRROR_HALL.entryPosition
          : zone === 'connection-bridge'
            ? CONNECTION_BRIDGE.entryPosition
            : zone === 'responsibility-warehouse'
            ? RESPONSIBILITY_WAREHOUSE.entryPosition
            : { x: 0, y: 1, z: 5 },
        true,
      )
      cameraSnapRequested.current = true
      position = rigidBody.translation()
    }

    const usesIndoorCamera =
      insideMirrorHall.current ||
      zone === 'responsibility-warehouse' ||
      zone === 'connection-bridge'
    const cameraDistance = usesIndoorCamera ? THIRD_PERSON_CAMERA_OFFSET_Z : 7.7
    const cameraHeight = usesIndoorCamera ? 3.2 : 4.1
    cameraPosition.set(
      position.x + Math.sin(cameraYaw.current) * cameraDistance,
      position.y + cameraHeight + cameraPitch.current,
      position.z + Math.cos(cameraYaw.current) * cameraDistance,
    )
    if (
      cameraZone.current !== zone ||
      cameraSnapRequested.current ||
      reducedMotion
    ) {
      camera.position.copy(cameraPosition)
      cameraZone.current = zone
      cameraSnapRequested.current = false
    } else {
      camera.position.lerp(cameraPosition, 1 - Math.exp(-5 * delta))
    }
    cameraTarget.set(position.x, position.y + 0.65, position.z)
    camera.lookAt(cameraTarget)
  })

  return (
    <RigidBody
      ref={body}
      position={[0, 1, 5]}
      colliders={false}
      enabledRotations={[false, false, false]}
      canSleep={false}
      linearDamping={5}
    >
      <CuboidCollider args={[0.34, 0.72, 0.34]} />
      <group ref={avatar} castShadow>
        <mesh castShadow position={[0, 0.13, 0]}>
          <capsuleGeometry args={[0.34, 0.62, 5, 8]} />
          <meshStandardMaterial color="#e85800" roughness={0.75} />
        </mesh>
        <mesh castShadow position={[0, 0.82, 0]}>
          <sphereGeometry args={[0.29, 12, 8]} />
          <meshStandardMaterial color="#fbd9a5" roughness={0.8} />
        </mesh>
        <mesh castShadow position={[0, 1.18, 0]} rotation={[0, 0, 0.08]}>
          <coneGeometry args={[0.43, 0.78, 8]} />
          <meshStandardMaterial color="#247360" roughness={0.72} />
        </mesh>
      </group>
    </RigidBody>
  )
}

function Nor({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<Group>(null)

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return
    group.current.position.y = NPC_POSITION.y + Math.sin(clock.elapsedTime * 1.4) * 0.06
  })

  return (
    <group ref={group} position={NPC_POSITION.toArray()}>
      <mesh castShadow>
        <cylinderGeometry args={[0.42, 0.55, 1.4, 8]} />
        <meshStandardMaterial color="#00467a" roughness={0.65} />
      </mesh>
      <mesh castShadow position={[0, 0.92, 0]}>
        <dodecahedronGeometry args={[0.38, 0]} />
        <meshStandardMaterial color="#ffc46b" roughness={0.58} />
      </mesh>
      <mesh position={[0, 1.58, 0]}>
        <torusGeometry args={[0.34, 0.055, 8, 20]} />
        <meshStandardMaterial
          color="#7befb2"
          emissive="#02a67f"
          emissiveIntensity={1.7}
        />
      </mesh>
      <pointLight color="#7befb2" intensity={2.2} distance={5} position={[0, 1.3, 0]} />
    </group>
  )
}

function ProgressionGate({ unlocked }: { unlocked: boolean }) {
  return (
    <group position={[0, 0, PROGRESSION_PORTAL.z]}>
      <mesh castShadow position={[-1.6, 1.35, 0]}>
        <boxGeometry args={[0.75, 2.7, 0.8]} />
        <meshStandardMaterial color="#723e33" roughness={0.82} />
      </mesh>
      <mesh castShadow position={[1.6, 1.35, 0]}>
        <boxGeometry args={[0.75, 2.7, 0.8]} />
        <meshStandardMaterial color="#723e33" roughness={0.82} />
      </mesh>
      <mesh castShadow position={[0, 2.62, 0]}>
        <boxGeometry args={[4, 0.55, 0.82]} />
        <meshStandardMaterial color="#723e33" roughness={0.82} />
      </mesh>

      {unlocked ? (
        <mesh position={[0, 1.28, 0.02]}>
          <boxGeometry args={[2.45, 2.35, 0.12]} />
          <meshStandardMaterial
            color="#015945"
            emissive="#02a67f"
            emissiveIntensity={1.25}
            roughness={0.34}
            metalness={0.35}
            transparent
            opacity={0.92}
          />
        </mesh>
      ) : (
        <RigidBody type="fixed" colliders={false}>
          <CuboidCollider args={[1.25, 1.22, 0.22]} position={[0, 1.22, 0]} />
          <mesh castShadow position={[0, 1.22, 0]}>
            <boxGeometry args={[2.5, 2.44, 0.42]} />
            <meshStandardMaterial color="#00467a" roughness={0.78} />
          </mesh>
          <mesh position={[0, 1.22, 0.23]}>
            <torusGeometry args={[0.56, 0.09, 10, 24]} />
            <meshStandardMaterial color="#ffc46b" roughness={0.56} />
          </mesh>
        </RigidBody>
      )}
    </group>
  )
}

function MirrorPanel({
  position,
  rotation = [0, 0, 0],
  accent,
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
  accent: string
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[2.35, 3.25, 0.2]} />
        <meshStandardMaterial
          color={accent}
          emissive="#02a67f"
          emissiveIntensity={0.1}
          metalness={0.76}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, -1.9, 0.22]} castShadow>
        <cylinderGeometry args={[0.74, 0.98, 0.55, 7]} />
        <meshStandardMaterial color="#247360" roughness={0.84} />
      </mesh>
    </group>
  )
}

function MirrorHall() {
  const frontZ = MIRROR_HALL.centerZ + MIRROR_HALL.halfDepth
  const backZ = MIRROR_HALL.centerZ - MIRROR_HALL.halfDepth
  const wallY = MIRROR_HALL.wallHeight / 2
  const width = MIRROR_HALL.halfWidth * 2
  const depth = MIRROR_HALL.halfDepth * 2

  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[MIRROR_HALL.halfWidth, 0.1, MIRROR_HALL.halfDepth]}
          position={[0, -0.1, MIRROR_HALL.centerZ]}
        />
        <CuboidCollider
          args={[MIRROR_HALL.halfWidth, wallY, 0.2]}
          position={[0, wallY, frontZ]}
        />
        <CuboidCollider
          args={[MIRROR_HALL.halfWidth, wallY, 0.2]}
          position={[0, wallY, backZ]}
        />
        <CuboidCollider
          args={[0.2, wallY, MIRROR_HALL.halfDepth]}
          position={[-MIRROR_HALL.halfWidth, wallY, MIRROR_HALL.centerZ]}
        />
        <CuboidCollider
          args={[0.2, wallY, MIRROR_HALL.halfDepth]}
          position={[MIRROR_HALL.halfWidth, wallY, MIRROR_HALL.centerZ]}
        />
        <CuboidCollider
          args={[MIRROR_HALL.halfWidth, 0.1, MIRROR_HALL.halfDepth]}
          position={[0, MIRROR_HALL.wallHeight, MIRROR_HALL.centerZ]}
        />

        <mesh receiveShadow position={[0, -0.1, MIRROR_HALL.centerZ]}>
          <boxGeometry args={[width, 0.2, depth]} />
          <meshStandardMaterial color="#015945" roughness={0.78} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, wallY, frontZ]}>
          <boxGeometry args={[width, MIRROR_HALL.wallHeight, 0.4]} />
          <meshStandardMaterial color="#00464d" emissive="#002e38" emissiveIntensity={0.18} roughness={0.86} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, wallY, backZ]}>
          <boxGeometry args={[width, MIRROR_HALL.wallHeight, 0.4]} />
          <meshStandardMaterial color="#00464d" emissive="#002e38" emissiveIntensity={0.18} roughness={0.86} />
        </mesh>
        <mesh castShadow receiveShadow position={[-MIRROR_HALL.halfWidth, wallY, MIRROR_HALL.centerZ]}>
          <boxGeometry args={[0.4, MIRROR_HALL.wallHeight, depth]} />
          <meshStandardMaterial color="#00464d" emissive="#002e38" emissiveIntensity={0.18} roughness={0.86} />
        </mesh>
        <mesh castShadow receiveShadow position={[MIRROR_HALL.halfWidth, wallY, MIRROR_HALL.centerZ]}>
          <boxGeometry args={[0.4, MIRROR_HALL.wallHeight, depth]} />
          <meshStandardMaterial color="#00464d" emissive="#002e38" emissiveIntensity={0.18} roughness={0.86} />
        </mesh>
        <mesh castShadow receiveShadow position={[0, MIRROR_HALL.wallHeight, MIRROR_HALL.centerZ]}>
          <boxGeometry args={[width, 0.2, depth]} />
          <meshStandardMaterial color="#003b3f" roughness={0.92} />
        </mesh>
      </RigidBody>

      {[-38.5, -42, -45.5, -49, -52.5, -56].map((z, index) => (
        <mesh key={`floor-marker-${z}`} receiveShadow position={[0, 0.025, z]}>
          <boxGeometry args={[3.4, 0.05, 2.45]} />
          <meshStandardMaterial
            color={index % 2 ? '#7befb2' : '#c4f2da'}
            emissive="#02a67f"
            emissiveIntensity={0.28}
            roughness={0.7}
          />
        </mesh>
      ))}

      {[-8.2, -2.8, 2.8, 8.2].map((x, index) => (
        <MirrorPanel
          key={`back-mirror-${x}`}
          position={[x, 2.05, backZ + 0.32]}
          accent={index % 2 ? '#c4f2da' : '#7befb2'}
        />
      ))}
      {[-40, -46, -52].map((z, index) => (
        <MirrorPanel
          key={`left-mirror-${z}`}
          position={[-MIRROR_HALL.halfWidth + 0.32, 2.05, z]}
          rotation={[0, Math.PI / 2, 0]}
          accent={index % 2 ? '#7befb2' : '#c4f2da'}
        />
      ))}
      {[-40, -46, -52].map((z, index) => (
        <MirrorPanel
          key={`right-mirror-${z}`}
          position={[MIRROR_HALL.halfWidth - 0.32, 2.05, z]}
          rotation={[0, -Math.PI / 2, 0]}
          accent={index % 2 ? '#c4f2da' : '#7befb2'}
        />
      ))}

      <group position={[0, 1.35, frontZ - 0.28]} rotation={[0, Math.PI, 0]}>
        <mesh>
          <boxGeometry args={[2.6, 2.5, 0.14]} />
          <meshStandardMaterial
            color="#015945"
            emissive="#02a67f"
            emissiveIntensity={0.85}
            roughness={0.32}
          />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <torusGeometry args={[0.62, 0.08, 10, 24]} />
          <meshStandardMaterial color="#ffc46b" emissive="#e85800" emissiveIntensity={0.45} />
        </mesh>
      </group>

      <ambientLight color="#c4f2da" intensity={1.15} />
      <pointLight color="#7befb2" intensity={4.4} distance={20} position={[0, 4, -42]} />
      <pointLight color="#ffc46b" intensity={3.4} distance={18} position={[0, 3.4, -53]} />
    </group>
  )
}

function ResponsibilityWarehouse() {
  const { centerX, centerZ, halfWidth, halfDepth, wallHeight } =
    RESPONSIBILITY_WAREHOUSE
  const wallY = wallHeight / 2
  const width = halfWidth * 2
  const depth = halfDepth * 2
  const frontZ = centerZ + halfDepth
  const backZ = centerZ - halfDepth
  const shelfPositions: [number, number][] = [
    [-7.5, -43],
    [-7.5, -50],
    [7.5, -43],
    [7.5, -50],
  ]

  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider
          args={[halfWidth, 0.1, halfDepth]}
          position={[centerX, -0.1, centerZ]}
        />
        <CuboidCollider args={[halfWidth, wallY, 0.2]} position={[centerX, wallY, frontZ]} />
        <CuboidCollider args={[halfWidth, wallY, 0.2]} position={[centerX, wallY, backZ]} />
        <CuboidCollider args={[0.2, wallY, halfDepth]} position={[centerX - halfWidth, wallY, centerZ]} />
        <CuboidCollider args={[0.2, wallY, halfDepth]} position={[centerX + halfWidth, wallY, centerZ]} />
        <CuboidCollider args={[halfWidth, 0.1, halfDepth]} position={[centerX, wallHeight, centerZ]} />

        <mesh receiveShadow position={[centerX, -0.1, centerZ]}>
          <boxGeometry args={[width, 0.2, depth]} />
          <meshStandardMaterial color="#5b4636" roughness={0.9} />
        </mesh>
        <mesh castShadow receiveShadow position={[centerX, wallY, frontZ]}>
          <boxGeometry args={[width, wallHeight, 0.4]} />
          <meshStandardMaterial color="#003f49" roughness={0.88} />
        </mesh>
        <mesh castShadow receiveShadow position={[centerX, wallY, backZ]}>
          <boxGeometry args={[width, wallHeight, 0.4]} />
          <meshStandardMaterial color="#003f49" roughness={0.88} />
        </mesh>
        <mesh castShadow receiveShadow position={[centerX - halfWidth, wallY, centerZ]}>
          <boxGeometry args={[0.4, wallHeight, depth]} />
          <meshStandardMaterial color="#00464d" roughness={0.88} />
        </mesh>
        <mesh castShadow receiveShadow position={[centerX + halfWidth, wallY, centerZ]}>
          <boxGeometry args={[0.4, wallHeight, depth]} />
          <meshStandardMaterial color="#00464d" roughness={0.88} />
        </mesh>
        <mesh castShadow receiveShadow position={[centerX, wallHeight, centerZ]}>
          <boxGeometry args={[width, 0.2, depth]} />
          <meshStandardMaterial color="#002920" roughness={0.94} />
        </mesh>
      </RigidBody>

      {shelfPositions.map(([xOffset, z], shelfIndex) => {
        const x = centerX + xOffset
        return (
          <RigidBody key={`${x}-${z}`} type="fixed" colliders={false}>
            <CuboidCollider args={[2.5, 1.6, 0.65]} position={[x, 1.6, z]} />
            {[-2.35, 2.35].map((postX) => (
              <mesh key={postX} castShadow position={[x + postX, 1.65, z]}>
                <boxGeometry args={[0.18, 3.3, 0.75]} />
                <meshStandardMaterial color="#723e33" roughness={0.82} />
              </mesh>
            ))}
            {[0.35, 1.55, 2.75].map((y) => (
              <mesh key={y} castShadow position={[x, y, z]}>
                <boxGeometry args={[4.9, 0.16, 1.2]} />
                <meshStandardMaterial color="#9a6956" roughness={0.86} />
              </mesh>
            ))}
            {[0.85, 2.05].map((y, index) => (
              <mesh key={y} castShadow position={[x + (index ? 0.9 : -0.8), y, z]}>
                <boxGeometry args={[1.45, 0.75, 0.9]} />
                <meshStandardMaterial
                  color={(shelfIndex + index) % 3 === 0 ? '#ffc46b' : (shelfIndex + index) % 3 === 1 ? '#7befb2' : '#00467a'}
                  roughness={0.78}
                />
              </mesh>
            ))}
          </RigidBody>
        )
      })}

      {[-55, -51, -47, -43, -39].map((z, index) => (
        <mesh key={`warehouse-path-${z}`} receiveShadow position={[centerX, 0.025, z]}>
          <boxGeometry args={[3.5, 0.05, 2.6]} />
          <meshStandardMaterial
            color={index % 2 ? '#ffc46b' : '#c4f2da'}
            emissive={index % 2 ? '#e85800' : '#02a67f'}
            emissiveIntensity={0.18}
            roughness={0.72}
          />
        </mesh>
      ))}

      <group position={[centerX, 1.5, backZ + 0.3]}>
        <mesh castShadow>
          <boxGeometry args={[5.2, 2.8, 0.25]} />
          <meshStandardMaterial color="#00467a" emissive="#003f49" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.18]}>
          <torusGeometry args={[0.78, 0.1, 10, 28]} />
          <meshStandardMaterial color="#ffc46b" emissive="#e85800" emissiveIntensity={0.5} />
        </mesh>
      </group>

      <ambientLight color="#c4f2da" intensity={1.1} />
      <pointLight color="#ffc46b" intensity={4.2} distance={20} position={[centerX, 4.4, -42]} />
      <pointLight color="#7befb2" intensity={3.8} distance={18} position={[centerX, 3.8, -53]} />
    </group>
  )
}

function ConnectionBridge() {
  const { centerX, centerZ, halfWidth, halfDepth, wallHeight } = CONNECTION_BRIDGE
  const wallY = wallHeight / 2
  const width = halfWidth * 2
  const depth = halfDepth * 2
  const frontZ = centerZ + halfDepth
  const backZ = centerZ - halfDepth

  return (
    <group>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[halfWidth, 0.1, halfDepth]} position={[centerX, -0.1, centerZ]} />
        <CuboidCollider args={[halfWidth, wallY, 0.2]} position={[centerX, wallY, frontZ]} />
        <CuboidCollider args={[halfWidth, wallY, 0.2]} position={[centerX, wallY, backZ]} />
        <CuboidCollider args={[0.2, wallY, halfDepth]} position={[centerX - halfWidth, wallY, centerZ]} />
        <CuboidCollider args={[0.2, wallY, halfDepth]} position={[centerX + halfWidth, wallY, centerZ]} />
        <CuboidCollider args={[halfWidth, 0.1, halfDepth]} position={[centerX, wallHeight, centerZ]} />
        <mesh receiveShadow position={[centerX, -0.1, centerZ]}>
          <boxGeometry args={[width, 0.2, depth]} />
          <meshStandardMaterial color="#00464d" roughness={0.78} />
        </mesh>
        {[
          [centerX, wallY, frontZ, width, wallHeight, 0.4],
          [centerX, wallY, backZ, width, wallHeight, 0.4],
          [centerX - halfWidth, wallY, centerZ, 0.4, wallHeight, depth],
          [centerX + halfWidth, wallY, centerZ, 0.4, wallHeight, depth],
        ].map(([x, y, z, sx, sy, sz], index) => (
          <mesh key={index} castShadow receiveShadow position={[x, y, z]}>
            <boxGeometry args={[sx, sy, sz]} />
            <meshStandardMaterial color={index < 2 ? '#003f49' : '#00467a'} roughness={0.86} />
          </mesh>
        ))}
        <mesh castShadow position={[centerX, wallHeight, centerZ]}>
          <boxGeometry args={[width, 0.2, depth]} />
          <meshStandardMaterial color="#002920" roughness={0.92} />
        </mesh>
      </RigidBody>

      {[-54, -50, -46, -42, -38].map((z, index) => (
        <group key={z} position={[centerX, 0.03, z]}>
          <mesh receiveShadow>
            <boxGeometry args={[5.2, 0.06, 2.8]} />
            <meshStandardMaterial
              color={index % 2 ? '#7befb2' : '#ffc46b'}
              emissive={index % 2 ? '#02a67f' : '#e85800'}
              emissiveIntensity={0.25}
            />
          </mesh>
          <mesh position={[-4.2, 1.25, 0]} castShadow>
            <octahedronGeometry args={[0.62, 0]} />
            <meshStandardMaterial color="#7befb2" emissive="#02a67f" emissiveIntensity={0.55} />
          </mesh>
          <mesh position={[4.2, 1.25, 0]} castShadow>
            <octahedronGeometry args={[0.62, 0]} />
            <meshStandardMaterial color="#ffc46b" emissive="#e85800" emissiveIntensity={0.45} />
          </mesh>
        </group>
      ))}
      <ambientLight color="#c4f2da" intensity={1.2} />
      <pointLight color="#7befb2" intensity={4.2} distance={20} position={[centerX - 5, 4, -43]} />
      <pointLight color="#ffc46b" intensity={4} distance={20} position={[centerX + 5, 4, -51]} />
    </group>
  )
}

function World({
  reducedMotion,
  cameraSensitivity,
  zone,
  onNpcProximityChange,
  onMirrorHallPresenceChange,
}: GameCanvasProps) {
  const isMirrorHall = zone === 'mirror-hall'
  const isResponsibilityWarehouse = zone === 'responsibility-warehouse'
  const isConnectionBridge = zone === 'connection-bridge'
  return (
    <>
      <color attach="background" args={['#002920']} />
      <fog attach="fog" args={['#002920', 10, 27]} />
      <hemisphereLight args={['#c4f2da', '#002920', 1.5]} />
      <directionalLight
        castShadow
        color="#ffc46b"
        intensity={2.6}
        position={[6, 10, 5]}
        shadow-mapSize={[1024, 1024]}
      />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[SHOWROOM_HALF_SIZE, 0.1, SHOWROOM_HALF_SIZE]} position={[0, -0.1, 0]} />
        <CuboidCollider args={[SHOWROOM_HALF_SIZE, 1.4, 0.2]} position={[0, 1.2, -SHOWROOM_HALF_SIZE]} />
        <CuboidCollider args={[SHOWROOM_HALF_SIZE, 1.4, 0.2]} position={[0, 1.2, SHOWROOM_HALF_SIZE]} />
        <CuboidCollider args={[0.2, 1.4, SHOWROOM_HALF_SIZE]} position={[-SHOWROOM_HALF_SIZE, 1.2, 0]} />
        <CuboidCollider args={[0.2, 1.4, SHOWROOM_HALF_SIZE]} position={[SHOWROOM_HALF_SIZE, 1.2, 0]} />
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[SHOWROOM_HALF_SIZE * 2, SHOWROOM_HALF_SIZE * 2]} />
          <meshStandardMaterial color="#015945" roughness={0.94} />
        </mesh>
      </RigidBody>

      {[-7, -3.5, 3.5, 7].map((x, index) => (
        <group key={x} position={[x, 0, index % 2 ? -5.5 : 3.8]}>
          <mesh castShadow position={[0, 0.65, 0]}>
            <cylinderGeometry args={[0.4, 0.62, 1.3, 7]} />
            <meshStandardMaterial color="#723e33" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 1.8, 0]}>
            <coneGeometry args={[1.35, 2.5, 7]} />
            <meshStandardMaterial color={index % 2 ? '#247360' : '#02a67f'} roughness={0.88} />
          </mesh>
        </group>
      ))}

      <ProgressionGate unlocked={isMirrorHall} />
      {isMirrorHall && <MirrorHall />}
      {isResponsibilityWarehouse && <ResponsibilityWarehouse />}
      {isConnectionBridge && <ConnectionBridge />}

      <Nor reducedMotion={reducedMotion} />
      <Player
        reducedMotion={reducedMotion}
        cameraSensitivity={cameraSensitivity}
        zone={zone}
        onNpcProximityChange={onNpcProximityChange}
        onMirrorHallPresenceChange={onMirrorHallPresenceChange}
      />
    </>
  )
}

function PerformanceSampler({
  onFirstFrame,
  onFpsSample,
}: Pick<GameCanvasProps, 'onFirstFrame' | 'onFpsSample'>) {
  const firstFrameSent = useRef(false)
  const elapsed = useRef(0)
  const frames = useRef(0)

  useFrame((_, delta) => {
    if (!firstFrameSent.current) {
      firstFrameSent.current = true
      onFirstFrame?.()
    }

    if (!onFpsSample) return
    elapsed.current += delta
    frames.current += 1
    if (elapsed.current >= 1.5) {
      onFpsSample(Math.round(frames.current / elapsed.current))
      elapsed.current = 0
      frames.current = 0
    }
  })

  return null
}

export function GameCanvas(props: GameCanvasProps) {
  const controls = useMemo(() => movementControlMap, [])

  return (
    <KeyboardControls map={controls}>
      <Canvas
        shadows="basic"
        dpr={[1, 1.5]}
        camera={{ fov: 52, near: 0.1, far: 60, position: [4.6, 5.1, 11.2] }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Physics gravity={[0, -18, 0]}>
            <World {...props} />
            <PerformanceSampler
              onFirstFrame={props.onFirstFrame}
              onFpsSample={props.onFpsSample}
            />
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  )
}
