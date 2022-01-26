import {Request, ResponseToolkit} from "@hapi/hapi";
import {RegisterDeviceInterface} from "../model/RegisterDeviceInterface";
import {Id} from "../model/Id";
import {Client} from "pg"
import {executeQuery, getConnection} from "../global/client";

export function registerDevice(request: Request, h: ResponseToolkit) {
    return h.view('pug/device/register');
}

export async function registerDeviceFunction(request: Request, h: ResponseToolkit) {
    let payload = request.payload as RegisterDeviceInterface;

    const client: Client = await getConnection()

    await executeQuery(client, "INSERT INTO device (mac_id) values ('" + payload.mac_id + "')");

    client.end();

    return h.redirect('/');
}

export async function showDevices(request: Request, h: ResponseToolkit) {
    const client: Client = await getConnection()

    const results = await executeQuery(client, "select id, mac_id from device");

    client.end();

    return h.view(
        'pug/device/list',
        {
            devices: results.rows
        }
    );
}

export async function showDevice(request: Request, h: ResponseToolkit) {
    let payload = request.params as Id;

    const client: Client = await getConnection()

    const results = await executeQuery(client, "select d.id, d.mac_id, n.content, g.name, m.name, d.config_id from device d left join notes n on n.id = d.note_id left join motive m on m.id = d.motive_id left join device_device_group dg on dg.device_id = d.id left join device_group g on g.id = dg.device_group_id where d.id = " + payload.id);

    client.end();

    return h.view(
        'pug/device/details',
        {
            device: results.rows[0]
        }
    );
}

export async function unregisterDevice(request: Request, h: ResponseToolkit) {
    let payload = request.params as Id;

    const client: Client = await getConnection()

    const results = await executeQuery(client, "select note_id from device where id = " + payload.id);

    await executeQuery(client, "delete from device_device_group where device_id = " + payload.id);

    await executeQuery(client, "delete from device where id = " + payload.id);

    await executeQuery(client, "delete from notes where id = " + results.rows[0][0]);

    client.end()

    return h.redirect('/device');
}