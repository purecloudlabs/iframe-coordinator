/**
 * A transformed KeyEvent containing no DOM specific details.
 */
export interface KeyEvent {
  /** The code from the KeyboardEvent */
  code?: string;
  /** The keyCode from the KeyboardEvent */
  keyCode?: number;
  /** The key from the KeyboardEvent */
  key?: string;
  /** The if the KeyboardEvent had the alt key pressed */
  altKey?: boolean;
  /** The if the KeyboardEvent had the ctrl key pressed */
  ctrlKey?: boolean;
  /** The if the KeyboardEvent had the meta key pressed */
  metaKey?: boolean;
}

/**
 * Transforms a browser KeyboardEvent into a pure data object.
 * @param event The KeyboardEvent from the browser
 */
export function transformKeyEvent(event: KeyboardEvent): KeyEvent {
  return {
    code: event.code,
    keyCode: event.keyCode,
    key: event.key,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey
  };
}
