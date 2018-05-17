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

// Inquirer validate async function that returns product info for a single item id
function validateID(id) {
  currentInputProdID = id
  var sql = `SELECT * FROM products WHERE item_id = ${connection.escape(id)}`
  // Declare function as asynchronous, and save the done callback
  var done = this.async();
  // Do async stuff
  connection.query(sql, function(error, results) {
    if (error) throw error;
    if (results.length === 0) {
      done("Sorry! That item is not in stock! Please select a different item: ")
      return
    }
    done(true);
  });
  // console.trace('Show me');
}

// Inquirer validate async function that returns stock quantity for a single item id
function validateUnits(units) {
  console.log('currentInputProdID: ', currentInputProdID)
  var sql = `SELECT stock_quantity FROM products WHERE item_id = ${currentInputProdID}`
  connection.query(sql, function(error, results) {
    if (error) throw error;
    if (units > results) {
      console.log("\n-------------\n");
      console.log("\nNot enough items in stock!")
      console.log("\n-------------\n");
      console.log("\nPlease enter a different amount: ")
    } else {
      console.log("results:", results)
      console.log("we have enough stock")
      return true
    }
  });
}

function promptUser() {
  inquirer.prompt(
    [{
        type: "input",
        name: "productID",
        message: "Please enter a Product ID: ",
        validate: validateID 
      }, {
        type: "input",
        name: "units",
        message: "Please enter # of units to purchase: ",
        validate: validateUnits
      },
      // After the prompt, store the user's response in a variable called answer.
    ]).then(function(answer) {
    console.log(answer)
    var prodID = answer.productID;
    console.log("prodID: ", prodID)
    var units = answer.units;
    console.log("units: ", units)
    processOrder(prodID, units);
  });
}

function processOrder(product_ID, units) {
  var newStock = results - units
  var query = `UPDATE products SET stock_quantity = ${newStock} WHERE item_id = ${connection.escape(id)}`
  // Making SQL querty to update stock quantity
  connection.query(query, function(error, results) {
    if (error) throw error;
    console.log("results: ", results)
    // Message user
    console.log("\n-------------\n");
    console.log("\nThank you for your purchase! ")
    return true
  });

  // update the SQL database to reflect the remaining quantity. Once the update goes through, show the customer the total cost of their purchase
      
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
  console.log("\nWelcome to Bamazon! It's like Amazon, but better!\n")
  console.log("\nYou can purchase items right from your terminal window.\n")
  console.log("\nOur inventory is instantly updated for you using a MySQL database.\n")
  console.log("\n\nHappy shopping!\n")
  console.log("\n\n************************\n\n")
  displayStock();
}
