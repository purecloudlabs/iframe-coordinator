import { FrameRouter } from '../elm/FrameRouter.elm';

export default class FrameRouterElement extends HTMLElement {
    constructor() {
        super();
    }

    registerComponents(components) {
        this.router = FrameRouter.embed(this, components);

        window.addEventListener('message', (event) => {
            this.router.ports.componentIn.send(event.data);
        });
    }
}

