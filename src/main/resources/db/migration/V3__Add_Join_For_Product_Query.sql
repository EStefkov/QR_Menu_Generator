-- V3__Add_Join_For_Product_Query.sql

-- Add index to menu_id for faster joins
CREATE INDEX idx_menu_id ON products(menu_id);

-- Optionally, add index to restorant_id for optimized queries
CREATE INDEX idx_restorant_id ON menu(restorant_id);
