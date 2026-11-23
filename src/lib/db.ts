import { MongoClient, ServerApiVersion, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoClient: MongoClient | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClient = client;
    global._mongoClientPromise = client.connect();
  } else {
    client = global._mongoClient!;
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export const DB_NAME = 'digital_banking';

export async function getDatabase(dbName: string = DB_NAME): Promise<Db> {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

export { client, clientPromise };
export default client;
