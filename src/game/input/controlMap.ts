import type { KeyboardControlsEntry } from '@react-three/drei'

export type GameControl =
  | 'move-forward'
  | 'move-backward'
  | 'move-left'
  | 'move-right'
  | 'interact'

export const movementControlMap: KeyboardControlsEntry<GameControl>[] = [
  { name: 'move-forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'move-backward', keys: ['KeyS', 'ArrowDown'] },
  { name: 'move-left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'move-right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'interact', keys: ['KeyE', 'Enter'] },
]

export const controlLabels: Record<GameControl, string> = {
  'move-forward': 'Gå fremover',
  'move-backward': 'Gå bakover',
  'move-left': 'Gå mot venstre',
  'move-right': 'Gå mot høyre',
  interact: 'Samhandle',
}

export function matchesControlKey(control: GameControl, code: string) {
  return movementControlMap
    .find((binding) => binding.name === control)
    ?.keys.includes(code) ?? false
}
