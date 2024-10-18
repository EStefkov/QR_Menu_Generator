-- Insert into Account Table
INSERT INTO account (account_name, mail_address, number, password, account_type, created_at, updated_at)
VALUES
    ('admin', 'admin@domain.com', '555-7890', 'admin', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Liam Brooks', 'liam.brooks@domain.com', '555-4321', 'strongPass456', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert into Restorant Table
INSERT INTO restorant (restorant_name, phone_number, account_id, created_at, updated_at)
VALUES
    ('Urban Eats', '555-6789', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Cozy Corner Café', '555-3456', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert into Menu Table
INSERT INTO menu (category, restorant_id, created_at, updated_at)
VALUES
    ('Breakfast', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Beverages', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Lunch Specials', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert into Products Table
INSERT INTO products (product_name, product_price, product_info, menu_id, created_at, updated_at)
VALUES
    ('Avocado Toast', 8.50, 'Smashed avocado on sourdough bread', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Latte', 3.75, 'Creamy espresso with steamed milk', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Grilled Cheese Sandwich', 6.99, 'Melted cheddar on toasted bread', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert into Orders Table
INSERT INTO orders (order_time, order_status, total_price, account_id, restorant_id, created_at, updated_at)
VALUES
    (NOW(), 'FINISHED', 12.25, 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (NOW(), 'ACCEPTED', 6.99, 2, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert into Order_Product Table
INSERT INTO order_product (order_id, product_id, quantity, created_at, updated_at)
VALUES
    (1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),  -- 1 Avocado Toast in Order 1
    (1, 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),  -- 1 Latte in Order 1
    (2, 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);  -- 1 Grilled Cheese Sandwich in Order 2
