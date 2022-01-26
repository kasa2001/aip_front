import {Request, ResponseToolkit} from "@hapi/hapi";
import {ConnectDeviceToMotive} from "../model/ConnectDeviceToMotive";
import {Id} from "../model/Id";
import {RegisterMotiveInterface} from "../model/RegisterMotiveInterface";
import {Client} from "pg"
import {executeQuery, getConnection} from "../global/client";

export async function addDeviceToMotive(request: Request, h: ResponseToolkit) {
    const device = request.query as ConnectDeviceToMotive;

    const client: Client = await getConnection()

    const devices = await executeQuery(client, "select id, mac_id from device");

    const motives = await executeQuery(client, "select id, name from motive");

    client.end();

    return h.view(
        'pug/device/addToMotive',
        {
            devices: devices.rows,
            motives: motives.rows,
            device_id: device.device_id,
            motive_id: device.motive_id
        });
}

export async function addDeviceToMotiveFunction(request: Request, h: ResponseToolkit) {

    const payload: ConnectDeviceToMotive = request.payload as ConnectDeviceToMotive;

    const client: Client = await getConnection()

    await executeQuery(client, "update device set motive_id = " + payload.motive_id + " where id = " + payload.device_id);

    const result = await executeQuery(client, "select m.config_id from device d" +
        " inner join motive m on m.id = d.motive_id" +
        " left join device_device_group dg on dg.device_id = d.id" +
        " left join device_group g on g.id = dg.device_group_id" +
        " where (g.config_id = d.config_id or d.config_id is null) and d.id = " + payload.device_id);

    const count = result.rows.length;

    for(let i = 0; i < count; i++) {
        await executeQuery(client, "update device set config_id = " + result.rows[0][0] + " where id = " + payload.device_id)
    }

    client.end();

    return h.redirect('/');
}

export async function removeDeviceFromMotive(request: Request, h: ResponseToolkit) {
    let payload = request.params as Id;

    const client: Client = await getConnection()

    await executeQuery(client, "update device set motive_id = null where id = " + payload.id);

    client.end()

    return h.redirect('/');
}

export function registerMotive(request: Request, h: ResponseToolkit) {
    return h.view('pug/motive/register');
}

export async function registerMotiveFunction(request: Request, h: ResponseToolkit) {
    let payload = request.payload as RegisterMotiveInterface;

    const client: Client = await getConnection()

    await executeQuery(client, "INSERT INTO motive (name) values ('" + payload.name + "')");

    client.end()

    return h.redirect('/');
}

export async function unregisterMotive(request: Request, h: ResponseToolkit) {
    let payload = request.params as Id;

    const client: Client = await getConnection()

    await executeQuery(client, "update device set motive_id = null where motive_id = " + payload.id)

    await executeQuery(client, "delete from motive where id = " + payload.id);

    client.end()

    return h.redirect('/motive');
}

export async function showMotives(request: Request, h: ResponseToolkit) {
    const client: Client = await getConnection()

    const results = await executeQuery(client, "select id, name from motive");

    return h.view(
        'pug/motive/list',
        {
            devices: results.rows
        }
    );
}

export async function showMotive(request: Request, h: ResponseToolkit) {
    let payload = request.params as Id;

    const client: Client = await getConnection()

    const results = await executeQuery(client, "select id, name, config_id from motive where id = " + payload.id);

    client.end();

    return h.view(
        'pug/motive/details',
        {
            motive: results.rows[0]
        }
    );
}