import { KeyData } from "./messages/Lifecycle";

const codeMap = new Map(
  Object.entries({
    Comma: ",",
    Period: ".",
    Semicolon: ";",
    Quote: '"',
    BracketLeft: "[",
    BracketRight: "]",
    Backquote: "`",
    Backslash: "\\",
    Minus: "-",
    Equal: "=",
  }),
);

const keyCodeMap = new Map<number, string>([
  [37, "ArrowLeft"],
  [38, "ArrowUp"],
  [39, "ArrowRight"],
  [40, "ArrowDown"],
]);

/**
 * Code comes in many formats.
 * Keys start with Key (ex: KeyN)
 * Digits start with Digit (ex: Digit1)
 * Other characters like .,[] are all treated with special string values.
 */
function getCodeValue(code: string): string | undefined {
  if (code.startsWith("Key")) {
    return code.substring(3, code.length).toLowerCase();
  }

  if (code.startsWith("Digit")) {
    return code.substring(5, code.length).toLowerCase();
  }

  return codeMap.get(code);
}

/**
 * Gets the key code value.
 */
function getKeyCodeValue(keyCode: number): string | undefined {
  if (keyCodeMap.has(keyCode)) {
    return keyCodeMap.get(keyCode);
  }

  return String.fromCharCode(keyCode).toLowerCase();
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
 * Value detection is hard. Basically we want to use code if we can but code comes in many formats.
 * Also code is not garuntueed in all browsers so we need to fallback to keyCode or key.
 */
function getKeyValue(event: KeyboardEvent): string {
  if (event.code) {
    const value = getCodeValue(event.code);
    if (value) {
      return value;
    }
  }

  if (event.keyCode) {
    const keyCodeValue = getKeyCodeValue(event.keyCode);
    if (keyCodeValue) {
      return keyCodeValue;
    }
  }

  return event.key;
}

/**
 * Compares a KeyboardEvent with KeyData to test equality.
 * @param key The KeyData to compare against.
 * @param event The incoming event to compare with.
 */
function keyEqual(key: KeyData, event: KeyboardEvent): boolean {
  const keyValue = getKeyValue(event);
  const alt = key.altKey || false;
  const ctrl = key.ctrlKey || false;
  const shift = key.shiftKey || false;
  const meta = key.metaKey || false;

  return (
    keyValue === key.key &&
    event.altKey === alt &&
    event.ctrlKey === ctrl &&
    event.shiftKey === shift &&
    event.metaKey === meta
  );
}

/** Data structure representing a native key event. */
interface NativeKey {
  /** If the alt key was pressed */
  altKey?: boolean;
  /** The character code for the event. */
  charCode?: number;
  /** The code for the event. */
  code?: string;
  /** If the ctrl key was pressed */
  ctrlKey?: boolean;
  /** The key that was pressed */
  key: string;
  /** The key code for the event. */
  keyCode?: number;
  /** If the meta key was pressed. */
  metaKey?: boolean;
  /** If the shift key was pressed. */
  shiftKey?: boolean;
}
export { keyEqual, NativeKey };
