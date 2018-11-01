import { LabeledMsg } from './LabeledMsg';

/**
 * The navigation request data.
 */
export interface NavRequest {
  url: string;
}

/**
 * A message used to indicate a navigation operation
 * has been requested.
 */
export interface LabeledNavRequest extends LabeledMsg {
  msgType: 'navRequest';
  msg: NavRequest;
}
