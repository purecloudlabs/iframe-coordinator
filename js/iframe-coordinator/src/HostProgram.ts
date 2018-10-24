import ClientFrame from './elements/x-ifc-frame';
import { HostPorts } from './HostPorts';

interface ClientRegistration {
  url: string;
  assignedRoute: string;
}

interface Publication {
  topic: string;
  payload: any;
}

class HostProgram {
  private _flags: { [key: string]: ClientRegistration };
  public ports: HostPorts;
  private _clientFrame: ClientFrame;

  constructor(options: {
    node: HTMLElement;
    flags: { [key: string]: ClientRegistration };
  }) {
    this._flags = options.flags;
    this.ports = new HostPorts();

    this._clientFrame = new ClientFrame();
    this._clientFrame.setAttribute('src', 'about:blank');
    options.node.appendChild(this._clientFrame);
  }

  public changeRoute(route: string) {
    let urlRoute: string = 'about:blank';
    for (const key in this._flags) {
      if (this._flags.hasOwnProperty(key)) {
        const element = this._flags[key];
        if (element.assignedRoute === route) {
          urlRoute = element.url;
        }
      }
    }

    this._clientFrame.setAttribute('src', urlRoute);
  }
}

export { HostProgram, Publication };
