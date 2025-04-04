-- Add a unique constraint to prevent duplicate products in cart
ALTER TABLE cart_items
ADD CONSTRAINT uq_cart_item_product UNIQUE (cart_id, product_id); 