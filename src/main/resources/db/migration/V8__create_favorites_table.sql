CREATE TABLE favorites (
                           id BIGINT IDENTITY(1,1) PRIMARY KEY,
                           account_id BIGINT NOT NULL,
                           product_id BIGINT NOT NULL,
                           created_at DATETIME DEFAULT GETDATE(),
                           CONSTRAINT fk_fav_account FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE,
                           CONSTRAINT fk_fav_product FOREIGN KEY (product_id) REFERENCES products(id),
                           CONSTRAINT uq_account_product UNIQUE (account_id, product_id)
);
