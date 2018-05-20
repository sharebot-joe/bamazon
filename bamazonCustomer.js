var mysql = require("mysql");
const cTable = require('console.table');
var inquirer = require("inquirer");
var fs = require("fs");

// Global variables
var productsDisplayed = false;
var currentInputProdID

// MySQL Connection
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  multipleStatements: true,
  user: "root"
});

connection.connect(function(err) {
  if (err) throw err;
  start();
});

// Object containing replacement labels for data column names
var semanticColumns = {
  item_id: "Product ID",
  product_name: "Product Name",
  department_name: "Department",
  price: "Price"
}

// Function which renames all keys in an array object. Takes in a keysMap object e.g. semanticColumns
renameKeys = (keysMap, obj) => Object.keys(obj).reduce((acc, key) => ({ ...acc,
  ...{
    [keysMap[key] || key]: obj[key]
  }
}), {})

// // Inquirer validate async function that returns product info for a single item id
// function validateID(id) {
//   var sql = `SELECT item_id FROM products WHERE item_id = ${connection.escape(id)}`
//   // Declare function as asynchronous, and save the done callback

//   var done = this.async();
//   // Do async stuff
//   connection.query(sql, function(error, results) {
//     if (error) throw error;
//     if (results.length === 0) {
//       done("Sorry! That item is not in stock! Please select a different item: ")
//       return;
//     }
//     console.log(results)
//     done(true)
//   })
//   // connection.end();
// }

// Inquirer validate async function that returns stock quantity for a single item id
// function validateUnits(units) {
//   console.log('currentInputProdID: ', currentInputProdID)
//   var sql = `SELECT stock_quantity FROM products WHERE item_id = ${currentInputProdID}`
//   connection.query(sql, function(error, results) {
//     if (error) throw error;
//     if (units > results) {
//       console.log("\n-------------\n");
//       console.log("\nNot enough items in stock!")
//       console.log("\n-------------\n");
//       console.log("\nPlease enter a different amount: ")
//     } else {
//       console.log("results:", results)
//       console.log("we have enough stock")
//       return true
//     }
//   });


function promptUser() {
  inquirer.prompt(
    [{
        type: "input",
        name: "productID",
        message: "Please enter a Product ID: ",
        // validate: validateID
        validate: function (input) {
          return new Promise((resolve, reject) => {
            var sql = `SELECT item_id FROM products WHERE item_id = ${connection.escape(input)}`
            // Do async stuff
            connection.query(sql, function(error, results) {
              if (error) throw error;
              if (results.length === 0) {
                console.log("\nSorry, that\'s not a valid Product ID. Please enter a different ID: ")
                reject(false)
              } else {
                resolve(true)
              }
            });   
          });
        }
      }, {
        type: "input",
        name: "units",
        message: "Please enter # of units to purchase: ",
        validate: function(input) {
          return !(input < 1)
        },
        validate: function (input, answers) {
          
          return new Promise((resolve, reject) => {

            // console.log("answers.productID", answers.productID)
            var sql = `SELECT * FROM products WHERE item_id = ${connection.escape(answers.productID)}`
            // Do async stuff
            connection.query(sql, function(error, results) {
              if (error) throw error;
              // Parsing currently available stock
              let currentStock = results[0].stock_quantity
              let currentID = results[0].item_id

              // Checking available stock against user input
              if (input > currentStock) {
                console.log("\n-------------");
                console.log("\nNot enough items in stock!")
                console.log("\n-------------");
                console.log("\nPlease enter a different amount: ")
                reject(false)
              } else {
                processOrder(currentID, input)
                resolve(true)
              }
            });   
          })    
        }
      },
      // After the prompt, store the user's response in a variable called answer.
    ]).then(function(answer) {
      return true
  });
}

function processOrder(product_ID, units) {
  let update = `UPDATE products SET stock_quantity = stock_quantity - ${units} WHERE item_id = ${product_ID}`
  // Making SQL query to update stock quantity
  connection.query(update, function(error, results) {
    if (error) throw error;
    // Message user
    return true
  });

  let results = `SELECT * FROM products WHERE item_id = ${product_ID}`
  // Making SQL query to finish transaction 
  connection.query(results, function(error, results) {
    if (error) throw error;
    // Message user
    let total = (units * results[0].price).toFixed(2)
    console.log(`\nYour total is $${total}`)
    console.log("\nThank you for your purchase! Want to keep shopping?")
    console.log("\n-------------\n");
    return true
  });  
  displayStock()
}

function loadSqlSeeds() {
  // Reading in SQL File
  var sql = fs.readFileSync("bamazonSeeds.sql").toString();
  connection.query(sql, function(err, rows) {
    if (err) throw err;
  });
}

function displayStock() {
  connection.query('SELECT item_id, product_name, department_name, price FROM products;', (err, rows) => {
    if (err) throw err;
    // console.log(JSON.stringify(rows))
    var resultArray = Object.values(JSON.parse(JSON.stringify(rows)))
    // This code adds semantic column names to the resultArray and display it to the user with console.table()
    var semanticArray = [];
    for (var i in resultArray) {
      var semanticObject = renameKeys(semanticColumns, resultArray[i]);
      semanticArray[semanticArray.length] = semanticObject;
    }
    console.table(semanticArray);
    promptUser();
  });
}

// Run main program
function start() {
  loadSqlSeeds();
  console.log("\nWelcome to Bamazon! It's like Amazon, but better!")
  console.log("\nYou can purchase items right from your terminal window.")
  console.log("\nOur inventory is instantly updated for you using a MySQL database.")
  console.log("\n\nHappy shopping!")
  console.log("\n\n************************\n")
  displayStock();
}
