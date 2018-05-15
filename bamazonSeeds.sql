DROP DATABASE IF EXISTS bamazon;
CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products (
  item_id int NOT NULL AUTO_INCREMENT,
  product_name VARCHAR(45) NULL,
  department_name VARCHAR(45) NULL,
  price Decimal(19,4) NULL,
  stock_quantity INT(11) NULL,
  PRIMARY KEY (item_id)
);

INSERT INTO products
VALUES 
  (null, "mylanta", "health & beauty", "9.99", "10000"),
  (null, "koosh ball", "toys & games", "7.99", "20000"),
  (null, "peechee folder", "school supplies", "2.99", "8000"),
  (null, "pokemon blankie", "home & kitchen", "12.99", "18000"),
  (null, "season 2 of scubs dvd", "entertainment", "12.99", "5000"),
  (null, "brita water filter", "home & kitchen", "24.99", "15000"),
  (null, "foam stress ball", "health & beauty", "7.99", "7000"),
  (null, "iphone 6s acrylic case", "electronics", "15.99", "8500"),
  (null, "generic ibuprofen", "health & beauty", "6.99", "14000"),
  (null, "hanes underwear", "clothing", "13.99", "6500");

