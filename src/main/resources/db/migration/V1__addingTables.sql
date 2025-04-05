-- Account Table
CREATE TABLE account (
                         id BIGINT IDENTITY(1,1) PRIMARY KEY,
                         account_name VARCHAR(255),
                         mail_address VARCHAR(255),
                         number VARCHAR(255),
                         password VARCHAR(255) NOT NULL,
                         account_type VARCHAR(50) NOT NULL, -- вместо ENUM
                         created_at DATETIME DEFAULT GETDATE(),
                         updated_at DATETIME DEFAULT GETDATE()
);

-- Restaurant Table
CREATE TABLE restorant (
                           id BIGINT IDENTITY(1,1) PRIMARY KEY,
                           restorant_name VARCHAR(255),
                           phone_number VARCHAR(255),
                           account_id BIGINT,
                           created_at DATETIME DEFAULT GETDATE(),
                           updated_at DATETIME DEFAULT GETDATE(),
                           CONSTRAINT fk_account_id FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
);

-- Menu Table
CREATE TABLE menu (
                      id BIGINT IDENTITY(1,1) PRIMARY KEY,
                      category VARCHAR(255),
                      restorant_id BIGINT,
                      menu_url VARCHAR(512),
                      qr_code_image VARBINARY(MAX),
                      created_at DATETIME DEFAULT GETDATE(),
                      updated_at DATETIME DEFAULT GETDATE(),
                      CONSTRAINT fk_restorant_id FOREIGN KEY (restorant_id) REFERENCES restorant(id) ON DELETE CASCADE
);

-- Products Table
CREATE TABLE products (
                          id BIGINT IDENTITY(1,1) PRIMARY KEY,
                          product_name VARCHAR(255),
                          product_price FLOAT,
                          product_info TEXT,
                          menu_id BIGINT,
                          created_at DATETIME DEFAULT GETDATE(),
                          updated_at DATETIME DEFAULT GETDATE(),
                          CONSTRAINT fk_menu_id FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE orders (
                        id BIGINT IDENTITY(1,1) PRIMARY KEY,
                        order_time DATETIME NOT NULL,
                        order_status VARCHAR(50) NOT NULL,
                        total_price FLOAT NOT NULL,
                        account_id BIGINT,
                        restorant_id BIGINT,
                        created_at DATETIME DEFAULT GETDATE(),
                        updated_at DATETIME DEFAULT GETDATE(),
                        CONSTRAINT fk_order_account FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE,
                        CONSTRAINT fk_order_restorant FOREIGN KEY (restorant_id) REFERENCES restorant(id) -- без ON DELETE CASCADE
);

-- Order_Product Join Table
CREATE TABLE order_product (
                               order_id BIGINT,
                               product_id BIGINT,
                               quantity INT NOT NULL,
                               created_at DATETIME DEFAULT GETDATE(),
                               updated_at DATETIME DEFAULT GETDATE(),
                               PRIMARY KEY (order_id, product_id),
                               CONSTRAINT fk_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                               CONSTRAINT fk_product_id FOREIGN KEY (product_id) REFERENCES products(id) -- без ON DELETE CASCADE
);
