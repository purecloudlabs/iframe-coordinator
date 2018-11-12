import ClientFrame from './elements/x-ifc-frame';
import { validate as validateIncoming } from './messages/ClientToHost';
import { EnvData, LabeledEnvData } from './messages/EnvData';
import {
  HostToClient,
  validate as validateOutgoing
} from './messages/HostToClient';
import { LabeledLifecycle } from './messages/Lifecycle';
import { LabeledPublication, Publication } from './messages/Publication';

interface ClientRegistration {
  url: string;
  assignedRoute: string;
}

class HostRouter {
  private _routingMap: { [key: string]: ClientRegistration };
  private _clientFrame: ClientFrame;
  private _toHostSubscriptions: SubscribeHandler[];
  private _interestedTopics: Set<string>;
  private _clientData: EnvData;

  constructor(options: {
    node: HTMLElement;
    routingMap: { [key: string]: ClientRegistration };
  }) {
    this._routingMap = options.routingMap;
    this._interestedTopics = new Set();
    this._toHostSubscriptions = [];

    this._clientFrame = new ClientFrame();
    this._clientFrame.setAttribute('src', 'about:blank');
    this._clientFrame.addEventListener('clientMessage', (data: CustomEvent) => {
      const validate = validateIncoming(data.detail);
      if (validate) {
        this._clientMessageFromFrame(validate);
      }
    });
    options.node.appendChild(this._clientFrame);
  }

  public subscribeToMessages(topic: string): void {
    this._interestedTopics.add(topic);
  }

  public unsubscribeToMessages(topic: string): void {
    this._interestedTopics.delete(topic);
  }

  public onSendToHost(handler: SubscribeHandler): void {
    this._toHostSubscriptions.push(handler);
  }

  public publishGenericMessage(message: HostToClient) {
    const validated = validateOutgoing(message);
    if (validated) {
      this._clientFrame.send(message);
    }
  }

  private _clientMessageFromFrame(message: LabeledMsg): void {
    switch (message.msgType) {
      case 'publish':
        this._handlePublishMessage(message as LabeledPublication);
        break;
      case 'lifecycle':
        this._handleLifecycleMessage(message as LabeledLifecycle);
        break;
      default:
        this._raiseToHostMessage(message);
    }
  }

  private _handleLifecycleMessage(message: LabeledLifecycle) {
    if (message.msg.stage === 'started') {
      // Client has indicated it is started. Send an acknowledgment
      // with the environmental data to use.
      this._clientFrame.send({
        msgType: 'lifecycle',
        msg: {
          stage: 'init',
          data: this._clientData
        }
      });
    }
  }

  private _handlePublishMessage(message: LabeledPublication) {
    if (this._interestedTopics.has(message.msg.topic)) {
      this._raiseToHostMessage(message);
    }
  }

  private _raiseToHostMessage(message: LabeledMsg) {
    for (const handler of this._toHostSubscriptions) {
      handler(message);
    }
  }

  public changeRoute(route: string) {
    let urlRoute: string = 'about:blank';
    for (const key in this._routingMap) {
      if (this._routingMap.hasOwnProperty(key)) {
        const element = this._routingMap[key];
        if (element.assignedRoute === route) {
          urlRoute = element.url;
        }
      }
    }

    this._clientFrame.setAttribute('src', urlRoute);
  }

  public setEnvData(envData: EnvData) {
    this._clientData = envData;
    this._clientFrame.send({
      msgType: 'lifecycle',
      msg: {
        stage: 'init',
        data: this._clientData
      }
    });
  }
}

export { HostRouter, Publication, EnvData };
