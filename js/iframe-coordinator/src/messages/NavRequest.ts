import { LabeledMsg } from './LabeledMsg';

export interface NavRequest {
  url: String;
}

export interface LabeledNavRequest extends LabeledMsg {
  msgType: 'navRequest';
  msg: NavRequest;
}
