import {
  constant,
  Decoder,
  either,
  hardcoded,
  map,
  object,
  string
} from 'decoders';

// using `import` here with TypeScripts' requireJsonModule
// option breaks TS' ability to generate type files, so we
// fall back to `require`.

// tslint:disable-next-line:no-var-requires
const version = require('../../package.json').version;

/**
 * @external
 */
export const API_PROTOCOL = 'iframe-coordinator';

/**
 * Labeled message is a general structure
 * used by all coordinated messages between
 * host and client.
 *
 * The msgType will indicate the nature of
 * the message. The msg will contain the
 * information desired to be communicated.
 * @external
 */
export interface LabeledMsg<T, V> extends PartialMsg<T, V> {
  /** Distinguisihes iframe-coordinator message from other postmessage events */
  protocol: 'iframe-coordinator';
  /** library version */
  version: string;
}

/**
 * Core data structure for most messages. These are the parts that vary by message type.
 * @external
 */
export interface PartialMsg<T, V> {
  /** The type of message */
  msgType: T;
  /** The message payload */
  msg: V;
}

/**
 * Takes an object with a `msgType` and `msg` and applies the appropriate
 * `protocol` and `version` fields for the current version of the library.
 * @param partialMsg
 * @external
 */
export function applyProtocol<T, V>(
  partialMsg: PartialMsg<T, V>
): LabeledMsg<T, V> {
  return { ...partialMsg, protocol: API_PROTOCOL, version };
}

/**
 * Converts a PartialMsg decoder into a LabeledMsg decoder
 * @param msgDecoder
 * @external
 */
export function labeledDecoder2<T, V>(
  msgDecoder: Decoder<PartialMsg<T, V>>
): Decoder<LabeledMsg<T, V>> {
  return map(msgDecoder, applyProtocol);
}

/**
 * Converts a PartialMsg decoder into a LabeledMsg decoder
 * @param msgDecoder
 * @external
 */
export function labeledDecoder<T, V>(
  typeDecoder: Decoder<T>,
  msgDecoder: Decoder<V>
): Decoder<LabeledMsg<T, V>> {
  return object({
    // TODO: in 4.0.0 make protocol and verison fields mandatory
    protocol: either(
      constant<'iframe-coordinator'>(API_PROTOCOL),
      hardcoded<'iframe-coordinator'>(API_PROTOCOL)
    ),
    version: either(string, hardcoded('unknown')),
    msgType: typeDecoder,
    msg: msgDecoder
  });
}
