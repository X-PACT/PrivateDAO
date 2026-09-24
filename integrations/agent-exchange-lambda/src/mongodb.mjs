let clientPromise;

export function mongoProviderStatus(config) {
  return {
    provider: "mongodb",
    status: config.mongoUri ? "configured" : "not_configured",
    role: "evidence-history-and-search",
    database: config.mongoDatabase,
    collection: config.mongoCollection,
    credentials_exposed: false,
  };
}

async function clientFor(config) {
  if (!config.mongoUri) return null;
  if (!clientPromise) {
    const { MongoClient } = await import("mongodb");
    clientPromise = MongoClient.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
      maxPoolSize: 5,
      minPoolSize: 0,
    }).catch((error) => {
      clientPromise = undefined;
      throw error;
    });
  }
  return clientPromise;
}

export async function persistEvidence(config, document) {
  if (!config.mongoUri)
    return { provider: "mongodb", status: "not_configured", persisted: false };
  try {
    const client = await clientFor(config);
    const collection = client.db(config.mongoDatabase).collection(config.mongoCollection);
    await collection.createIndex({ job_id: 1 }, { unique: true, name: "job_id_unique" });
    await collection.createIndex({ service: 1, completed_at: -1 }, { name: "service_completed_at" });
    await collection.updateOne(
      { job_id: document.job_id },
      { $set: { ...document, provider: "mongodb", updated_at: new Date().toISOString() } },
      { upsert: true },
    );
    return { provider: "mongodb", status: "persisted", persisted: true };
  } catch (error) {
    console.warn("mongodb_evidence_persistence_unavailable", {
      name: error?.name || "Error",
      code: error?.code || null,
      cause_code: error?.cause?.code || null,
      topology_type: error?.reason?.type || null,
      server_count: error?.reason?.servers ? Object.keys(error.reason.servers).length : null,
    });
    return {
      provider: "mongodb",
      status: "unavailable",
      persisted: false,
      reason: error?.name || "MongoDBError",
    };
  }
}
