//Endpoints
postman.setEnvironmentVariable("adminPortalServingServiceBaseUrl", "http://localhost:9098/adminBackend");
postman.setEnvironmentVariable("triggerManagementServiceUrl", "localhost:9103/trigger/management/api/v1/triggers");
postman.setEnvironmentVariable("engagementsBU", "http://localhost:9095/engagement/v1");
postman.setEnvironmentVariable("triggerExecutorServiceUrl", "localhost:9101/trigger/executor/api/v1/triggers");
postman.setEnvironmentVariable("adServingServiceBaseUrl", "localhost:9100/ad/v1");
postman.setEnvironmentVariable("appServingServiceBaseUrl", "localhost:9110/app/v1");



// postman.setEnvironmentVariable("campaignManagementServiceBaseUrl", "http://localhost:9096/campaign/v1");
// postman.setEnvironmentVariable("orderManagementServiceBaseUrl", "http://localhost:9094/order/v1");
// postman.setEnvironmentVariable("companyManagementServiceBaseUrl", "http://localhost:9090/company/v1");

postman.setEnvironmentVariable("campaignManagementServiceBaseUrl", "localhost:9098/services/campaign/v1");
postman.setEnvironmentVariable("orderManagementServiceBaseUrl", "localhost:9098/services/order/v1");
postman.setEnvironmentVariable("companyManagementServiceBaseUrl", "localhost:9098/services/company/v1");


pm.environment.set("debug", true);

postman.setEnvironmentVariable("setup", () => {
    
    const moment = require('moment');
    var _ = require('lodash');
    var uuid = require('uuid');

    var initialTenantId = pm.globals.get("tenantId");
    var initialUserEmail = pm.globals.get("userEmail");
    
    pm.environment.set("tenantId", initialTenantId);
    pm.environment.set("userEmail", initialUserEmail);
});
    
postman.setEnvironmentVariable("countObjects", (objectName, tenantId, outputVariableName, compare, expectedChange) => {
        var tenantId = pm.environment.get('tenantId');
        if (expectedChange === null || expectedChange === undefined || ["increased", "decreased", "same"].indexOf(expectedChange) == -1) {
            expectedChange = "same";
        }


        if (!tenantId) {
            tenantId = "dev";
            postman.setEnvironmentVariable("tenantId", tenantId);
        }

        if (objectName === null || objectName === undefined || objectName == "campaign") {
            objectName = "campaign";
            var url = pm.environment.get("campaignManagementServiceBaseUrl");
            var suffix = "/campaigns";
            url_address = url + suffix;
        } else if (objectName == "company") {
            var url = pm.environment.get("companyManagementServiceBaseUrl");
            var suffix = "/companies";
            url_address = url + suffix;
        } else if (objectName == "order") {
            var url = pm.environment.get("orderManagementServiceBaseUrl");
            var suffix = "/insertionOrders";
            url_address = url + suffix;
        } else {
            objectName = "campaign";
            url_address = pm.environment.get("campaignManagementServiceBaseUrl") + "/campaigns";
        }

        toPrint("Determined tenantId is " + tenantId, debug);
        toPrint("Determined url is " + url_address, debug);

        var options = {
            method: 'GET',
            header: pm.environment.get('listHeader'),
            url: url_address
        };
        if (compare == false) {
            pm.sendRequest(options, function (error, response) {
                if (error) throw new Error(error);
                var jsonData = response.json();
                //var nmb_of_objects = (objectName == "campaign") ? jsonData.objects.length : (objectName == "company" || objectName == "order") ? jsonData.length : "";
                var nmb_of_objects = jsonData.pagination.objectCount;
                pm.collectionVariables.set(outputVariableName, nmb_of_objects);
                toPrint(outputVariableName + " " + pm.collectionVariables.get(outputVariableName), true, true);
            });
        } else {
            pm.sendRequest(options, function (error, response) {
                if (error) throw new Error(error);
                var jsonData = response.json();
                //var nmb_of_objects = (objectName == "campaign") ? jsonData.objects.length : (objectName == "company" || objectName == "order") ? jsonData.length : "";
                var nmb_of_objects = jsonData.pagination.objectCount;
                pm.collectionVariables.set(outputVariableName, nmb_of_objects);
                toPrint(outputVariableName + " " + pm.collectionVariables.get(outputVariableName), true, true);
                if (objectName == "campaign") {
                    if (expectedChange == "increased") {
                        pm.test('Campaign got incremented ', function () {
                            pm.expect(pm.collectionVariables.get("CampaignsBefore")).to.eql(pm.collectionVariables.get("CampaignsAfter") - 1);
                        });
                    } else if (expectedChange == "decreased") {
                        pm.test('Campaign got decremented ', function () {
                            pm.expect(pm.collectionVariables.get("CampaignsBefore")).to.eql(pm.collectionVariables.get("CampaignsAfter") + 1);
                        });
                    } else if (expectedChange == "same") {
                        pm.test('Campaign before and after action is the same ', function () {
                            pm.expect(pm.collectionVariables.get("CampaignsBefore")).to.eql(pm.collectionVariables.get("CampaignsAfter"));
                        });
                    } else {
                        toPrint("expectedChange parameter in objectCount got unexpected and equal to " + expectedChange, true, true);
                    }
                } else if (objectName == "company") {
                    if (expectedChange == "increased") {
                        pm.test('Company got incremented ', function () {
                            pm.expect(pm.collectionVariables.get("CompaniesBefore")).to.eql(pm.collectionVariables.get("CompaniesAfter") - 1);
                        });
                    } else if (expectedChange == "decreased") {
                        pm.test('Company got decreased.', function () {
                            pm.expect(pm.collectionVariables.get("CompaniesBefore")).to.eql(pm.collectionVariables.get("CompaniesAfter") + 1);
                        });
                    } else if (expectedChange == "same") {
                        pm.test('Company is the same before and after action. ', function () {
                            pm.expect(pm.collectionVariables.get("CompaniesBefore")).to.eql(pm.collectionVariables.get("CompaniesAfter"));
                        });
                    } else {
                        toPrint("expectedChange parameter in objectCount got unexpected and equal to " + expectedChange, true, true);
                    }
                } else if (objectName == "order") {
                    if (expectedChange == "increased") {
                        pm.test('Order got incremented ', function () {
                            pm.expect(pm.collectionVariables.get("OrdersBefore")).to.eql(pm.collectionVariables.get("OrdersAfter") - 1);
                        });
                    } else if (expectedChange == "decreased") {
                        pm.test('Order got decremented ', function () {
                            pm.expect(pm.collectionVariables.get("OrdersBefore")).to.eql(pm.collectionVariables.get("OrdersAfter") + 1);
                        });
                    } else if (expectedChange == "same") {
                        pm.test('Order has the same number of orders before and after operation. ', function () {
                            pm.expect(pm.collectionVariables.get("OrdersBefore")).to.eql(pm.collectionVariables.get("OrdersAfter"));
                        });
                    } else {
                        toPrint("expectedChange parameter in objectCount got unexpected and equal to " + expectedChange, true, true);
                    }
                } else {
                    toPrint("unexpected objectName variable", true, true);
                }
            });

        }
});

