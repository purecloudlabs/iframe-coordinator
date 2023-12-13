import {
  constant,
  Decoder,
  either,
  hardcoded,
  map,
  object,
  optional,
  string,
} from "decoders";

// This is replaced by rollup-plugin-replace with the actual version from package.json
const version = "__PACKAGE_VERSION__";

export const API_PROTOCOL = "iframe-coordinator";

/**
 * Based on MessageDirection, hosts and clients can ignore messages that are not targeted at them.
 */
export type MessageDirection = "ClientToHost" | "HostToClient";

/**
 * Labeled message is a general structure
 * used by all coordinated messages between
 * host and client.
 *
 * The msgType will indicate the nature of
 * the message. The msg will contain the
 * information desired to be communicated.
 */
export interface LabeledMsg<T, V> extends PartialMsg<T, V> {
  /** Distinguisihes iframe-coordinator message from other postmessage events */
  protocol: "iframe-coordinator";
  /** library version */
  version: string;
  /** So that nested iframe-coordinators can ignore messages that don't apply */
  direction?: MessageDirection;
}

/**
 * Core data structure for most messages. These are the parts that vary by message type.
 */
export interface PartialMsg<T, V> {
  /** The type of message */
  msgType: T;
  /** The message payload */
  msg: V;
}

/**
 * Takes an object with a `msgType` and `msg` and applies the appropriate
 * `direction`, `protocol` and `version` fields for the current version of the library.
 * @param partialMsg
 */
export function applyClientProtocol<T, V>(
  partialMsg: PartialMsg<T, V>,
): LabeledMsg<T, V> {
  return {
    direction: "ClientToHost",
    ...partialMsg,
    protocol: API_PROTOCOL,
    version,
  };
}

/**
 * Takes an object with a `msgType` and `msg` and applies the appropriate
 * `direction`, `protocol` and `version` fields for the current version of the library.
 * @param partialMsg
 */
export function applyHostProtocol<T, V>(
  partialMsg: PartialMsg<T, V>,
): LabeledMsg<T, V> {
  return {
    direction: "HostToClient",
    ...partialMsg,
    protocol: API_PROTOCOL,
    version,
  };
}

/**
 * Converts a PartialMsg decoder into a LabeledMsg decoder
 * @param msgDecoder
 */
export function labeledDecoder<T, V>(
  typeDecoder: Decoder<T>,
  msgDecoder: Decoder<V>,
): Decoder<LabeledMsg<T, V>> {
  return object({
    // TODO: in 4.0.0 make protocol and version fields mandatory
    protocol: either(
      constant<"iframe-coordinator">(API_PROTOCOL),
      hardcoded<"iframe-coordinator">(API_PROTOCOL),
    ),
    version: either(string, hardcoded("unknown")),
    msgType: typeDecoder,
    msg: msgDecoder,
    direction: optional(directionDecoder),
  });
}

const directionDecoder: Decoder<MessageDirection, unknown> = either(
  constant("ClientToHost"),
  constant("HostToClient"),
);
