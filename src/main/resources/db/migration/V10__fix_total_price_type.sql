-- Change total_price column in orders table from LONG to DOUBLE
ALTER TABLE orders MODIFY COLUMN total_price DECIMAL(10, 2) NOT NULL; 