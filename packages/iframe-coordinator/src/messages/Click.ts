import { constant, Decoder, object } from "decoders";
import { labeledDecoder, LabeledMsg } from "./LabeledMsg";

/**
 * A message used to notify the host that a click (mousedown followed by mouseup)
 * occurred in the client application.
 */
export interface LabeledClick extends LabeledMsg<"clickFired", {}> {
  /** Message identifier */
  msgType: "clickFired";
}

const decoder: Decoder<LabeledClick> = labeledDecoder(
  constant<"clickFired">("clickFired"),
  object({}),
);

export { decoder };
