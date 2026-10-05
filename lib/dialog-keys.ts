import { useEffect, useRef, type KeyboardEvent } from "react"

/**
 * Enter accepts a dialog even when focus is not in one of its text fields (a tab, the dialog
 * itself, a search box outside the form). Returns whether it submitted.
 *
 * It stays out of the way where Enter already means something: buttons and links (activate),
 * selects, cards (`role="button"`), and text inputs inside the form, which submit it natively.
 */
export function submitOnEnter(e: KeyboardEvent, form: HTMLFormElement | null): boolean {
  if (e.key !== "Enter" || e.shiftKey || e.defaultPrevented || e.nativeEvent.isComposing) return false
  const target = e.target
  if (!form || !(target instanceof HTMLElement)) return false
  if (target.closest('button, a, select, textarea, [role="button"], [role="menuitem"], [role="combobox"]')) {
    return false
  }
  if (target instanceof HTMLInputElement && form.contains(target)) return false
  e.preventDefault()
  form.requestSubmit()
  return true
}

/**
 * While a dialog is open, Enter accepts it even if focus never moved into it (e.g. right after
 * it opens, focus is still on the page). Only fires when focus is on the page itself, so it
 * never competes with a field, button or popup inside the dialog, which handle Enter natively.
 */
export function useEnterOutsideDialog(enabled: boolean, onEnter: () => void) {
  const latest = useRef(onEnter)
  useEffect(() => {
    latest.current = onEnter
  })
  useEffect(() => {
    if (!enabled) return
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key !== "Enter" || e.shiftKey || e.isComposing || e.defaultPrevented) return
      const t = e.target
      const onPage =
        t === document.body ||
        t === document.documentElement ||
        (t instanceof Element && t.closest("main") !== null && t.closest('[data-slot="dialog-content"]') === null)
      if (!onPage) return
      // Capture phase: also stops a focused page button from being activated by the same Enter.
      e.preventDefault()
      e.stopPropagation()
      latest.current()
    }
    document.addEventListener("keydown", onKeyDown, true)
    return () => document.removeEventListener("keydown", onKeyDown, true)
  }, [enabled])
}
