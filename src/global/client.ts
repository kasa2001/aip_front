import {Client} from "pg"

export async function getConnection(): Client {
    const client: Client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'ssh',
        password: 'admin',
        port: 5432,
    });

    await client.connect();

    return client;
}

export async function executeQuery(client: Client, query: string) {
    return await client.query({
        rowMode: 'array',
        text: query,
    })
}