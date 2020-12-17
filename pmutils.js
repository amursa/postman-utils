//Functions
postman.setEnvironmentVariable("setHeader", () => {
    pm.request.headers.add({
        key: 'X-Tenant-Id',
        value: pm.environment.get('tenantId')
    });
    pm.request.headers.add({
        key: 'X-Goog-Authenticated-User-Email',
        value: pm.environment.get('userEmail')
    });
    pm.request.headers.add({
        key: 'content-type',
        value: 'application/json'
    });
    var sdk = require('postman-collection');
    var listHeader = [
        new sdk.Header({
            key: 'X-Tenant-Id',
            value: pm.environment.get("tenantId")
        }),
        new sdk.Header({
            key: 'X-Goog-Authenticated-User-Email',
            value: pm.environment.get("userEmail")
        }),
        new sdk.Header({
            key: 'content-type',
            value: 'application/json'
        })
    ]
    pm.environment.set('listHeader', listHeader);
});




postman.setEnvironmentVariable("setOntologyParams", () => {
    let options = {
    url: pm.environment.get("adminPortalServingServiceBaseUrl") + "/legacy/v1/ontology/taxonomyNodes",
    method: 'GET',
    header: pm.environment.get('listHeader'),
    };

    pm.sendRequest(options, function (err, response) {
        var jsonData = response.json();
            // toPrint("First Ontology Node is " + jsonData[0].node_id + " and length of the array is " + jsonData.length, debug, true);
            var ontologyIds = [];
            var ontologyKeywords = [];
            _.each(jsonData, (item) => {
                //console.log("Item is " + item);
                ontologyIds.push(item.node.node_id);
            });
            toPrint("List of ontologyIds is " + ontologyIds, debug, true);
            var ontologyNodeId =  _.sample(ontologyIds);
            toPrint("Choosen ontologyNodeId " + ontologyNodeId, true, true);
            pm.collectionVariables.set("ontologyNodeId", JSON.stringify(ontologyNodeId));


            _.each(jsonData, (item) => {
                if (item.node.node_id == ontologyNodeId) {
                _.each(item.childNodes, (childitem) => {
                    ontologyKeywords.push(childitem.node_name);
                });
                toPrint("Choosen ontologyKeywords " + ontologyKeywords, true, true);
                pm.collectionVariables.set("ontologyKeywords", JSON.stringify(ontologyKeywords));
            }
        });
    });
});



postman.setEnvironmentVariable("setup", () => {
    //modules
    const moment = require('moment');
    var _ = require('lodash');
    var uuid = require('uuid');

    var initialTenantId = pm.globals.get("tenantId");
    var initialUserEmail = pm.globals.get("userEmail");
    // pm.globals.clear();
    pm.environment.clear();
    pm.collectionVariables.clear();
    pm.environment.set("tenantId", initialTenantId);
    pm.environment.set("userEmail", initialUserEmail);

    if (!pm.environment.get("debug")) {
        pm.environment.set("debug", false);
    }
    var debug = pm.environment.get("debug");


    
    //Endpoints
    postman.setEnvironmentVariable("campaignManagementServiceBaseUrl", "http://localhost:9096/campaign/v1");
    postman.setEnvironmentVariable("adminPortalServingServiceBaseUrl", "http://localhost:9098/adminBackend");
    postman.setEnvironmentVariable("orderManagementServiceBaseUrl", "http://localhost:9094/order/v1");
    postman.setEnvironmentVariable("companyManagementServiceBaseUrl", "http://localhost:9090/company/v1");
    postman.setEnvironmentVariable("triggerManagementServiceUrl", "localhost:9103/trigger/management/api/v1/triggers");
    postman.setEnvironmentVariable("engagementsBU", "http://localhost:9095/engagement/v1");
    postman.setEnvironmentVariable("triggerExecutorServiceUrl", "localhost:9101/trigger/executor/api/v1/triggers");
    postman.setEnvironmentVariable("adServingServiceBaseUrl", "localhost:9100/ad/v1");
});



postman.setEnvironmentVariable("toPrint", (logMessage, debug, localDebug) => {
    if (debug && localDebug) {
        console.log(logMessage);
    }
});
