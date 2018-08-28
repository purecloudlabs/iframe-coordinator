import { FrameElement } from '../elm/FrameElement.elm';

export default class FrameRouterElement extends HTMLElement {
    constructor() {
        super();
        this.setAttribute('style', 'position: relative;');
    }

    registerComponents(components) {
        this.router = FrameElement.embed(this, components);

        window.addEventListener('message', (event) => {
            this.router.ports.componentIn.send(event.data);
        });
    }
}

