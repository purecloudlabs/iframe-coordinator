import { constant, Decoder, mixed, object, string } from "decoders";
import { labeledDecoder, LabeledMsg } from "./LabeledMsg";

interface SidePanelData {
  size: string;
  data: any;
}

/**
 * The modal request data.
 */
export interface SidePanelRequest {
  /** The ID of the side panel the client wishes to launch */
  sidePanelId: string;

  /** Any data that the client wishes to send to the side panel */
  sidePanelData: SidePanelData;
}

/**
 * A message used to publish generic messages
 * between the clients and the host application.
 */
export interface LabeledSidePanelRequest
  extends LabeledMsg<"sidePanelRequest", SidePanelRequest> {
  /** Message identifier */
  msgType: "sidePanelRequest";
  /** Side panel request details (type and data) */
  msg: SidePanelRequest;
}

const decoder: Decoder<LabeledSidePanelRequest> = labeledDecoder(
  constant<"sidePanelRequest">("sidePanelRequest"),
  object({
    sidePanelId: string,
    sidePanelData: object({
      size: string,
      data: mixed,
    }),
  }),
);

export { decoder };
