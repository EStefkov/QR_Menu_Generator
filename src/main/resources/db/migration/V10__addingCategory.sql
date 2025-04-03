CREATE TABLE category (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          category_image VARCHAR(255),
                          name VARCHAR(255),
                          menu_id BIGINT,
                          CONSTRAINT fk_category_menu FOREIGN KEY (menu_id) REFERENCES menu(id)
);