postman.setEnvironmentVariable("toPrint", (logMessage, debug) => {
    if (debug){
        console.log(logMessage);
    }
});

postman.setEnvironmentVariable("sleep", (milisecond) => {
    console.log("Will sleep for " + milisecond/1000 + " seconds");
    const date = Date.now();
    // Sleep an amount of milliseconds given
    while ((date + milisecond) > Date.now());
});

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
            // toPrint("First Ontology Node is " + jsonData[0].node_id + " and length of the array is " + jsonData.length, true, true);
            var ontologyIds = [];
            var ontologyKeywords = [];
            _.each(jsonData, (item) => {
                //console.log("Item is " + item);
                ontologyIds.push(item.node.node_id);
            });
            // console.log("List of ontologyIds is " + ontologyIds);
            var ontologyNodeId =  _.sample(ontologyIds);
            // console.log("Choosen ontologyNodeId " + ontologyNodeId);
            pm.collectionVariables.set("ontologyNodeId", JSON.stringify(ontologyNodeId));


            _.each(jsonData, (item) => {
                if (item.node.node_id == ontologyNodeId) {
                _.each(item.childNodes, (childitem) => {
                    ontologyKeywords.push(childitem.node_name);
                });
                // console.log("Choosen ontologyKeywords " + ontologyKeywords);
                pm.collectionVariables.set("ontologyKeywords", JSON.stringify(ontologyKeywords));
            }
        });
    });
});

postman.setEnvironmentVariable("diff", (obj1, obj2) => {
    const result = {};
    if (Object.is(obj1, obj2)) {
        return undefined;
    }
    if (!obj2 || typeof obj2 !== 'object') {
        return obj2;
    }
    Object.keys(obj1 || {}).concat(Object.keys(obj2 || {})).forEach(key => {
        if (obj2[key] !== obj1[key] && !Object.is(obj1[key], obj2[key])) {
            result[key] = obj2[key];
        }
        if (typeof obj2[key] === 'object' && typeof obj1[key] === 'object') {
            const value = diff(obj1[key], obj2[key]);
            if (value !== undefined) {
                result[key] = value;
            }
        }
    });
    return result;
});

