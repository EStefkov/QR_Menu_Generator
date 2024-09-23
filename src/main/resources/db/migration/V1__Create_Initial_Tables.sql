-- V1__Create_Initial_Tables.sql

-- Create 'account' table
CREATE TABLE account (
                         id BIGINT AUTO_INCREMENT PRIMARY KEY,
                         account_name VARCHAR(255) NOT NULL,
                         mail_address VARCHAR(255),
                         number VARCHAR(50)
);

-- Create 'restorant' table
CREATE TABLE restorant (
                           id BIGINT AUTO_INCREMENT PRIMARY KEY,
                           restorant_name VARCHAR(255) NOT NULL,
                           phone_number VARCHAR(50),
                           account_id BIGINT,
                           FOREIGN KEY (account_id) REFERENCES account(id) ON DELETE CASCADE
);

-- Create 'menu' table
CREATE TABLE menu (
                      id BIGINT AUTO_INCREMENT PRIMARY KEY,
                      category VARCHAR(255) NOT NULL,
                      restorant_id BIGINT,
                      FOREIGN KEY (restorant_id) REFERENCES restorant(id) ON DELETE CASCADE
);

-- Create 'products' table
CREATE TABLE products (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          product_name VARCHAR(255) NOT NULL,
                          product_price DECIMAL(10, 2) NOT NULL,
                          product_info TEXT,
                          menu_id BIGINT,
                          FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE
);
