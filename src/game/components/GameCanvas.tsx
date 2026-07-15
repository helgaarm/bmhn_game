import { KeyboardControls, useKeyboardControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from '@react-three/rapier'
import { Suspense, useMemo, useRef } from 'react'
import type { Group } from 'three'
import { MathUtils, Vector3 } from 'three'
import {
  movementControlMap,
  type GameControl,
} from '../input/controlMap'

interface GameCanvasProps {
  reducedMotion: boolean
  zone: 'showroom' | 'mirror-hall'
  onNpcProximityChange: (isNear: boolean) => void
  onFirstFrame?: () => void
  onFpsSample?: (fps: number) => void
}

const NPC_POSITION = new Vector3(0, 1, -1.5)

function Player({
  onNpcProximityChange,
}: Pick<GameCanvasProps, 'onNpcProximityChange'>) {
  const body = useRef<RapierRigidBody>(null)
  const avatar = useRef<Group>(null)
  const proximity = useRef(false)
  const cameraPosition = useMemo(() => new Vector3(), [])
  const cameraTarget = useMemo(() => new Vector3(), [])
  const [, getControls] = useKeyboardControls<GameControl>()

  useFrame(({ camera }, delta) => {
    const rigidBody = body.current
    if (!rigidBody) return

    const keys = getControls()
    const directionX =
      Number(Boolean(keys['move-right'])) - Number(Boolean(keys['move-left']))
    const directionZ =
      Number(Boolean(keys['move-backward'])) - Number(Boolean(keys['move-forward']))
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

    const position = rigidBody.translation()
    const nearNpc =
      Math.hypot(position.x - NPC_POSITION.x, position.z - NPC_POSITION.z) <
      2.35
    if (nearNpc !== proximity.current) {
      proximity.current = nearNpc
      onNpcProximityChange(nearNpc)
    }

    if (position.y < -4) {
      rigidBody.setTranslation({ x: 0, y: 1, z: 5 }, true)
    }

    cameraPosition.set(position.x + 4.6, position.y + 4.1, position.z + 6.2)
    camera.position.lerp(cameraPosition, 1 - Math.exp(-5 * delta))
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

function World({ reducedMotion, zone, onNpcProximityChange }: GameCanvasProps) {
  const isMirrorHall = zone === 'mirror-hall'
  return (
    <>
      <color attach="background" args={[isMirrorHall ? '#002e38' : '#002920']} />
      <fog attach="fog" args={[isMirrorHall ? '#002e38' : '#002920', 10, 27]} />
      <hemisphereLight args={['#c4f2da', '#002920', 1.5]} />
      <directionalLight
        castShadow
        color="#ffc46b"
        intensity={2.6}
        position={[6, 10, 5]}
        shadow-mapSize={[1024, 1024]}
      />

      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[10, 0.1, 10]} position={[0, -0.1, 0]} />
        <CuboidCollider args={[10, 1.4, 0.2]} position={[0, 1.2, -10]} />
        <CuboidCollider args={[10, 1.4, 0.2]} position={[0, 1.2, 10]} />
        <CuboidCollider args={[0.2, 1.4, 10]} position={[-10, 1.2, 0]} />
        <CuboidCollider args={[0.2, 1.4, 10]} position={[10, 1.2, 0]} />
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
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

      {isMirrorHall && [-6, -2, 2, 6].map((x, index) => (
        <group key={`actor-mirror-${x}`} position={[x, 1.45, -7.2]}>
          <mesh castShadow>
            <boxGeometry args={[2.1, 2.9, 0.18]} />
            <meshStandardMaterial
              color={index % 2 ? '#c4f2da' : '#7befb2'}
              emissive="#02a67f"
              emissiveIntensity={0.12}
              metalness={0.72}
              roughness={0.24}
            />
          </mesh>
          <mesh position={[0, -1.72, 0.25]} castShadow>
            <cylinderGeometry args={[0.72, 0.92, 0.55, 7]} />
            <meshStandardMaterial color="#247360" roughness={0.84} />
          </mesh>
        </group>
      ))}

      <group position={[0, 0, -4.1]}>
        <mesh castShadow position={[-1.6, 1.25, 0]}>
          <boxGeometry args={[0.75, 2.5, 0.7]} />
          <meshStandardMaterial color="#723e33" roughness={0.82} />
        </mesh>
        <mesh castShadow position={[1.6, 1.25, 0]}>
          <boxGeometry args={[0.75, 2.5, 0.7]} />
          <meshStandardMaterial color="#723e33" roughness={0.82} />
        </mesh>
        <mesh castShadow position={[0, 2.45, 0]}>
          <boxGeometry args={[4, 0.52, 0.72]} />
          <meshStandardMaterial color="#723e33" roughness={0.82} />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <torusGeometry args={[1.05, 0.1, 10, 24, Math.PI]} />
          <meshStandardMaterial
            color="#7befb2"
            emissive="#02a67f"
            emissiveIntensity={1.2}
          />
        </mesh>
      </group>

      <Nor reducedMotion={reducedMotion} />
      <Player onNpcProximityChange={onNpcProximityChange} />
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
