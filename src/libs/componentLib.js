import { ComponentHelper } from '../elm/ComponentHelper.elm';

let worker = null;

function start(expectedOrigin) {
    if (!worker) {
        worker = ComponentHelper.worker();

        window.addEventListener('message', (event) => {
            worker.ports.coordinatorIn.send({
                origin: event.origin,
                data: event.data
            });
        });

        worker.ports.coordinatorOut.subscribe((message) => {
            window.parent.postMessage(message, "*");
        });

        onLinkClick((location) => {
            worker.ports.componentIn.send({
                msgType: 'navRequest',
                msg: location
            });
        });

    }
    return worker;
}

function onLinkClick (callback) {
    window.addEventListener('click', (event) => {
        if (event.target.tagName.toLowerCase() === 'a') {
            event.preventDefault();
            let a = event.target;
            let location = {
                href: a.href,
                host: a.host,
                hostname: a.hostname,
                protocol: a.protocol,
                origin: a.origin,
                port: a.port,
                pathname: a.pathname,
                search: a.search,
                hash: a.hash,
                username: a.username,
                password: a.password
            };

            callback(location);
        }
    });
}

start();
