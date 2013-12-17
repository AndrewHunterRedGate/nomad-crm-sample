// Data model used for synchronisation
//
// Need to support storing/caching the results of AJAX requests in a local database
// We'll use cordova's database layer here

var syncDataModel = (function (window) {

    var result = {};

    // Open the database
    // Is the fixed size going to be a problem?
    var db = window.openDatabase('syncdata', '1.0', 'Sync Data', 1000000);

    // Creates the data storage layer
    function createDatabase(tx) {
        tx.executeSql("CREATE TABLE customers " +
            "( customer_id INT primary key" +
            ", customer_json TEXT " +
            ", modified INT" +
            ")");
        
        // Possible enhancement: add vector names to the table (probably enhancement)
        // We're using a simple 'is modified' flag
    }
    
    // Creates the database if it doesn't already exist
    function createDatabaseIfNeeded(tx) {
        // Create the database if the customers row does not exist
        tx.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name='customers'", 
            function(tx2, result) {
                 if (result.rows.length == 0) {
                     createDatabase(tx2);
                 }
            });
    }
    
    // Relays DB creation failures to the user
    function creationFailed(err) {
        alert('Could not create database: ' + err.code);
        console.log(err);
    }
    
    // Database has been created and is now available
    function creationSucceeded() {
        alert('ok db');
    }

    db.transaction(createDatabaseIfNeeded, creationFailed, creationSucceeded);
    console.log('hello');

    // Create the external interface
    return result;

})(window);