import { LabeledPublication } from './Publication';

/**
 * All avaiable message types that can be sent
 * from the host application to the client content.
 */
export type HostToClient = LabeledPublication;

/**
 * Validates correctness of messages being sent from
 * the host to the client.
 * @param msg The message requiring validation.
 */
export function validate(msg: HostToClient): HostToClient {
  // TODO: actually validate cases
  switch (msg.msgType) {
    case 'publish':
      return msg;
  }
}
