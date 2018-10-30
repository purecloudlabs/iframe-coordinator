import { LabeledMsg } from './LabeledMsg';

export interface NavRequest {
  url: string;
}

export interface LabeledNavRequest extends LabeledMsg {
  msgType: 'navRequest';
  msg: NavRequest;
}
