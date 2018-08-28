import FrameRouter from '../elements/frame-router.js';
import ComponentFrame from '../elements/component-frame.js';

export default {
    registerElements() {
        customElements.define('frame-router', FrameRouter);
        customElements.define('component-frame', ComponentFrame);
    }
};
