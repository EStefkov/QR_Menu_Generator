-- Update the account_type enum to include ROLE_MANAGER
ALTER TABLE account MODIFY account_type ENUM('ROLE_USER', 'ROLE_ADMIN', 'ROLE_WAITER', 'ROLE_MANAGER') NOT NULL;

-- Create manager_assignment table to track which managers are assigned to which restaurants
CREATE TABLE manager_assignment (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    manager_id BIGINT NOT NULL,
    restorant_id BIGINT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by BIGINT,
    CONSTRAINT fk_manager_id FOREIGN KEY (manager_id) REFERENCES account(id) ON DELETE CASCADE,
    CONSTRAINT fk_restorant_manager_id FOREIGN KEY (restorant_id) REFERENCES restorant(id) ON DELETE CASCADE,
    CONSTRAINT fk_assigning_admin FOREIGN KEY (assigned_by) REFERENCES account(id) ON DELETE SET NULL
); 