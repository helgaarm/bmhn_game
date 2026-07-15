import { describe, expect, it } from 'vitest'
import { getMovementAxes, isTextEntryTarget } from './controlMap'

describe('game keyboard focus boundary', () => {
  it('returns movement axes when focus is outside an editable field', () => {
    expect(
      getMovementAxes(
        { 'move-forward': true, 'move-right': true },
        document.body,
      ),
    ).toEqual({ x: 1, z: -1 })
  })

  it.each(['input', 'textarea', 'select']) (
    'suppresses movement while focus is in %s',
    (tagName) => {
      const field = document.createElement(tagName)
      document.body.append(field)
      field.focus()

      expect(isTextEntryTarget(document.activeElement)).toBe(true)
      expect(
        getMovementAxes(
          {
            'move-forward': true,
            'move-backward': true,
            'move-left': true,
            'move-right': true,
          },
          document.activeElement,
        ),
      ).toEqual({ x: 0, z: 0 })

      field.remove()
    },
  )

  it('suppresses movement for descendants of a content-editable region', () => {
    const editor = document.createElement('div')
    const child = document.createElement('span')
    editor.setAttribute('contenteditable', 'true')
    editor.append(child)
    document.body.append(editor)

    expect(isTextEntryTarget(child)).toBe(true)
    expect(getMovementAxes({ 'move-forward': true }, child)).toEqual({
      x: 0,
      z: 0,
    })

    editor.remove()
  })

  it('resumes movement after the text field loses focus', () => {
    const field = document.createElement('textarea')
    document.body.append(field)
    field.focus()
    expect(getMovementAxes({ 'move-left': true }, field)).toEqual({ x: 0, z: 0 })

    field.blur()
    expect(
      getMovementAxes({ 'move-left': true }, document.activeElement),
    ).toEqual({ x: -1, z: 0 })
    field.remove()
  })
})
