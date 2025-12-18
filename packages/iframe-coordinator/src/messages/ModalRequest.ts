import { constant, Decoder, mixed, object, optional, string } from "decoders";
import { labeledDecoder, LabeledMsg } from "./LabeledMsg";

/**
 * The modal request data.
 */
export interface ModalRequest {
  /** The ID of the modal the client wishes to launch */
  modalId: string;

  /** Any data that the client wishes to send to the modal */
  modalData: any;

  /** Optional field for clients to specify additional display options  */
  custom?: any;
}

/**
 * A message used to publish a generic messages
 * between the clients and the host application.
 */
export interface LabeledModalRequest
  extends LabeledMsg<"modalRequest", ModalRequest> {
  /** Message identifier */
  msgType: "modalRequest";
  /** Modal request details (type and data) */
  msg: ModalRequest;
  /** Optional field for clients to specify additional display options */
  custom?: any;
}

const decoder: Decoder<LabeledModalRequest> = labeledDecoder(
  constant<"modalRequest">("modalRequest"),
  object({
    modalId: string,
    modalData: mixed,
    custom: optional(mixed),
  }),
);

export { decoder };
