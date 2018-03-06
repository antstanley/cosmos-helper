# cosmos-helper
Simple helper library for ComosDB

**Methods**

*setConfig*

```
.setConfig (config)
```
Sets client configuration data. Expected schema. Must be invoked before any other methods.

```
{
endpoint: "https://<CosmosDB-Account-Name>.documents.azure.com:443/,
primaryKey: "<key used to authenticate with CosmosDB>",
database: "<database name>",
collection: "<default collection name>"
}
```

*insert*

```
.insert(collection, payload, callback)
```

Insert single document into CosmosDB.

- collection - CosmosDB Collection name
- payload - JSON object to be written to CosmosDB as a document
- callback - accepts two arguments `(err,result)`, successful insert will respond with `(null,documentID)`

*insertBulk*

```
.insertBulk(collection, payloadArray, callback)
```

Insert multiple documents into CosmosDB.

- collection - CosmosDB Collection name
- payloadArray - Array of JSON objects to be written to CosmosDB as a multiple documents
- callback - accepts two arguments `(err,result)`, successful insert will respond with `(null,[array of documentID's])`

*update*

```
.update(collection, payload, callback)
```

Update single document in CosmosDB.

- collection - CosmosDB Collection name
- payload - JSON object to update existing document in CosmosDB. Must included `payload.id` to identify the document to be updated.
- callback - accepts two arguments `(err,result)`, successful insert will respond with `(null,documentID)`

*updateBulk*

```
.updateBulk(collection, payloadArray, callback)
```

Update single document in CosmosDB.

- collection - CosmosDB Collection name
- payload - Array of JSON objects to update existing documents in CosmosDB. Each item in the array must include a `id` property to identify the document to be updated.
- callback - accepts two arguments `(err,result)`, successful insert will respond with `(null,[array of documentID's])`

*replace*

```
.replace(collection, payload, callback)
```

Replace single document in CosmosDB.

- collection - CosmosDB Collection name
- payload - JSON object to replace existing document in CosmosDB. Must included `payload.id` to identify the document to be replaced.
- callback - accepts two arguments `(err,result)`, successful insert will respond with `(null,documentID)`

*query*

```
.query(collection, query, callback)
```

Query a collection within a CosmosDB database. 

- collection - CosmosDB Collection name
- query - JSON object conforming to the CosmosDB [SqlQuerySpec](https://azure.github.io/azure-documentdb-node/global.html#SqlQuerySpec). 

Sample schema

```
{
	query: 'SELECT * FROM root WHERE id=@id',
	parameters: [{name: '@id', value: '<query variable>'}]
}
```

- callback - accepts two arguments `(err,result)`, successful insert will respond with `(null,[Array of results that match the query])`