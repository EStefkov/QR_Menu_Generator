INSERT INTO restorant (restorant_name, phone_number, account_id)
SELECT 'The Gourmet Spot', '+1234567890', a.id
FROM account a
WHERE a.id = 1 AND a.account_type = 'ADMIN';

INSERT INTO restorant (restorant_name, phone_number, account_id)
SELECT 'Urban Eatery', '+0987654321', a.id
FROM account a
WHERE a.id = 2 AND a.account_type = 'ADMIN';

INSERT INTO restorant (restorant_name, phone_number, account_id)
SELECT 'Mountain Diner', '+1122334455', a.id
FROM account a
WHERE a.id = 3 AND a.account_type = 'ADMIN';

INSERT INTO restorant (restorant_name, phone_number, account_id)
SELECT 'Ocean Breeze', '+1234005678', a.id
FROM account a
WHERE a.id = 1 AND a.account_type = 'ADMIN';

INSERT INTO restorant (restorant_name, phone_number, account_id)
SELECT 'Urban Delights', '+1234987654', a.id
FROM account a
WHERE a.id = 1 AND a.account_type = 'ADMIN';

INSERT INTO restorant (restorant_name, phone_number, account_id)
SELECT 'Downtown Bistro', '+1234321098', a.id
FROM account a
WHERE a.id = 1 AND a.account_type = 'ADMIN';

