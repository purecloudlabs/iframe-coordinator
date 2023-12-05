import { boolean, constant, Decoder, object, optional, string } from "decoders";
import { labeledDecoder, LabeledMsg } from "./LabeledMsg";

/** A prompt on leave dialog to be displayed
 * by the host application. If the host application receives a message with the shouldPrompt field set to true
 * a dialog will be displayed asking the user for confirmation before navigating.
 */
export interface PromptOnLeave {
  /** The host application will ask the user for confirmation before
   * leaving the current page if it has received a message with the shouldPrompt field set to true.
   */
  shouldPrompt: boolean;
  /** Optional message to prompt the user with. */
  message?: string;
}

/**
 * A message used to request a prompt on leave dialog to be displayed in the host app.
 */
export interface LabeledPrompt
  extends LabeledMsg<"promptOnLeave", PromptOnLeave> {
  /** Message identifier */
  msgType: "promptOnLeave";
  /** Message details */
  msg: PromptOnLeave;
}

const decoder: Decoder<LabeledPrompt> = labeledDecoder(
  constant<"promptOnLeave">("promptOnLeave"),
  object({
    shouldPrompt: boolean,
    message: optional(string),
  }),
);

export { decoder };
