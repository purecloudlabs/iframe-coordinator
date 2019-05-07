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
export interface LabeledMsg {
  /** The type of message */
  msgType: string;
  /** The message payload */
  msg: any;
}
