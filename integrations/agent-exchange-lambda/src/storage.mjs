import { randomUUID } from "node:crypto";

export class MemoryStore {
  constructor() { this.maps = new Map(); }
  map(name) { if (!this.maps.has(name)) this.maps.set(name, new Map()); return this.maps.get(name); }
  async put(collection, key, value, condition = false) {
    const map = this.map(collection);
    if (condition && map.has(key)) throw new Error("conditional write failed");
    map.set(key, structuredClone(value)); return value;
  }
  async get(collection, key) { const value = this.map(collection).get(key); return value ? structuredClone(value) : null; }
  async list(collection) { return [...this.map(collection).values()].map((v) => structuredClone(v)); }
  async update(collection, key, fn) { const current = await this.get(collection, key); const next = await fn(current); return this.put(collection, key, next); }
}

export async function createStore(config) {
  if (config.allowTestStorage || config.tablePrefix === "memory") return new MemoryStore();
  try {
    const [{ DynamoDBClient }, { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, UpdateCommand }] = await Promise.all([
      import("@aws-sdk/client-dynamodb"), import("@aws-sdk/lib-dynamodb")
    ]);
    const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: config.region }));
    const table = (suffix) => config.tables?.[suffix] || `${config.tablePrefix}-${suffix}`;
    return {
      async put(collection, key, value, condition = false) {
        await client.send(new PutCommand({ TableName: table(collection), Item: { id: key, ...value }, ...(condition ? { ConditionExpression: "attribute_not_exists(id)" } : {}) }));
        return value;
      },
      async get(collection, key) {
        const result = await client.send(new GetCommand({ TableName: table(collection), Key: { id: key }, ConsistentRead: true }));
        if (!result.Item) return null; return result.Item;
      },
      async list(collection) {
        const result = await client.send(new ScanCommand({ TableName: table(collection), Limit: 100 }));
        return result.Items || [];
      },
      async update(collection, key, fn) {
        const current = await this.get(collection, key); const next = await fn(current);
        await client.send(new UpdateCommand({ TableName: table(collection), Key: { id: key }, UpdateExpression: "SET #v = :v", ExpressionAttributeNames: { "#v": "value" }, ExpressionAttributeValues: { ":v": next } }));
        return next;
      }
    };
  } catch (error) {
    if (process.env.NODE_ENV === "test") return new MemoryStore();
    throw new Error(`DynamoDB storage unavailable: ${error.message}`);
  }
}

export const newId = (prefix) => `${prefix}_${randomUUID()}`;
