import {Request, ResponseToolkit} from "@hapi/hapi";
import {Id} from "../model/Id";
import {RegisterGroupInterface} from "../model/RegisterGroupInterface";
import {ConnectDeviceToGroup} from "../model/ConnectDeviceToGroup";
import {Client} from "pg"
import {executeQuery, getConnection} from "../global/client";

export async function removeDeviceFromGroup(request: Request, h: ResponseToolkit) {
    let payload = request.params as Id;

    const client: Client = await getConnection()

    await executeQuery(client, "delete from device_device_group where device_id = " + payload.id);

    client.end()

    return h.redirect('/');
}

export function registerGroup(request: Request, h: ResponseToolkit) {
    return h.view('pug/group/register');
}

export async function registerGroupFunction(request: Request, h: ResponseToolkit) {
    let payload = request.payload as RegisterGroupInterface;

    const client: Client = await getConnection()

    await executeQuery(client, "INSERT INTO device_group (name) values ('" + payload.name + "')");

    client.end()

    return h.redirect('/');
}

export async function unregisterGroup(request: Request, h: ResponseToolkit) {
    let payload = request.params as Id;

    const client: Client = await getConnection()

    await executeQuery(client, "delete from device_device_group where device_group_id = " + payload.id);

    const note = await executeQuery(client, "select note_id from device_group where id = " + payload.id);

    await executeQuery(client, "delete from notes where id = " + note.rows[0][0]);

    await executeQuery(client, "delete from device_group where id = " + payload.id);

    client.end()

    return h.redirect('/group');
}

export async function showGroups(request: Request, h: ResponseToolkit) {
    const client: Client = await getConnection()

    const results = await executeQuery(client, "select id, name from device_group");

    return h.view(
        'pug/group/list',
        {
            devices: results.rows
        }
    );
}

export async function showGroup(request: Request, h: ResponseToolkit) {
    let payload = request.params as Id;

    const client: Client = await getConnection()

    const results = await executeQuery(client, "select g.id, g.name, n.content, g.config_id from device_group g left join notes n on n.id = g.note_id where g.id = " + payload.id);

    client.end();

    return h.view(
        'pug/group/details',
        {
            group: results.rows[0]
        }
    );
}

export async function addDeviceToGroup(request: Request, h: ResponseToolkit) {
    const device = request.query as ConnectDeviceToGroup;

    const client: Client = await getConnection()

    const devices = await executeQuery(client, "select id, mac_id from device");

    const groups = await executeQuery(client, "select id, name from device_group");

    client.end();

    return h.view(
        'pug/device/addToGroup',
        {
            devices: devices.rows,
            groups: groups.rows,
            query: device.device_id
        });
}

export async function addDeviceToGroupFunction(request: Request, h: ResponseToolkit) {
    const payload: ConnectDeviceToGroup = request.payload as ConnectDeviceToGroup;

    const client: Client = await getConnection()

    await executeQuery(client, "insert into device_device_group (device_id, device_group_id) values (" + payload.device_id + ", " + payload.group_id + ")");

    const result = await executeQuery(client, "select g.config_id from device d  inner join device_device_group dg on dg.device_id = d.id inner join device_group g on g.id = dg.device_group_id where d.config_id is null and d.id = " + payload.device_id);

    const count = result.rows.length;

    for(let i = 0; i < count; i++) {
        await executeQuery(client, "update device set config_id = " + result.rows[0][0] + " where id = " + payload.device_id)
    }

    client.end();

    return h.redirect('/');
}