// Creates the variable to hold the db connection
let db;
//  establishes a connection to IndexedDB databse called budget_tracker and sets the version to 1
// indexedDB.open() opens the cnnection to the database. Makes the db "budget_tracker" and sets the default at 1
const request = indexedDB.open('budget_tracker', 1)

// This will trigger if the db version changes (nonexistant to v1, v2, etc.)
request.onupgradeneeded = function (event) {
    // saves a reference too the db
    const db = event.target.result;
    // creates the table (object store) called new_transaction and sets auto incrememnt value for the id
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// upon a successful call
request.onsuccess = function (event) {
    // when the db is succesfully created or a connection is established, saves a reference as a global variable
    db = event.target.result;

    // checks if the app is online and runs uploadTransaction() to send data to the api
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function (event) {
    // error logs here
    console.log(event.target.errorCode)
};

// This will trigger if a new Transaction is created offline
function saveRecord(record) {
    // opens a new transaction with read and write permissions
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    //  access the object store for a new Transaction
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // add record to your store with the add method
    transactionObjectStore.add(record);
};

function uploadTransaction() {
    // open the transaction
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    // access the object store
    const transactionObjectStore = transaction.objectStore('new_transaction');

    // Get all records and sets as a variable
    const getAllStores = transactionObjectStore.getAll();

    // upon successful get getAll request
    getAllStores.onsuccess = function () {
        // if data is stored it will send to the api server
        if (getAllStores.result.length > 0) {
            // Checks all the values and sets them for upload
            getAllStores.result.forEach((record) => {
                fetch('/api/transaction', {
                    method: 'POST',
                    body: JSON.stringify(record),
                    headers: {
                        Accept: 'application/json, text/plain, */*',
                        'Content-Type': 'application/json'
                    },
                })
                    .then(response => {
                        return response.json();
                    })
                    .then(data => {
                        if (data.errors) {
                            console.log(data.errors);
                        } else {

                            // delete the record from the db
                            const transaction = db.transaction(['new_transaction'], 'readwrite');
                            const store = transaction.objectStore('new_transaction');

                            store.clear();

                            alert('Congratulations! Your transaction was successfully added!');
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    })
            });
        }
    };
}

// listen for the network change
window.addEventListener('online', uploadTransaction);