import {Request, ResponseToolkit} from "@hapi/hapi";
import {ConnectDeviceWithConfig} from "../model/ConnectDeviceWithConfig";
import {MacAddress} from "../model/MacAddress";
import {Client} from "pg"
import {executeQuery, getConnection} from "../global/client";

export async function changeConfigMotive(request: Request, h: ResponseToolkit) {
    const device = request.query as ConnectDeviceWithConfig;

    const client: Client = await getConnection()

    const groups = await executeQuery(client, "select id, name from motive");

    return h.view(
        'pug/config/addConfigForMotive',
        {
            query: device.device_id,
            devices: groups.rows
        }
    );
}

export async function changeConfigMotiveFunction(request: Request, h: ResponseToolkit) {
    const device = request.payload as ConnectDeviceWithConfig;

    const client: Client = await getConnection()

    let configId = await executeQuery(client, "insert into config (params) values ($$" + device.config +"$$) returning id");

    const result = await executeQuery(client, "select d.id" +
        " from device d" +
        " inner join motive m on m.id = d.motive_id" +
        " left join device_device_group dg on dg.device_id = d.id" +
        " left join device_group g on g.id = dg.device_group_id " +
        " where d.motive_id = " + device.device_id + "  and (g.config_id = d.config_id or d.config_id is null or d.config_id = m.config_id)")

    await executeQuery(client, "update motive set config_id = " + configId.rows[0][0] + " where id = " + device.device_id);

    const count = result.rows.length;

    for(let i = 0; i < count; i++) {
        await executeQuery(client, "update device set config_id = " + configId.rows[0][0] + " where id = " + result.rows[i][0])
    }

    client.end();

    return h.redirect('/');
}

export async function getConfig(request: Request) {
    let payload = request.payload as MacAddress

    const client: Client = await getConnection()

    let configJson = await executeQuery(client, "select c.params from config c inner join device d on d.config_id = c.id where mac_id = $$" + payload.mac_address + "$$");

    return configJson.rows[0][0];
}

export async function changeConfigGroup(request: Request, h: ResponseToolkit) {
    const device = request.query as ConnectDeviceWithConfig;

    const client: Client = await getConnection()

    const groups = await executeQuery(client, "select id, name from device_group");

    return h.view(
        'pug/config/addConfigForGroup',
        {
            query: device.device_id,
            groups: groups.rows
        }
    );
}

export async function changeConfigGroupFunction(request: Request, h: ResponseToolkit) {
    const device = request.payload as ConnectDeviceWithConfig;

    const client: Client = await getConnection()

    let configId = await executeQuery(client, "insert into config (params) values ($$" + device.config +"$$) returning id");

    const result = await executeQuery(client, "select d.id" +
        " from device d" +
        " inner join device_device_group dg on dg.device_id = d.id" +
        " inner join device_group g on g.id = dg.device_group_id " +
        " where (g.config_id = d.config_id or d.config_id is null) and g.id = " + device.device_id)

    await executeQuery(client, "update device_group set config_id = " + configId.rows[0][0] + " where id = " + device.device_id);

    const count = result.rows.length;

    for(let i = 0; i < count; i++) {
        await executeQuery(client, "update device set config_id = " + configId.rows[0][0] + " where id = " + result.rows[i][0])
    }

    return h.redirect('/');
}

export async function changeDeviceConfig(request: Request, h: ResponseToolkit) {
    const device = request.query as ConnectDeviceWithConfig;

    const client: Client = await getConnection()

    const devices = await executeQuery(client, "select id, mac_id from device");

    return h.view(
        'pug/config/addConfigForDevice',
        {
            query: device.device_id,
            devices: devices.rows
        }
    );
}

export async function changeDeviceConfigFunction(request: Request, h: ResponseToolkit) {
    const device = request.payload as ConnectDeviceWithConfig;

    const client: Client = await getConnection()

    let configId = await executeQuery(client, "insert into config (params) values ($$" + device.config +"$$) returning id");

    await executeQuery(client, "update device set config_id = " + configId.rows[0][0] + " where id = " + device.device_id);

    return h.redirect('/');
}