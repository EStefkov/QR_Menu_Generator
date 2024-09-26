-- Insert sample data into orders table
INSERT INTO orders (order_time, order_status, total_price, account_id, restorant_id)
VALUES
    ('2024-09-24 12:30:00', 'FINISHED', 5000, 1, 1),  -- Order 1
    ('2024-09-24 13:45:00', 'ACCEPTED', 2500, 2, 1),  -- Order 2
    ('2024-09-24 14:10:00', 'FINISHED', 1500, 1, 2);  -- Order 3