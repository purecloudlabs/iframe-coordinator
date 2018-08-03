import '@webcomponents/custom-elements/src/native-shim.js';
import '@webcomponents/custom-elements/src/custom-elements.js';
import coordinator from 'iframe-coordinator/dist/coordinatorLib.js';

coordinator.registerElements();

document.getElementById('router').registerComponents({
    "component1": {
        "url": "//components/example1/",
        "assignedRoute": "/one"
    },
    "component2": {
        "url": "//components/example2/",
        "assignedRoute": "/two"
    },
    "admin": {
        "url": "https://localhost:4400/admin-v2/#/",
        "assignedRoute": "/admin"
    }
});
