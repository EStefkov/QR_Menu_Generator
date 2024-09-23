-- Insert menus for (restorant_id = 1)
INSERT INTO menu (category, product_name, restorant_id)
SELECT 'Appetizers', 'Bruschetta', r.id
FROM restorant r
WHERE r.restorant_name = 'The Gourmet Spot';

INSERT INTO menu (category, product_name, restorant_id)
SELECT 'Main Courses', 'Grilled Steak', r.id
FROM restorant r
WHERE r.restorant_name = 'The Gourmet Spot';

INSERT INTO menu (category, product_name, restorant_id)
SELECT 'Desserts', 'Cheesecake', r.id
FROM restorant r
WHERE r.restorant_name = 'The Gourmet Spot';

-- Insert menus for (restorant_id = 2)

INSERT INTO menu (category, product_name, restorant_id)
SELECT 'Seafood Specials', 'Grilled Salmon', r.id
FROM restorant r
WHERE r.restorant_name = 'Ocean Breeze';

INSERT INTO menu (category, product_name, restorant_id)
SELECT 'Salads', 'Caesar Salad', r.id
FROM restorant r
WHERE r.restorant_name = 'Ocean Breeze';

-- Insert menus for (restorant_id = 3)
INSERT INTO menu (category, product_name, restorant_id)
SELECT 'Breakfast', 'Pancakes', r.id
FROM restorant r
WHERE r.restorant_name = 'Urban Delights';

INSERT INTO menu (category, product_name, restorant_id)
SELECT 'Lunch', 'Club Sandwich', r.id
FROM restorant r
WHERE r.restorant_name = 'Urban Delights';

-- Insert menus for (restorant_id = 4)

INSERT INTO menu (category, product_name, restorant_id)
SELECT 'Soups', 'Tomato Soup', r.id
FROM restorant r
WHERE r.restorant_name = 'Downtown Bistro';

INSERT INTO menu (category, product_name, restorant_id)
SELECT 'Entrees', 'Roast Chicken', r.id
FROM restorant r
WHERE r.restorant_name = 'Downtown Bistro';



