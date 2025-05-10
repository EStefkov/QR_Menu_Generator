-- 1) Създаваме таблица allergen
CREATE TABLE allergen (
                          id BIGINT AUTO_INCREMENT PRIMARY KEY,
                          allergen_name VARCHAR(255) NOT NULL,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2) Създаваме таблица product_allergen за Many-to-Many връзка
CREATE TABLE product_allergen (
                                  product_id BIGINT NOT NULL,
                                  allergen_id BIGINT NOT NULL,
                                  PRIMARY KEY (product_id, allergen_id),
                                  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                                  CONSTRAINT fk_allergen FOREIGN KEY (allergen_id) REFERENCES allergen(id) ON DELETE CASCADE,
                                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3) Въвеждаме 14-те задължителни алергена
INSERT INTO allergen (allergen_name) VALUES
                                         ('Gluten'),
                                         ('Crustaceans'),
                                         ('Eggs'),
                                         ('Fish'),
                                         ('Peanuts'),
                                         ('Soybeans'),
                                         ('Milk'),
                                         ('Nuts'),
                                         ('Celery'),
                                         ('Mustard'),
                                         ('Sesame'),
                                         ('Sulphur dioxide and sulphites'),
                                         ('Lupin'),
                                         ('Molluscs');
