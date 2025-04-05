-- 1) Създаваме таблица allergen
CREATE TABLE allergen (
                          id BIGINT IDENTITY(1,1) PRIMARY KEY,
                          allergen_name VARCHAR(255) NOT NULL,
                          created_at DATETIME DEFAULT GETDATE(),
                          updated_at DATETIME DEFAULT GETDATE()
);

-- 2) Създаваме таблица product_allergen за Many-to-Many връзка
CREATE TABLE product_allergen (
                                  product_id BIGINT NOT NULL,
                                  allergen_id BIGINT NOT NULL,
                                  created_at DATETIME DEFAULT GETDATE(),
                                  updated_at DATETIME DEFAULT GETDATE(),
                                  PRIMARY KEY (product_id, allergen_id),
                                  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                                  CONSTRAINT fk_allergen FOREIGN KEY (allergen_id) REFERENCES allergen(id) ON DELETE CASCADE
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
