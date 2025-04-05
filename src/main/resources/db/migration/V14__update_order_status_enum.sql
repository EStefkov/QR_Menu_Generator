-- 1) Обновяваме NULL стойности
UPDATE orders SET order_status = 'PENDING' WHERE order_status IS NULL;

-- 2) Добавяме CHECK constraint за допустими стойности
ALTER TABLE orders
    ADD CONSTRAINT chk_order_status
        CHECK (order_status IN ('PENDING', 'PREPARING', 'READY', 'CANCELLED', 'FINISHED', 'ACCEPTED'));
