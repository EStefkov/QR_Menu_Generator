ALTER TABLE account
    ADD COLUMN account_type VARCHAR(10) NOT NULL CHECK (account_type IN ('USER', 'ADMIN'));
