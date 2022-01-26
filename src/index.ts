import {Server, Request, ResponseToolkit} from "@hapi/hapi";

import Vision from "@hapi/vision"
import Pug from "pug";
import {
    addDeviceToGroup,
    addDeviceToGroupFunction, registerGroup,
    registerGroupFunction, removeDeviceFromGroup,
    showGroup,
    showGroups,
    unregisterGroup
} from "./router/group";
import {registerDevice, registerDeviceFunction, showDevice, showDevices, unregisterDevice} from "./router/device";
import {
    addDeviceToMotive, addDeviceToMotiveFunction,
    registerMotive,
    registerMotiveFunction, removeDeviceFromMotive,
    showMotive,
    showMotives,
    unregisterMotive
} from "./router/motive";
import {
    addNoteToDevice,
    addNoteToDeviceFunction,
    addNoteToGroup,
    addNoteToGroupFunction,
    removeNoteFromDevice, removeNoteFromGroup
} from "./router/note";
import {
    changeConfigGroup,
    changeConfigGroupFunction, changeConfigMotive, changeConfigMotiveFunction,
    changeDeviceConfig,
    changeDeviceConfigFunction, getConfig
} from "./router/config";

const init = async () => {

    const server = new Server({
        port: 3000,
        host: '0.0.0.0'
    });

    await server.register(Vision);

    server.views({
        engines: {
            pug: Pug
        },
        relativeTo: __dirname,
        path: '.'
    });

    server.route([
        {
            method: 'GET',
            path: '/',
            handler: (request: Request, h: ResponseToolkit) => {
                return h.view('pug/index');
            }
        },
        {
            method: 'GET',
            path: '/registerGroup',
            handler: registerGroup
        },
        {
            method: 'POST',
            path: '/registerGroup',
            handler: registerGroupFunction
        },
        {
            method: 'GET',
            path: '/group',
            handler: showGroups
        },
        {
            method: 'GET',
            path: '/registerDevice',
            handler: registerDevice
        },
        {
            method: 'POST',
            path: '/registerDevice',
            handler: registerDeviceFunction
        },
        {
            method: 'GET',
            path: '/device',
            handler: showDevices
        },
        {
            method: 'GET',
            path: '/registerMotive',
            handler: registerMotive
        },
        {
            method: 'POST',
            path: '/registerMotive',
            handler: registerMotiveFunction
        },
        {
            method: 'GET',
            path: '/motive',
            handler: showMotives
        },
        {
            method: 'GET',
            path: '/motive/remove/{id}',
            handler: unregisterMotive
        },
        {
            method: 'GET',
            path: '/device/remove/{id}',
            handler: unregisterDevice
        },
        {
            method: 'GET',
            path: '/group/remove/{id}',
            handler: unregisterGroup
        },
        {
            method: 'GET',
            path: '/device/notes',
            handler: addNoteToDevice
        },
        {
            method: 'POST',
            path: '/device/notes',
            handler: addNoteToDeviceFunction
        },
        {
            method: 'GET',
            path: '/group/notes',
            handler: addNoteToGroup
        },
        {
            method: 'POST',
            path: '/group/notes',
            handler: addNoteToGroupFunction
        },
        {
            method: 'GET',
            path: '/device/{id}',
            handler: showDevice
        },
        {
            method: 'GET',
            path: '/group/{id}',
            handler: showGroup
        },
        {
            method: 'GET',
            path: '/motive/{id}',
            handler: showMotive
        },
        {
            method: "GET",
            path: '/device/{id}/removeNotes',
            handler: removeNoteFromDevice
        },
        {
            method: "GET",
            path: '/group/{id}/removeNotes',
            handler: removeNoteFromGroup
        },
        {
            method: "GET",
            path: "/device/group/add",
            handler: addDeviceToGroup
        },
        {
            method: "POST",
            path: "/device/group/add",
            handler: addDeviceToGroupFunction
        },
        {
            method: "GET",
            path: "/device/{id}/group/remove",
            handler: removeDeviceFromGroup
        },
        {
            method: "GET",
            path: "/device/motive/add",
            handler: addDeviceToMotive
        },
        {
            method: "POST",
            path: "/device/motive/add",
            handler: addDeviceToMotiveFunction
        },
        {
            method: "GET",
            path: "/device/{id}/motive/remove",
            handler: removeDeviceFromMotive
        },
        {
            method: "GET",
            path: "/device/config/add",
            handler: changeDeviceConfig
        },
        {
            method: "POST",
            path: "/device/config/add",
            handler: changeDeviceConfigFunction
        },
        {
            method: "GET",
            path: "/group/config/add",
            handler: changeConfigGroup
        },
        {
            method: "POST",
            path: "/group/config/add",
            handler: changeConfigGroupFunction
        },
        {
            method: "GET",
            path: "/motive/config/add",
            handler: changeConfigMotive
        },
        {
            method: "POST",
            path: "/motive/config/add",
            handler: changeConfigMotiveFunction
        },
        {
            method: "POST",
            path: "/api/config",
            handler: getConfig,
        }
    ]);

    await server.start();

    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init().then();