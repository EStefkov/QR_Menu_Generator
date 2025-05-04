-- Expand the order_status ENUM to include all necessary values
ALTER TABLE orders MODIFY COLUMN order_status ENUM('PENDING', 'CANCELLED', 'FINISHED', 'ACCEPTED','READY') NOT NULL DEFAULT 'PENDING';

-- Update any null values in the order_status column to the default value
UPDATE orders SET order_status = 'PENDING' WHERE order_status IS NULL; 