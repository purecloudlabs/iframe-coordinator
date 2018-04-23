import './main.css';
import '@webcomponents/custom-elements/src/native-shim.js';
import '@webcomponents/custom-elements/custom-elements.min.js';
import './libs/coordinatorLib.js';

document.getElementById('router').registerComponents({
    "component1": {
        "indexPath": "/components/example1/",
        "assignedRoute": "/one"
    },
    "component2": {
        "indexPath": "/components/example2/",
        "assignedRoute": "/two"
    }
});
