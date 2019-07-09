/**
 * The options to use when creating a key class.
 */
interface KeyModifierOptions {
  /** If the alt key is pressed. */
  alt?: boolean;
  /** If the ctrl key is pressed. */
  ctrl?: boolean;
  /** If the shift key is pressed. */
  shift?: boolean;
  /** If the meta key is pressed. */
  meta?: boolean;
}

const codeMap = new Map(
  Object.entries({
    Comma: ',',
    Period: '.',
    Semicolon: ';',
    Quote: '"',
    BracketLeft: '[',
    BracketRight: ']',
    Backquote: '`',
    Backslash: '\\',
    Minus: '-',
    Equal: '='
  })
);

const keyCodeMap = new Map<number, string>([
  [37, 'ArrowLeft'],
  [38, 'ArrowUp'],
  [39, 'ArrowRight'],
  [40, 'ArrowDown']
]);

/**
 * Code comes in many formats.
 * Keys start with Key (ex: KeyN)
 * Digits start with Digit (ex: Digit1)
 * Other characters like .,[] are all treated with special string values.
 */
function getCodeValue(code: string): string | undefined {
  if (code.startsWith('Key')) {
    return code.substring(3, code.length).toLowerCase();
  }

  if (code.startsWith('Digit')) {
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
 * Key class for converting and handling key events.
 */
class Key {
  /** The key (character) that was pressed */
  public key: string;
  /** If the alt key was pressed */
  public alt?: boolean;
  /** If the ctrl key was pressed */
  public ctrl?: boolean;
  /** If the shift key was pressed */
  public shift?: boolean;
  /** If the meta key was pressed */
  public meta?: boolean;

  /** Converts a browser KeyboardEvent into a Key */
  public static fromKeyEvent(event: KeyboardEvent): Key {
    const options = {
      alt: event.altKey,
      ctrl: event.ctrlKey,
      shift: event.shiftKey,
      meta: event.metaKey
    };

    return new Key(getKeyValue(event), options);
  }

  constructor(key: string, options?: KeyModifierOptions) {
    this.key = key.toLowerCase();
    this.alt = (options && options.alt) || false;
    this.ctrl = (options && options.ctrl) || false;
    this.shift = (options && options.shift) || false;
    this.meta = (options && options.meta) || false;
  }

  /** Creates a string representation of the key */
  public serialize(): string {
    let retVal = this.key || '';

    if (this.ctrl) {
      retVal += 'ctrl';
    }

    if (this.alt) {
      retVal += 'alt';
    }

    if (this.shift) {
      retVal += 'shift';
    }

    if (this.meta) {
      retVal += 'meta';
    }

    return retVal;
  }

  /** Tests equalality of another key. */
  public equals(key: Key): boolean {
    return key.serialize() === this.serialize();
  }
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
export { Key, NativeKey };
