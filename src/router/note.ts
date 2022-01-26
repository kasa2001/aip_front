import {Request, ResponseToolkit} from "@hapi/hapi";
import {NoteAdded} from "../model/NoteAdded";
import {Id} from "../model/Id";
import {Client} from "pg"
import {executeQuery, getConnection} from "../global/client";

export async function addNoteToGroup(request: Request, h: ResponseToolkit) {
    const group = request.query as NoteAdded;

    const client: Client = await getConnection()

    const results = await executeQuery(client, "select id, name from device_group");

    client.end();

    return h.view(
        'pug/notes/groupForm',
        {
            groups: results.rows,
            query: group.second_id
        });
}

export async function addNoteToGroupFunction(request: Request, h: ResponseToolkit) {
    const payload: NoteAdded = request.payload as NoteAdded;

    const client: Client = await getConnection()

    const results = await executeQuery(client, "insert into notes (content) values('" + payload.content + "') RETURNING id");

    await executeQuery(client, "update device_group set note_id = " + results.rows[0][0] + " where id = " + payload.second_id);

    client.end()

    return h.redirect("/");
}

export async function removeNoteFromGroup(request: Request, h: ResponseToolkit) {
    const payload: Id = request.params as Id;

    const client: Client = await getConnection()

    const results = await executeQuery(client, "select note_id from device_group where id = " + payload.id);

    await executeQuery(client, "update device_group set note_id = null where note_id = " + results.rows[0][0]);

    await executeQuery(client, "delete from notes where id = " + results.rows[0][0]);

    client.end();

    return h.redirect("/");
}

export async function addNoteToDevice(request: Request, h: ResponseToolkit) {
    const device = request.query as NoteAdded;

    const client: Client = await getConnection()

    const results = await executeQuery(client, "select id, mac_id from device");

    client.end();

    return h.view(
        'pug/notes/deviceForm',
        {
            devices: results.rows,
            query: device.second_id
        });
}

export async function addNoteToDeviceFunction(request: Request, h: ResponseToolkit) {
    const payload: NoteAdded = request.payload as NoteAdded;

    const client: Client = await getConnection()

    const results = await executeQuery(client, "insert into notes (content) values('" + payload.content + "') RETURNING id");

    await executeQuery(client, "update device set note_id = " + results.rows[0][0] + " where id = " + payload.second_id);

    client.end();

    return h.redirect("/");
}

export async function removeNoteFromDevice(request: Request, h: ResponseToolkit) {
    const payload: Id = request.params as Id;

    const client: Client = await getConnection()

    const results = await executeQuery(client, "select note_id from device where id = " + payload.id);

    await executeQuery(client, "update device set note_id = null where note_id = " + results.rows[0][0]);

    await executeQuery(client, "delete from notes where id = " + results.rows[0][0]);

    client.end()

    return h.redirect("/");
}