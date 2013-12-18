// Synchronisation implementation
//
// This is the 'naive' algorithm: it makes use of the current REST interface without modification.
// For this app, this is probably the appropriate way to do things, as the app itself lacks features
// like real-time update that would make this a problem.
//
// The main issue with this technique is it will suffer from latency and it creates a limit on the
// database size. Sync is done by retrieving all records and comparing them to the database (which means 
// that it has a practical upper limit of about 2000 or so records given a fast device, much less on
// slower devices)
//
// Latency is a problem when sending updates. Even on 4G data connections, this can easily be a second
// per record, so if there are many updates to send when syncing, this will definitely be a problem.
//
// A further issue is that this technique causes data loss when there is a conflict. If we have a
// modified record we haven't sent yet, the assumption is that we have the latest version of the changes
// and wipe out any other changes that might be present.

var sync = (function(window) {

    var syncObject = {};
    
    // Sends the modified records to the server and marks them as unmodified
    function sendModifiedRecords(server, user, password) {
        syncDataModel.retrieveModified((function(modifiedRecords) {
            for (var modifiedId = 0; modifiedId < modifiedRecords.length; ++modifiedId) {
                var customer = modifiedRecords[modifiedId];
                
                // Send to the server
                // TODO: sending each individual record separately will produce a lot of latency on mobile data connections
                // TODO: it's also really bad for battery life
                // TODO: also, we wind up converting the customer to/from JSON lots of times here when we really don't need to
                ajax(server + '/api/customers/', user, password, 'POST', {
                    contentType: "application/json; charset=utf-8",
                    data: JSON.stringify(customer),
                    success: function (result) {
                    }
                });

                // Assume it worked and mark as unmodified
                // TODO: server might produce an error
                // TODO: server might silently fail
                // TODO: server might not be available
                // TODO: should probably fetch the record back to confirm to finish the update
                // TODO: of course, if the update goes through but we don't get the record back we'll overwrite future updates and cause data loss
                syncDataModel.changeModified(customer.CustomerId, false);
            }
        }));
    }
    
    // Updates the local records from the server, then runs a callback
    function updateRecords(server, user, password, callback) {
        // TODO: just tramples over modified records. We don't really want to do that
        // TODO: assumes no records have been deleted
        ajax(server + '/api/customers/', user, password, 'GET', {
            context: this,
            success: function (data) {
                for (var index = 0; index < data.length; ++index) {
                    syncDataModel.update(data[index], false, null);
                }
                
                if (callback) {
                    callback();
                }
            }
        });
    }

    // Build the final object
    syncObject.sendModifiedRecords  = sendModifiedRecords;
    syncObject.updateRecords        = updateRecords

    return syncObject;
})(window);