import { InPort } from './ports/InPort';
import { OutPort } from './ports/OutPort';

class HostPorts {
  public fromHost: InPort = new InPort();
  public toHost: OutPort = new OutPort();
  public toClient: OutPort = new OutPort();
}

export { HostPorts };
