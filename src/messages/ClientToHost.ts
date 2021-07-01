import { dispatch, guard } from 'decoders';
import { decoder as keyDownDecoder, LabeledKeyDown } from './KeyDown';
import { LabeledStarted, startedDecoder } from './Lifecycle';
import { decoder as modalDecoder, LabeledModal } from './Modal';
import { decoder as navRequestDecoder, LabeledNavRequest } from './NavRequest';
import { decoder as notifyDecoder, LabeledNotification } from './Notification';
import {
  decoder as publicationDecoder,
  LabeledPublication
} from './Publication';

/**
 * All avaiable message types that can be sent
 * from the client content to the host application.
 */
export type ClientToHost =
  | LabeledPublication
  | LabeledNotification
  | LabeledNavRequest
  | LabeledStarted
  | LabeledKeyDown
  | LabeledModal;

/**
 * Validates correctness of messages being sent from
 * the client to the host.
 * @param msg The message requiring validation.
 */
export function validate(msg: any): ClientToHost {
  return guard(
    dispatch('msgType', {
      publish: publicationDecoder,
      registeredKeyFired: keyDownDecoder,
      client_started: startedDecoder,
      navRequest: navRequestDecoder,
      notifyRequest: notifyDecoder,
      toastRequest: notifyDecoder,
      modalRequest: modalDecoder
    })
  )(msg);
}
