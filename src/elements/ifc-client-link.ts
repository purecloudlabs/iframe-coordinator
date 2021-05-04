import { Client } from '../client';
const PATH_ATTR = 'path';

/**
 * A custom element responsible for rendering an anchor element, turning a path
 * within the current application to a full top-level url.
 * It is registered as `ifc-client-link` within client.ts
 */

export default class IfcClientLinkElement extends HTMLElement {
  private _client: Client;

  /** @internal */
  constructor(clientInstance: any) {
    super();
    this._client = clientInstance;
  }

  /**
   * @internal
   * @inheritdoc
   */
  static get observedAttributes() {
    return [PATH_ATTR];
  }

  /**
   * @internal
   * @inheritdoc
   */
  public connectedCallback() {
    const content = this.innerHTML;
    let path = this.getAttribute(PATH_ATTR) || '';
    path = this._client.urlFromClientPath(path);
    this.innerHTML = `<a target='_top' href=${path}>${content}</a>`;
  }

  /**
   * @internal
   * @inheritdoc
   */
  public attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null
  ) {
    if (name === PATH_ATTR && oldValue !== newValue) {
      let path = this.getAttribute(PATH_ATTR) || '';
      path = this._client.urlFromClientPath(path);
      this.firstElementChild?.setAttribute('href', path);
    }
  }
}
