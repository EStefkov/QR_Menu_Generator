-- Account Table
CREATE TABLE account (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         account_name VARCHAR(255),
                         mail_address VARCHAR(255),
                         number VARCHAR(255),
                         password VARCHAR(255) NOT NULL,
                         account_type ENUM('ROLE_USER', 'ROLE_ADMIN') NOT NULL,
                         created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                         updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Restaurant Table
CREATE TABLE restorant (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           restorant_name VARCHAR(255),
                           phone_number VARCHAR(255),
                           account_id BIGINT,
                           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                           CONSTRAINT fk_account_id FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
);

-- Menu Table
CREATE TABLE menu (
                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                      category VARCHAR(255),
                      restorant_id BIGINT,
                      menu_url VARCHAR(512), -- New column for storing menu URL
                      qr_code_image BLOB,    -- New column for storing QR code image
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                      CONSTRAINT fk_restorant_id FOREIGN KEY (restorant_id) REFERENCES restorant(id) ON DELETE CASCADE
);

-- Products Table
CREATE TABLE products (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          product_name VARCHAR(255),
                          product_price DOUBLE,
                          product_info TEXT,
                          menu_id BIGINT,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                          CONSTRAINT fk_menu_id FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE orders (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        order_time TIMESTAMP NOT NULL,
                        order_status ENUM('FINISHED', 'ACCEPTED') NOT NULL,
                        total_price BIGINT NOT NULL,
                        account_id BIGINT,
                        restorant_id BIGINT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        CONSTRAINT fk_order_account FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE,
                        CONSTRAINT fk_order_restorant FOREIGN KEY (restorant_id) REFERENCES restorant(id) ON DELETE CASCADE
);

-- Order_Product Join Table
CREATE TABLE order_product (
                               order_id BIGINT,
                               product_id BIGINT,
                               quantity INT NOT NULL,
                               created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                               updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                               PRIMARY KEY (order_id, product_id),
                               CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                               CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
