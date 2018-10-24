interface HostMessage {
  origin: string;
  data: any;
}

class HostPort {
  public send(msg: HostMessage): void {
    // TODO Implement
  }
}

export { HostPort };
