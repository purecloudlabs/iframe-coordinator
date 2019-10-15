import { dispatch, guard } from 'decoders';
import { envDecoder, LabeledEnvInit } from './Lifecycle';
import {
  decoder as publicationDecoder,
  LabeledPublication
} from './Publication';

/**
 * All avaiable message types that can be sent
 * from the host application to the client content.
 * @external
 */
export type HostToClient = LabeledPublication | LabeledEnvInit;

/**
 * Validates correctness of messages being sent from
 * the host to the client.
 * @param msg The message requiring validation.
 * @external
 */
export function validate(msg: any): HostToClient {
  return guard(
    dispatch('msgType', { publish: publicationDecoder, env_init: envDecoder })
  )(msg);
}
