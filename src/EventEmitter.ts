/**
 * A generic handler for incoming event data.
 */
type EventHandler<T> = (data: T) => void;

/**
 * Simple object for keeping track of event listeners.
 * @external
 */
interface Events<T> {
  [index: string]: Array<EventHandler<T>>;
}

/** @external */
const findIndex =
  [].findIndex ||
  // IE11 support
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex#Polyfill
  function(
    predicate: (value: never, index: number, obj: never[]) => boolean,
    thisArg?: any
  ) {
    if (this == null) {
      throw new TypeError('"this" is null or not defined');
    }

    const o = Object(this);
    // tslint:disable-next-line
    const len = o.length >>> 0;

    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }

    let k = 0;
    while (k < len) {
      const kValue = o[k];
      if (predicate.call(thisArg, kValue, k, o)) {
        return k;
      }

      k++;
    }
    return -1;
  };

/**
 * Used to determine equivalancy of two handlers.
 *
 * @external
 */
function isRegistered(value: EventHandler<any>) {
  return value === this;
}

/**
 * Exposes a limited subset of event emitter
 * functionality to ensure external modules can
 * not self-emit.
 */
export class EventEmitter<T> {
  private _rootEmitter: InternalEventEmitter<T>;
  public constructor(rootEmitter: InternalEventEmitter<T>) {
    this._rootEmitter = rootEmitter;
  }

  /**
   * Sets up a function that will be called whenever the specified event type is delivered to the target.
   * @param type A case-sensitive string representing the event type to listen for.
   * @param listener The handler which receives a notification when an event of the specified type occurs.
   */
  public addListener(type: string, listener: EventHandler<T>): EventEmitter<T> {
    this._rootEmitter.addListener(type, listener);
    return this;
  }

  /**
   * Removes from the event listener previously registered with {@link EventEmitter.addEventListener}.
   * @param type A string which specifies the type of event for which to remove an event listener.
   * @param listener The event handler to remove from the event target.
   */
  public removeListener(
    type: string,
    listener: EventHandler<T>
  ): EventEmitter<T> {
    this._rootEmitter.removeListener(type, listener);
    return this;
  }

  /**
   * Removes all event listeners previously registered with {@link EventEmitter.addEventListener}.
   * @param type A string which specifies the type of event for which to remove an event listener.
   */
  public removeAllListeners(type: string): EventEmitter<T> {
    this._rootEmitter.removeAllListeners(type);
    return this;
  }
}

/**
 * An event emitter based on {@link EventTarget} used to signal
 * events between host and client. This provides class safety
 * on both the type and listeners
 * @external
 */
// tslint:disable-next-line
export class InternalEventEmitter<T> {
  private _events: Events<T>;

  public constructor() {
    this._events = {};
  }

  /**
   * Sets up a function that will be called whenever the specified event type is delivered to the target.
   * @param type A case-sensitive string representing the event type to listen for.
   * @param listener The handler which receives a notification when an event of the specified type occurs.
   */
  public addListener(
    type: string,
    listener: EventHandler<T>
  ): InternalEventEmitter<T> {
    // TODO Improve performance by allowing
    // a single T to be assigned without creating an array
    if (!this._events[type]) {
      this._events[type] = [];
    }

    const listeners = this._events[type];
    if (findIndex.call(listeners, isRegistered, listener) < 0) {
      // Only add listener if it wasn't already added.
      listeners.push(listener);
    }
    return this;
  }

  /**
   * Removes all event listeners previously registered with {@link EventEmitter.addEventListener}.
   * @param type A string which specifies the type of event for which to remove an event listener.
   */
  public removeListener(
    type: string,
    listener: EventHandler<T>
  ): InternalEventEmitter<T> {
    if (!this._events[type]) {
      return this;
    }

    const listeners = this._events[type];
    const index = findIndex.call(listeners, isRegistered, listener);
    if (index >= 0) {
      this._events[type].splice(index, 1);
    }
    return this;
  }

  /**
   * Removes all event listeners previously registered with {@link EventEmitter.addEventListener}.
   * @param type A string which specifies the type of event for which to remove an event listener.
   */
  public removeAllListeners(type: string): InternalEventEmitter<T> {
    delete this._events[type];
    return this;
  }

  /**
   * Dispatches data (synchronously) invoking the affected listeners in the appropriate order.
   * @param type A string which specifies the type of event to raise.
   * @param data The event data to send to the listeners.
   * @returns true if the handlers were called, otherwise false.
   */
  public dispatch(type: string, data: T): boolean {
    if (!this._events[type]) {
      return false;
    }

    const listeners = this._events[type];
    const length = listeners.length;
    for (let i = 0; i < length; i++) {
      listeners[i](data);
    }

    return true;
  }
}
