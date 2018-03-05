var cdbConfig; // = require('./cdb.config.js');
var DocumentClient = require('documentdb').DocumentClient

var client;

var collectionLink;


//From json-merge package
var isJSON = function(json){

	let jsonC = {}.constructor ;

	if(json && json.constructor === jsonC){
		return true ;
	}else{
		return false ;
	}
} ;

var cloneJSON = function(data){
	return mergeJSON({}, data) ;
} ;

var mergeJSON = function(json1, json2){
	var result = null ;
	if(isJSON(json2)){
		result = {} ;
		if(isJSON(json1)){
			for(var key in json1){
				if(isJSON(json1[key]) || Array.isArray(json1[key])) {
					result[key] = cloneJSON(json1[key]) ;
				} else {
					result[key] = json1[key];
				}
			}
		}

		for(var key in json2){
			if(isJSON(json2[key]) || Array.isArray(json2[key])){
				result[key] = mergeJSON(result[key], json2[key]) ;
			}else{
				result[key] = json2[key] ;
			}
		}
	}else if(Array.isArray(json1) && Array.isArray(json2)){
		result = json1 ;

		for(var i = 0; i < json2.length; i++){
			if(result.indexOf(json2[i]) === -1){
				result[result.length] = json2[i] ;
			}
		}
	}else{
		result = json2 ;
	}

	return result ;
} ;


function initClient(reqCollection, callback){

	if (!client) {

		if (!cdbConfig) throw new Error('Please specify configuration parameters');

		let collection = (!reqCollection) ?  ((!cdbConfig.defaultCollection) ? ()=>{throw new Error('No default collection configured')} : cdbConfig.defaultCollection) : reqCollection;

		if (!cdbConfig.endpoint) throw new Error('No database endpoint configured');
		if (!cdbConfig.primaryKey) throw new Error('No database key configured');
		if (!cdbConfig.database) throw new Error('No database name configured');

		//format for collectionURL https://{databaseaccount}.documents.azure.com/dbs/{db}/colls/{coll}

		collectionLink = `dbs/${cdbConfig.database}/colls/${collection}/`
		

		//console.log("collectionLink: "+collectionLink);

		//let host = ;

		//console.log("host: "+host)

		client = new DocumentClient (cdbConfig.endpoint, {masterKey: cdbConfig.primaryKey})

		callback (null, "Client initialised");
	} else {
		callback (null, "Client exists");
	};
}

function insertDoc(payload, callback){

	//console.log(collectionLink);
	//console.log(payload);

	console.log("Start: "+Date.now())

	client.createDocument(collectionLink, payload, function (err, document) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            console.log('created ' + document.id + ' at ' + Date.now());
            callback(null,document.id);
        }
    });
}

function updateDoc(updatePayload, callback) {

	let docId = updatePayload.id

	let documentURI = collectionLink + 'docs/' + docId 

	client.readDocument(documentURI, (err,result)=>{
		if (err) {
			console.log("Unable to read document")
			callback(err)
		} else {

			let returnPayload = mergeJSON(result, updatePayload);

			client.replaceDocument(documentURI, returnPayload, function (err, document) {
		        if (err) {
		            console.log(err);
		            callback(err);
		        } else {
		            console.log('Updated ' + document.id);
		            callback(null,document.id);
		        }
			})
		}
	})
}


function replaceDoc(payload, callback){

	let docId = payload.id

	let documentURI = collectionLink + 'docs/' + docId 

	client.replaceDocument(documentURI, payload, function (err, document) {
        if (err) {
            console.log(err);
            callback(err);
        } else {
            console.log('Replaced ' + document.id);
            callback(null,document.id);
        }
    });
}

function queryDoc(query, callback){

	client.queryDocuments(collectionLink, query).toArray((err, result)=> {
        if (err) {
            console.log(err);
            callback(err);
        } else {

            callback(null,result);
        }
    });
}

module.exports = {
	setConfig: function (config) {
		if (config) {
			cdbConfig = config;
		} else {
			throw new Error('Config not specified');
		}
	},
	insert: function (collection, payload, callback){
				if (!callback) {
					callback=payload;
					payload=collection;
				}

				if (!payload) {throw new Error('No data to be written')};

				initClient(collection, (err,result)=>
				{
					if (!err) {
						insertDoc(payload, (err,result)=>{
							if (err) {
								callback(err);
							} else {
								callback(null,result)
							}
						})

					} else {
						console.log ("Error Initialising Client: "+err);
						callback(err);
					}		
				})
			},

	insertBulk: function(collection, payload, callback){

					const each = require('async-each');

					if (!payload) {throw new Error('No data to be written')};

					initClient(collection, (err,result)=>
					{
						if (!err) {
							each(payload,insertDoc, (err,result)=>{
								if (err) {
									callback (err)
								} else {
									callback (null, result);
								}
							})
						} else {
							console.log ("Error Initialising Client: "+err);
							callback(err);
						}		
					})
				}, 
	update: function (collection, payload, callback){
				if (!payload) {throw new Error('No data to be written')};

				initClient(collection, (err,result)=>
				{
					if (!err) {

						if (!payload.id) {throw new Error('No documentId specified. Unable to update.')};

						updateDoc(payload,(err,result)=>{
							if (err) {
								callback(err);
							} else {
								callback(null,result)
							}
						})

					} else {
						console.log ("Error Initialising Client: "+err);
						callback(err);
					}		
				})
			},
	replace: function (collection, payload, callback){
				if (!payload) {throw new Error('No data to be written')};

				initClient(collection, (err,result)=>
				{
					if (!err) {

						if (!payload.id) {throw new Error('No documentId specified. Unable to update.')};

						replaceDoc(payload,(err,result)=>{
							if (err) {
								callback(err);
							} else {
								callback(null,result)
							}
						})

					} else {
						console.log ("Error Initialising Client: "+err);
						callback(err);
					}		
				})
			},
	updateBulk:	function (collection, payloadArray, callback){

				if (!payload) {throw new Error('No data to be written')};

				const each = require('async-each');

				initClient(collection, (err,result)=>
				{
					if (!err) {
						each(payloadArray,updateDoc, (err,result)=>{
							if (err) {
								callback (err)
							} else {
								callback (null, result);
							}
						})
					} else {
						console.log ("Error Initialising Client: "+err);
						callback(err);
					}		
				})
			},
	query: function(collection, query, callback){
				if (!query) {throw new Error('No query specified')};

				initClient(collection, (err,result)=>
				{
					if (!err) {
						queryDoc(query, (err,result)=>{
							if (err) {
								callback (err)
							} else {
								callback (null, result);
								console.log("Query Result: ");
								let i=0;
								let len = result.length;
								
								for (i=0;i<len;i++){
									console.log(result[i])
								}
							}
						})
					} else {
						console.log ("Error Initialising Client: "+err)
						callback(err);
					}		
				})
			}
	};