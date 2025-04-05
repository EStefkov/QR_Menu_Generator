-- Insert into Account Table with 'ROLE_' prefixed account_type
INSERT INTO account (account_name, mail_address, number, password, account_type, created_at, updated_at)
VALUES
    ('admin', 'admin@domain.com', '555-7890', 'admin', 'ROLE_ADMIN', GETDATE(), GETDATE()),
    ('Liam Brooks', 'liam.brooks@domain.com', '555-4321', 'strongPass456', 'ROLE_USER', GETDATE(), GETDATE());

-- Insert into Restorant Table
INSERT INTO restorant (restorant_name, phone_number, account_id, created_at, updated_at)
VALUES
    ('Urban Eats', '555-6789', 1, GETDATE(), GETDATE()),
    ('Cozy Corner Café', '555-3456', 2, GETDATE(), GETDATE());

-- Insert into Menu Table with menu_url and qr_code_image
INSERT INTO menu (category, restorant_id, menu_url, qr_code_image, created_at, updated_at)
VALUES
    ('Breakfast', 1, 'http://localhost:8080/api/menus/1', NULL, GETDATE(), GETDATE()),
    ('Beverages', 1, 'http://localhost:8080/api/menus/2', NULL, GETDATE(), GETDATE()),
    ('Lunch Specials', 2, 'http://localhost:8080/api/menus/3', NULL, GETDATE(), GETDATE());

-- Insert into Products Table
INSERT INTO products (product_name, product_price, product_info, menu_id, created_at, updated_at)
VALUES
    ('Avocado Toast', 8.50, 'Smashed avocado on sourdough bread', 1, GETDATE(), GETDATE()),
    ('Latte', 3.75, 'Creamy espresso with steamed milk', 2, GETDATE(), GETDATE()),
    ('Grilled Cheese Sandwich', 6.99, 'Melted cheddar on toasted bread', 3, GETDATE(), GETDATE());

-- Insert into Orders Table
INSERT INTO orders (order_time, order_status, total_price, account_id, restorant_id, created_at, updated_at)
VALUES
    (GETDATE(), 'FINISHED', 12.25, 2, 1, GETDATE(), GETDATE()),
    (GETDATE(), 'ACCEPTED', 6.99, 2, 2, GETDATE(), GETDATE());

-- Insert into Order_Product Table
INSERT INTO order_product (order_id, product_id, quantity, created_at, updated_at)
VALUES
    (1, 1, 1, GETDATE(), GETDATE()),  -- 1 Avocado Toast in Order 1
    (1, 2, 1, GETDATE(), GETDATE()),  -- 1 Latte in Order 1
    (2, 3, 1, GETDATE(), GETDATE());  -- 1 Grilled Cheese Sandwich in Order 2
