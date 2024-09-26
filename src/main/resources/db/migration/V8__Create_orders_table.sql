-- V8__create_orders_table.sql
CREATE TABLE orders (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        order_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        order_status VARCHAR(255) NOT NULL,
                        total_price BIGINT NOT NULL,
                        account_id BIGINT NOT NULL,
                        restorant_id BIGINT NOT NULL,
                        CONSTRAINT fk_account FOREIGN KEY (account_id) REFERENCES account(id),
                        CONSTRAINT fk_restorant FOREIGN KEY (restorant_id) REFERENCES restorant(id),
                        CONSTRAINT chk_order_status CHECK (order_status IN ('FINISHED', 'ACCEPTED'))
);
