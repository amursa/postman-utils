//Endpoints
postman.setEnvironmentVariable("adminPortalServingServiceBaseUrl", "http://localhost:9098/adminBackend");
postman.setEnvironmentVariable("triggerManagementServiceUrl", "localhost:9103/trigger/management/api/v1/triggers");
postman.setEnvironmentVariable("engagementsBU", "http://localhost:9095/engagement/v1");
postman.setEnvironmentVariable("triggerExecutorServiceUrl", "localhost:9101/trigger/executor/api/v1/triggers");
postman.setEnvironmentVariable("adServingServiceBaseUrl", "localhost:9100/ad/v1");
postman.setEnvironmentVariable("appServingServiceBaseUrl", "localhost:9110/app/v1");
postman.setEnvironmentVariable("nodeDefManagementServiceBaseUrl", "localhost:9106/node/v1");
postman.setEnvironmentVariable("campaignManagementServiceBaseUrl", "http://localhost:9096/campaign/v1");
// postman.setEnvironmentVariable("orderManagementServiceBaseUrl", "http://localhost:9094/order/v1");
postman.setEnvironmentVariable("companyManagementServiceBaseUrl", "http://localhost:9090/company/v1");

// postman.setEnvironmentVariable("campaignManagementServiceBaseUrl", "localhost:9098/services/campaign/v1");
postman.setEnvironmentVariable("orderManagementServiceBaseUrl", "localhost:9098/services/order/v1");
// postman.setEnvironmentVariable("companyManagementServiceBaseUrl", "localhost:9098/services/company/v1");


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

postman.setEnvironmentVariable("functions", ()  => {
    //Functions -------------------
    getCampaignTime = eval(pm.environment.get("getCampaignTime"));
    randomInteger = eval(pm.environment.get("randomInteger"));
    findObjectByKey = eval(pm.environment.get("findObjectByKey"));
    diff = eval(pm.environment.get("diff"));
    sleep = eval(pm.environment.get("sleep"));
    timeDiff = eval(pm.environment.get("timeDiff"));
    differentValue = eval(pm.environment.get("differentValue"));
    toPrint = eval(pm.environment.get("toPrint"));
    countObjects = eval(pm.environment.get("countObjects"));
    defineVariable = eval(pm.environment.get("defineVariable"));
    setInsertionLineItems = eval(pm.environment.get("setInsertionLineItems"));
    isValidURL = eval(pm.environment.get("isValidURL"));
    // verifyASSHasGetAdId = eval(pm.environment.get("verifyGetAdId_CMS_ASS"));
    //------------------END functions----------------------
});

//usage getCampaignTime(10, 'm',2, 'h',true);
//Time Key Shortcuts: 
// Key                Shorthand
// years            y
// quarters         Q
// months           M
// weeks            w
// days             d
// hours            h
// minutes          m
// seconds          s
// milliseconds     ms
postman.setEnvironmentVariable("getCampaignTime", (startIncrement, startTimeKey, endIncrement, endTimeKey, showdebug) => {
    const startTime = moment();
    var endTime = moment();
    // endTime = endTime.add(2,'h');
    toPrint("---------------------------------Current time " + startTime.toISOString() + " end Time " + endTime.toISOString(), showdebug);
    pm.collectionVariables.set("startTime", JSON.stringify(startTime.toISOString()));
    pm.collectionVariables.set("endTime", JSON.stringify(endTime.toISOString()));

    var startTimeFuture = startTime.add(startIncrement, startTimeKey);
    var endTimeFuture = endTime.add(endIncrement, endTimeKey);
    toPrint("---------------------------------Future Start time " + startTimeFuture.toISOString(), showdebug);
    toPrint("---------------------------------Future Start time " + endTimeFuture.toISOString(), showdebug);
    pm.collectionVariables.set("startTimeFuture", JSON.stringify(startTimeFuture.toISOString()));
    pm.collectionVariables.set("endTimeFuture",JSON.stringify(endTimeFuture.toISOString()));
});


// Usage: given array , find by key=value the order element and return the value of a certain another key value from the same element of the array.
// tests["Start and End dates are the same"] = findObjectByKey(pm.response.json().constraints, "@type", "DateRangeConstraint", "startTimestamp") 
// === findObjectByKey(pm.response.json().constraints, "@type", "DateRangeConstraint", "endTimestamp");
postman.setEnvironmentVariable("findObjectByKey", (array, key, value, returnkeyvalue) => {
    console.log("Array is " + array);

    for (var i = 0; i < array.length; i++) {
        console.log(array[i][key]);
        console.log("Looking for value " + value);
        if (array[i][key] === value) {
            console.log("Found value " + array[i][returnkeyvalue]);
            return array[i][returnkeyvalue];
        }
    }
    return null;
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
   
    if ((parseInt(timeNowUnix) - parseInt(createdUnix)) < 60000) {
        // console.log("time difference is under treshold of 60 seconds");
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

postman.setEnvironmentVariable("appss_Check", (adId, userId, canUserEngage, userEngaged) => {
    let options2 = {
            url: pm.environment.get("appServingServiceBaseUrl") + "/ads",
            method: 'POST',
            header: [{key: 'X-Tenant-Id', value: pm.environment.get("tenantId")},
                    {key: 'X-Goog-Authenticated-User-Email', value: pm.environment.get("userEmail")},
                    {key: 'content-type', value: 'application/json'},
                    {key: 'X-User-Id', value: userId}],

                body: {
                    mode: 'raw',
                    raw: JSON.stringify({
                        "chainIds": [JSON.parse(pm.environment.get("chainId"))],
                        "locationIds": [JSON.parse(pm.environment.get("location"))],
                        "adIds": [adId]
                    })
                }
            };
            pm.sendRequest(options2, function (error, response) {
                if (error) {
                    console.log(error);
                } else {
                console.log(response.code);
                pm.expect(response).to.have.property('code', 200);
                tests["Number of returned ads is 1"] = pm.response.json().objects.length === 1;
                tests["Scan userEnagged is " + userEngaged] = pm.response.json().objects[0].userEngaged  === userEngaged;
                tests["Scan canUserEngage is " + canUserEngage] = pm.response.json().objects[0].canUserEngage  === canUserEngage;
                }
            });
});

postman.setEnvironmentVariable("randomInteger", (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
});





// postman.setEnvironmentVariable("verifyGetAdId_CMS_ASS", () => {
//     let options = {
//     url: pm.environment.get("adServingServiceBaseUrl") + "/ads/" + pm.collectionVariable.get("lastAdId"),
//     method: 'GET',
//     header: pm.environment.get('listHeader'),
//     };

//     pm.sendRequest(options, function (err, response) {
//         pm.test("Response is 200", function() {
//             pm.response.to.have.status(200);
//         });
//     });
// });
