var mysql = require("mysql");
const cTable = require('console.table');
var inquirer = require("inquirer");
var fs = require("fs");

// Global variables
var productsDisplayed = false;

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  multipleStatements: true,
  // Your username
  user: "root"
});

connection.connect(function(err) {
  if (err) throw err;
  start();
});

var semanticColumns = {
  item_id: "Product ID",
  product_name: "Product Name",
  department_name: "Department",
  price: "Price"
}

function start() {
  loadSqlSeeds();
  displayStock();
}

renameKeys = (keysMap, obj) => Object
  .keys(obj)
  .reduce((acc, key) => ({
      ...acc,
      ...{ [keysMap[key] || key]: obj[key] }
  }), {})

function promptUser() {
  inquirer.prompt([
  {
    type: "input",
    name: "productID",
    message: "Please enter a Product ID: ",
    validate: function validateProductID(input) {
      var sql = 'SELECT * FROM products WHERE item_id = ' + connection.escape(input);
      connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        console.log("results: ", results)
        if (results.length === 0 ) {
          console.log("Sorry! That item is not in stock!")
          return false
        }
        // console.log("fields: ", fields)
      });
    }
  },
  {
    when: function (response) {
      return response.productID;
    },
    type: "input",
    name: "units",
    message: "Please enter # of units to purchase: ",
    validate: function validateUnits(input) {
      var sql = 'SELECT stock_quantity FROM products WHERE item_id = ' + connection.escape(response.productID);
      connection.query(sql, function (error, results, fields) {
        if (error) throw error;
        console.log("results: ", results)
        if (input > results ) {
           console.log("\n-------------\n");
          console.log("\nNot enough items in stock!")
          console.log("\n-------------\n");
          console.log("\nPlease enter a different amount: ")
          return false
        } else {
          var query = ""
        }
      });
    }
  },

  // After the prompt, store the user's response in a variable called answer.
  ]).then(function(answer) {

    var prodID = answer.productID;
    var units = answer.units;

    placeOrder(prodID, units);
  });
}

function placeOrder(product_ID, units) {
  var itemStock = connection.query("SELECT stock_quantity FROM products WHERE item_id = ? ", product_id, function(err) {
    if (err) throw err;
    console.log("stock: ", itemStock);
    }
  )
  if (itemStock < units) {
    console.log("Sorry!")
  } else {
    processOrder()
  }
}
function loadSqlSeeds() {
  // Reading in SQL File
  var sql = fs.readFileSync("bamazonSeeds.sql").toString();
  connection.query(sql, function(err, rows) {
    if (err) throw err;
    console.log("loading bamazonSeeds.sql...")
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
