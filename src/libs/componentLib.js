import { ComponentHelper } from '../elm/ComponentHelper.elm';

let worker = null;

function start(expectedOrigin) {
    if (!worker) {
        worker = ComponentHelper.worker();

        console.log('Setting up message listener');

        window.addEventListener('message', (event) => {
            console.log('Got postmessage', event);
            worker.ports.parentMessage.send({
                origin: event.origin,
                data: event.data
            });
        });
    }
    return worker;
}

start();
