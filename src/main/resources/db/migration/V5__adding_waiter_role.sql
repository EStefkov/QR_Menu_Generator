ALTER TABLE account
ALTER COLUMN account_type VARCHAR(50) NOT NULL;

ALTER TABLE account
    ADD CONSTRAINT chk_account_type CHECK (account_type IN ('ROLE_USER', 'ROLE_ADMIN', 'ROLE_WAITER'));
