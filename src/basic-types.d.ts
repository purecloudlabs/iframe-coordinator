interface LabeledMsg {
  msgType: string;
  msg: any;
}

type SubscribeHandler = (msg: LabeledMsg) => void;
