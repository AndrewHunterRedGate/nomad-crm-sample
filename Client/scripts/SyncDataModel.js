// Data model used for synchronisation
//
// Need to support storing/caching the results of AJAX requests in a local database
// We'll use cordova's database layer here

var syncDataModel = (function (window) {

    var dataModelInterface = {};

    // Open the database
    // Is the fixed size going to be a problem?
    var db = window.openDatabase('syncdata', '1.0', 'Sync Data', 1000000);

    // Flag set once the database is ready
    var dbReady = false;
    
    // Callback once the database is ready
    var onReady = function () { };

    // Creates the data storage layer
    function createDatabase(tx) {
        console.log('Creating new sync database');

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
            null,
            function(tx2, result) {
                 if (result.rows.length == 0) {
                     createDatabase(tx2);
                 } else {
                     console.log('Sync database already exists');
                 }
            });
    }
    
    // Relays DB creation failures to the user
    function creationFailed(err) {
        alert('Could not create database: ' + err.message);
        console.log(err);
    }
    
    // Database has been created and is now available
    function creationSucceeded() {
        dbReady = true;

        var finishOnReady = onReady;
        onReady = function () { };
        finishOnReady();
    }
    
    // Updates a customer in the data model
    function updateCustomer(customer, modified, callback) {
        if (!dbReady) {
            // Wait for DB if not ready yet
            var oldOnReady = onReady;

            onReady = function () {
                // Chain calls
                oldOnReady();

                // Restart this operation
                updateCustomer(customer, modified, callback);
            };

            // Stop
            return;
        }
        
        // Serialise the customer
        var customerJson = JSON.stringify(customer);
        
        // Change the 'modified' value to 0 or 1 for database storage
        if (modified) {
            modified = 1;
        } else {
            modified = 0;
        }

        // Try to update the customer
        db.transaction(function(tx) {
            tx.executeSql("INSERT OR REPLACE INTO customers (?, ?, ?)", [customer.CustomerId, customerJson, modified], function() {
                if (callback) {
                    callback();
                }
            });
        });
    }
    
    // Retrieves a customer in the data model and provides the data to a callback
    function retrieveCustomer(customerId, callback) {
        if (!dbReady) {
            // Wait for DB if not ready yet
            var oldOnReady = onReady;

            onReady = function () {
                // Chain calls
                oldOnReady();

                // Restart this operation
                retrieveCustomer(customerId, callback);
            };

            // Stop
            return;
        }
        
        // Try to retrieve the customer
        db.transaction(function(tx) {
            tx.executeSql("SELECT customer_json FROM customers WHERE customerId = ?", [customerId],
                function(tx2, result) {
                    if (result.rows.length <= 0) {
                        // null result if the customer doesn't exist
                        if (callback) {
                            callback(null);
                        }
                    } else {
                        // Found the customer
                        var customerRow     = result.rows.item(0);
                        var customerJson    = customerRow.customer_json;
                        
                        if (callback) {
                            callback(JSON.parse(customerJson));
                        }
                    }
                });
        });
    }

    // Turns a list of customers into an array and sends the array to a callback
    function formatCustomerList(dbResult, callback) {
        if (!callback) {
            return;
        }

        var numRows         = dbResult.rows.length;
        var customerList    = [];
        
        for (var rowId = 0; rowId < numRows; ++rowId) {
            var rowJson = dbResult.rows.item(0).customer_json;
            var rowData = JSON.parse(rowJson);
            customerList.push(rowData);
        }

        callback(customerList);
    }
    
    // Retrieves the entire list of customers in the data model and provides the data to a callback
    function retrieveCustomerList(callback) {
        db.transaction(function(tx) {
            tx.executeSql("SELECT customer_json FROM customers", [],
                function(tx2, result) {
                    formatCustomerList(result, callback);
                });
        });
    }
    
    // Retrieves the list of modified customers
    function retrieveModifiedCustomers(callback) {
        db.transaction(function (tx) {
            tx.executeSql("SELECT customer_json FROM customers WHERE modified <> 0", [],
                function (tx2, result) {
                    formatCustomerList(result, callback);
                });
        });
    }
    
    // Changes the modification flag for the specified customer ID 
    function changeModified(customerId, modified) {
        if (modified) {
            modified = 1;
        } else {
            modified = 0;
        }

        db.transaction(function(tx) {
            tx.executeSql("UPDATE customers SET modified = ? WHERE customer_id = ?", [modified, customerId]);
        });
    }

    db.transaction(createDatabaseIfNeeded, creationFailed, creationSucceeded);

    // Create the external interface
    dataModelInterface.retrieve         = retrieveCustomer;
    dataModelInterface.update           = updateCustomer;
    dataModelInterface.retrieveAll      = retrieveCustomerList;
    dataModelInterface.retrieveModified = retrieveModifiedCustomers;
    dataModelInterface.changeModified   = changeModified;

    return dataModelInterface;

})(window);
