-- Drop the existing enum constraint
ALTER TABLE account MODIFY account_type VARCHAR(255) NOT NULL;

-- Update any existing ROLE_WAITER to ROLE_COMANAGER
UPDATE account SET account_type = 'ROLE_COMANAGER' WHERE account_type = 'ROLE_WAITER';

-- Recreate the enum with the correct values
ALTER TABLE account MODIFY account_type ENUM('ROLE_USER', 'ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_COMANAGER') NOT NULL; 