postman.setEnvironmentVariable("timeDiff", (createdTime) => {
    //given time from json
    var parsedTime = moment(createdTime, 'YYYY-MM-DDTHH:mm:ss.SSZ').toDate();
    var correctFormat = moment(parsedTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    var utcCorrectFormat = moment.utc(correctFormat).format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    var createdUnix = moment(utcCorrectFormat).format('x');

    //Current UTC time is calculated below
    var localDate = new Date();
    var timeNowUnix = moment(localDate).format('x');
    var currentTimeUnix = parseInt(moment(localDate).format('x'));
   
    if ((parseInt(timeNowUnix) - parseInt(createdUnix)) < 30000) {
        console.log("time difference is under treshold of 30 seconds");
        return true;
    } else {
        console.log("GIVEN TIME  is: " + utcCorrectFormat);
        console.log("CURRENT TIME is: " + moment.utc(localDate).format('YYYY-MM-DDTHH:mm:ss.SSSZ'));
        toPrint("GivenTimeUnix " + createdUnix, debug);
        toPrint("CurrentTimeUnix " + timeNowUnix, debug);
        
        return false;
    }
});

postman.setEnvironmentVariable("differentValue", (list, value) => {
    toPrint("List to delete value from " + list, debug);
    toPrint("Value to delete from list is  " + value, debug);
    for (var i = list.length; i--;) {
        // console.log(list[i]);
        if (list[i] === value) {
            list.splice(i, 1);
            // toPrint("Remaining list " + list, debug);
        }
    }
    new_value = _.sample(list);
    toPrint("Choosen value " + new_value, debug);
    return new_value;
});

postman.setEnvironmentVariable("defineVariable", (obj1, obj2, obj3) => {
    var list = obj1;
    var variable = _.sample(list);
    if (Array.isArray(variable)) {
        uniqueVariable = Array.from(new Set(variable));
        toPrint((obj3 + "  Is an array and length is " + uniqueVariable.length), debug);
        pm.collectionVariables.set(obj3 + "count", variable.length);
        pm.collectionVariables.set(obj3 + "unique", uniqueVariable);
    }
    // else{
    //     console.log(obj3 + "  Is NOT an array");
    // }
    toPrint((obj2 + JSON.stringify(variable)), debug);
    pm.collectionVariables.set(obj3, JSON.stringify(variable));
});

postman.setEnvironmentVariable("isValidURL", (string) => {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    //console.log("isValidURL returns " + res);
    return (res !== null);
});

postman.setEnvironmentVariable("setInsertionLineItems", (obj) => {
    toPrint("List length is " + obj.length, true, true);
    obj.forEach((item) => { 
        Object.entries(item).forEach(([key, val]) => {
            console.log(`key-${key}-val-${val}`);
            //orderLineItemType = [SCAN, VIDEO, LOOKBOOK, SCAN_MISSION, PURCHASE_VALIDATION, BRANDED_COLLECTION, OTT, PROMO_UNIT, CONSUMER_RESEARCH_SURVEY, CREATIVE_DEVELOPMENT, PUSH_NOTIFICATION_FEE, INSTANT_SURPRISE] 
            if (key == "PROMO_UNIT"){
                    console.log("We have to create a banner OrderLineItem"); 
                    let orderLineItemjson = [{"orderLineItemType": "PROMO_UNIT", "description": "Banner description"}];    
            } else if (key == "SCAN"){
                    console.log("We have to create a banner OrderLineItem");
            }else if (key == "VIDEO"){
                    console.log("We have to create a banner OrderLineItem");
            }else if (key == "LOOKBOOK"){
                    console.log("We have to create a banner OrderLineItem");
            }else if (key == "SCAN_MISSION"){
                    console.log("We have to create a banner OrderLineItem");
            }else if (key == "PURCHASE_VALIDATION"){
                    console.log("We have to create a banner OrderLineItem");
            }else if (key == "BRANDED_COLLECTION"){
                    console.log("We have to create a banner OrderLineItem");
            }else if (key == "OTT"){
                    console.log("We have to create a banner OrderLineItem");
            }else if (key == "CONSUMER_RESEARCH_SURVEY"){
                    console.log("We have to create a banner OrderLineItem");
            }else if (key == "CREATIVE_DEVELOPMENT"){
                    console.log("We have to create a banner OrderLineItem");
            }else if (key == "PUSH_NOTIFICATION_FEE"){
                    console.log("We have to create a banner OrderLineItem");
            }else if (key == "INSTANT_SURPRISE"){
                    console.log("We have to create a banner OrderLineItem");
            }else {
                alert("ALERT:Undefined InsertionLineItem given")
            }
        });
    });
      
        
        // if(obj[key]=="PROMO_UNIT"){
        //     console.log("PROMO_UNIT is provided")
        // }
        // if(obj[value]=="FreePricingModel"){
        //     console.log("PRICING MODEL FreePricing Model is provided");
        // } else if (obj[value] == "FlatFee") {
        //     console.log("PRICING MODEL Flat fee is provided");
        // } else {
        //     console.log("Value contains unexpected input");
        // }   
});