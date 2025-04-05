ALTER TABLE cart_items
    ADD CONSTRAINT uq_cart_item_product UNIQUE (cart_id, product_id);
