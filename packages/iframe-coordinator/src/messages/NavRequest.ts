import { constant, Decoder, either, object, optional, string } from "decoders";
import { labeledDecoder, LabeledMsg } from "./LabeledMsg";

/**
 * The navigation request data.
 */
export interface NavRequest {
  /** The URL the client wants the host application to navigate to */
  url: string;
  /** How the client wants the host to update the browser's session history.
   * Push is the default behavior (adds a new session history entry).
   * Replace alters the current entry so that using the back button
   * after navigation will skip the location you are navigating from.
   */
  history?: "push" | "replace";
}

/**
 * A message used to request the host navigate to another
 * URI.
 */
export interface LabeledNavRequest
  extends LabeledMsg<"navRequest", NavRequest> {
  /** Message identifier */
  msgType: "navRequest";
  /** Navigation request details */
  msg: NavRequest;
}

const decoder: Decoder<LabeledNavRequest> = labeledDecoder(
  constant<"navRequest">("navRequest"),
  object({
    url: string,
    history: optional(
      either(constant<"push">("push"), constant<"replace">("replace")),
    ),
  }),
);

export { decoder };
