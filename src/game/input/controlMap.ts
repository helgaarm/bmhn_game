import type { KeyboardControlsEntry } from '@react-three/drei'

export type GameControl =
  | 'move-forward'
  | 'move-backward'
  | 'move-left'
  | 'move-right'
  | 'camera-left'
  | 'camera-right'
  | 'camera-up'
  | 'camera-down'
  | 'camera-reset'
  | 'interact'

export const movementControlMap: KeyboardControlsEntry<GameControl>[] = [
  { name: 'move-forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'move-backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'move-left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'move-right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'camera-left', keys: ['KeyQ'] },
  { name: 'camera-right', keys: ['KeyR'] },
  { name: 'camera-up', keys: ['PageUp'] },
  { name: 'camera-down', keys: ['PageDown'] },
  { name: 'camera-reset', keys: ['KeyC'] },
  { name: 'interact', keys: ['KeyE', 'Enter'] },
]

export const controlLabels: Record<GameControl, string> = {
  'move-forward': 'Gå fremover',
  'move-backward': 'Gå bakover',
  'move-left': 'Gå mot venstre',
  'move-right': 'Gå mot høyre',
  'camera-left': 'Drei kamera mot venstre',
  'camera-right': 'Drei kamera mot høyre',
  'camera-up': 'Løft kamera',
  'camera-down': 'Senk kamera',
  'camera-reset': 'Nullstill kamera',
  interact: 'Samhandle',
}

export type GameControlState = Partial<Record<GameControl, boolean>>

export function isTextEntryTarget(
  target: EventTarget | Element | null,
): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.matches('input, textarea, select')) return true
  if (target.isContentEditable) return true
  const editableAncestor = target.closest('[contenteditable]')
  return (
    editableAncestor !== null &&
    editableAncestor.getAttribute('contenteditable') !== 'false'
  )
}

export function getMovementAxes(
  controls: GameControlState,
  activeElement: Element | null,
) {
  if (isTextEntryTarget(activeElement)) return { x: 0, z: 0 }
  return {
    x:
      Number(Boolean(controls['move-right'])) -
      Number(Boolean(controls['move-left'])),
    z:
      Number(Boolean(controls['move-backward'])) -
      Number(Boolean(controls['move-forward'])),
  }
}

export function matchesControlKey(control: GameControl, code: string) {
  return movementControlMap
    .find((binding) => binding.name === control)
    ?.keys.includes(code) ?? false
}
