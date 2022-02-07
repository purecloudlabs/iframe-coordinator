import { constant, Decoder, mixed, object, optional, string } from 'decoders';
import { labeledDecoder, LabeledMsg } from './LabeledMsg';

/**
 * The modal request data.
 */
export interface ModalRequest {
  /** The ID of the modal the client wishes to launch */
  modalId: string;

  /** Any data that the client wishes to send to the modal */
  modalData: any;

  /** How the modal should be styled in terms of width and height
   * Is an optional parameter where default height is set to
   * 700px and default width is set to 850px
   */
  modalStyle?: any;
}

/**
 * A message used to publish a generic messages
 * between the clients and the host application.
 */
export interface LabeledModalRequest
  extends LabeledMsg<'modalRequest', ModalRequest> {
  /** Message identifier */
  msgType: 'modalRequest';
  /** Modal request details (type and data) */
  msg: ModalRequest;
}

const decoder: Decoder<LabeledModalRequest> = labeledDecoder(
  constant<'modalRequest'>('modalRequest'),
  object({
    modalId: string,
    modalData: mixed,
    modalStyle: optional(mixed)
  })
);

export { decoder };
