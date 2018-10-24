import { HostPort } from './ports/HostPort';
import { InPort } from './ports/InPort';
import { OutPort } from './ports/OutPort';

class ClientPorts {
  public fromHost: HostPort = new HostPort();
  public toHost: OutPort = new OutPort();
  public fromClient: InPort = new InPort();
  public toClient: OutPort = new OutPort();
}

export { ClientPorts };
