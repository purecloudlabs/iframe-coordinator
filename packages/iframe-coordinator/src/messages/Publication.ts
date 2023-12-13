import {
  constant,
  Decoder,
  map,
  mixed,
  object,
  optional,
  string,
} from "decoders";
import { labeledDecoder, LabeledMsg } from "./LabeledMsg";

/**
 * A pub-sub message for general-purpose messaging between hosts and clients.
 */
export interface Publication {
  /**
   * The topic to publish on. The host application must be subscribed to the topic
   * in order to receive the message.
   */
  topic: string;
  /** Data to publish */
  payload: any;
  /**
   * Client the message originates from. This should not be provided when
   * calling client methods. The value will be ignored and the library
   * will replace it when delivering the message to the host.
   */
  clientId?: string;
}

/**
 * A message used to publish a generic messages
 * between the clients and the host application.
 */
export interface LabeledPublication extends LabeledMsg<"publish", Publication> {
  /** Message identifier */
  msgType: "publish";
  /** Details of the data to publish */
  msg: Publication;
}

const decoder: Decoder<LabeledPublication> = labeledDecoder(
  constant<"publish">("publish"),
  object({
    topic: string,
    payload: mixed,
    clientId: optional(string),
  }),
);

export { decoder };
