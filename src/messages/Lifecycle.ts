import {
  array,
  boolean,
  constant,
  Decoder,
  mixed,
  object,
  optional,
  string
} from 'decoders';
import { applyClientProtocol, labeledDecoder, LabeledMsg } from './LabeledMsg';

/**
 * Client started indication.  The client will
 * now listen for messages and begin sending
 * messages from the client application.
 */
export interface LabeledStarted extends LabeledMsg<'client_started', any> {
  /** Message identifier */
  msgType: 'client_started';
}

// We don't care what is in msg for Started messages.
const startedDecoder: Decoder<LabeledStarted> = labeledDecoder(
  constant<'client_started'>('client_started'),
  mixed
);

/**
 * Environmental data provided to all clients
 * in order to match behavior of the host application.
 */
export interface EnvData {
  /** Locale in use by the host app */
  locale: string;
  /** Location of the host app */
  hostRootUrl: string;
  /** Keys to notify changes on */
  registeredKeys?: KeyData[];
  /** Extra host-specific details */
  custom?: any;
}

/**
 * Extended Environmental data passed to client with some private data.
 */
export interface SetupData extends EnvData {
  /** assigned route of the client */
  assignedRoute: string;
}

/**
 * A data structure representing a key.
 */
export interface KeyData {
  /** The key character for example: 'a' */
  key: string;
  /** If the alt key should be pressed. */
  altKey?: boolean;
  /** If the ctrl key should be pressed. */
  ctrlKey?: boolean;
  /** If the meta key should be pressed. */
  metaKey?: boolean;
  /** If the shift key should be pressed. */
  shiftKey?: boolean;
}

/**
 * Initial setup message where environmental data
 * is sent to the client.
 */
export interface LabeledEnvInit extends LabeledMsg<'env_init', SetupData> {
  /** Message identifier */
  msgType: 'env_init';
  /** Environment data */
  msg: SetupData;
}

const envDecoder: Decoder<LabeledEnvInit> = labeledDecoder(
  constant<'env_init'>('env_init'),
  object({
    locale: string,
    hostRootUrl: string,
    assignedRoute: string,
    registeredKeys: optional(
      array(
        object({
          key: string,
          altKey: optional(boolean),
          ctrlKey: optional(boolean),
          metaKey: optional(boolean),
          shiftKey: optional(boolean)
        })
      )
    ),
    custom: mixed
  })
);

export { startedDecoder, envDecoder };

/**
 * Handles new environmental data events.
 */
export type EnvDataHandler = (envData: EnvData) => void;

/**
 * Helpful properties for working with lifecycle stages and
 * their coresponding labeled messages.
 */
export class Lifecycle {
  /**
   * A {@link LabeledStarted} message to send to the host application.
   */
  public static get startedMessage(): LabeledStarted {
    return applyClientProtocol({
      msgType: 'client_started',
      msg: undefined
    });
  }
}
