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
setHeader = eval(pm.environment.get("setHeader"));
setHeader();

