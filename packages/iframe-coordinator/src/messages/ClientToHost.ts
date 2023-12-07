import { dispatch, guard } from "decoders";
import { decoder as clickDecoder, LabeledClick } from "./Click";
import { decoder as keyDownDecoder, LabeledKeyDown } from "./KeyDown";
import { LabeledStarted, startedDecoder } from "./Lifecycle";
import { decoder as modalDecoder, LabeledModalRequest } from "./ModalRequest";
import { decoder as navRequestDecoder, LabeledNavRequest } from "./NavRequest";
import { decoder as notifyDecoder, LabeledNotification } from "./Notification";
import {
  decoder as pageMetadataDecoder,
  LabeledPageMetadata,
} from "./PageMetadata";
import { decoder as promptDecoder, LabeledPrompt } from "./PromptOnLeave";
import {
  decoder as publicationDecoder,
  LabeledPublication,
} from "./Publication";

/**
 * All available message types that can be sent
 * from the client content to the host application.
 */
export type ClientToHost =
  | LabeledPublication
  | LabeledNotification
  | LabeledClick
  | LabeledNavRequest
  | LabeledStarted
  | LabeledKeyDown
  | LabeledModalRequest
  | LabeledPageMetadata
  | LabeledPrompt;

/**
 * Validates correctness of messages being sent from
 * the client to the host.
 * @param msg The message requiring validation.
 */
export function validate(msg: any): ClientToHost {
  return guard(
    dispatch("msgType", {
      publish: publicationDecoder,
      registeredKeyFired: keyDownDecoder,
      client_started: startedDecoder,
      clickFired: clickDecoder,
      navRequest: navRequestDecoder,
      notifyRequest: notifyDecoder,
      toastRequest: notifyDecoder,
      modalRequest: modalDecoder,
      pageMetadata: pageMetadataDecoder,
      promptOnLeave: promptDecoder,
    }),
  )(msg);
}
