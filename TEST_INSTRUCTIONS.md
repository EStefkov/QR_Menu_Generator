# QR Menu Generator - Инструкции за тестване

## Как да стартирате тестовете

### Предварителни изисквания

1. **Java 17 или по-нова версия**
2. **Maven 3.6 или по-нова версия**
3. **IDE** (IntelliJ IDEA, Eclipse, VS Code)

### Структура на тестовете

```
src/test/java/com/example/qr_menu/
├── controllers/
│   ├── AccountControllerTest.java      # Тестове за потребителски акаунти
│   ├── RestaurantControllerTest.java   # Тестове за ресторанти
│   └── ProductControllerTest.java      # Тестове за продукти
├── services/                           # Тестове за сервиси (за добавяне)
├── integration/                        # Интеграционни тестове (за добавяне)
└── QrMenuGeneratorApplicationTests.java # Основен тест за приложението
```

### Конфигурация на тестовете

Тестовете използват:
- **H2 In-Memory Database** за изолирани тестове
- **Spring Boot Test** framework
- **MockMvc** за HTTP заявки
- **JUnit 5** за test framework
- **@Transactional** за rollback след всеки тест

## Методи за стартиране на тестовете

### 1. Чрез Maven Command Line

#### Стартиране на всички тестове:
```bash
mvn test
```

#### Стартиране на конкретен тест клас:
```bash
mvn test -Dtest=AccountControllerTest
mvn test -Dtest=RestaurantControllerTest
mvn test -Dtest=ProductControllerTest
```

#### Стартиране на конкретен тест метод:
```bash
mvn test -Dtest=AccountControllerTest#testRegisterWithValidData
mvn test -Dtest=RestaurantControllerTest#testCreateRestaurantWithValidData
```

#### Стартиране с подробни логове:
```bash
mvn test -Dspring.profiles.active=test -Dlogging.level.com.example.qr_menu=DEBUG
```

### 2. Чрез IntelliJ IDEA

1. **Отворете проекта** в IntelliJ IDEA
2. **Навигирайте** до `src/test/java/com/example/qr_menu/controllers/`
3. **Десен клик** на тест файл → "Run 'AccountControllerTest'"
4. **Или** десен клик на конкретен `@Test` метод → "Run 'testMethodName'"

#### Стартиране на всички тестове в IntelliJ:
- Десен клик на `src/test/java` → "Run 'All Tests'"

### 3. Чрез Eclipse

1. **Отворете проекта** в Eclipse
2. **Навигирайте** до test класа
3. **Десен клик** → "Run As" → "JUnit Test"

### 4. Чрез VS Code

1. **Инсталирайте** Java Test Runner extension
2. **Отворете** тест файла
3. **Кликнете** на "Run Test" бутона над `@Test` методите

## Детайли за тестовете

### AccountControllerTest.java

**Тестове за автентикация и потребители:**
- ✅ Регистрация с валидни данни
- ✅ Регистрация с съществуващ имейл
- ✅ Вход с валидни/невалидни данни
- ✅ JWT токен валидация
- ✅ Смяна на парола
- ✅ Качване на профилна снимка
- ✅ Обновяване на роли (админ функции)

**Стартиране:**
```bash
mvn test -Dtest=AccountControllerTest
```

### RestaurantControllerTest.java

**Тестове за ресторанти:**
- ✅ Създаване на ресторант
- ✅ Получаване на всички ресторанти
- ✅ Обновяване на ресторант
- ✅ Изтриване (само админи)
- ✅ Качване на лого
- ✅ Проверка на собственост

**Стартиране:**
```bash
mvn test -Dtest=RestaurantControllerTest
```

### ProductControllerTest.java

**Тестове за продукти:**
- ✅ CRUD операции за продукти
- ✅ Пагинация
- ✅ Филтриране по категория
- ✅ Търсене по име
- ✅ Качване на снимки
- ✅ Публичен достъп до менюта

**Стартиране:**
```bash
mvn test -Dtest=ProductControllerTest
```

## Конфигурация на тестовата среда

### application-test.properties

Файлът `src/test/resources/application-test.properties` съдържа:

```properties
# H2 Database за тестове
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=create-drop

# JWT конфигурация за тестове
jwt.secret=testSecretKeyForJWTTokenGenerationInTestEnvironment
jwt.expiration=86400

# Debug логове
logging.level.com.example.qr_menu=DEBUG
```

## Анализ на резултатите

### Успешно изпълнение
```
[INFO] Tests run: 12, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

### При грешки
```
[ERROR] Tests run: 12, Failures: 1, Errors: 0, Skipped: 0
[ERROR] testRegisterWithValidData  Time elapsed: 0.5 s  <<< FAILURE!
```

### Подробни логове
За да видите подробни логове, добавете:
```bash
mvn test -Dlogging.level.org.springframework.test=DEBUG
```

## Добавяне на нови тестове

### Създаване на нов тест клас:

```java
@SpringBootTest
@AutoConfigureWebMvc
@ActiveProfiles("test")
@Transactional
public class NewControllerTest {
    
    @Autowired
    private WebApplicationContext context;
    
    private MockMvc mockMvc;
    
    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }
    
    @Test
    @DisplayName("Описание на теста")
    void testMethodName() throws Exception {
        // Тест логика
    }
}
```

## Troubleshooting

### Често срещани проблеми:

1. **Port already in use**
   - Решение: Използвайте random port `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)`

2. **Database connection issues**
   - Решение: Проверете `application-test.properties`

3. **JWT token issues**
   - Решение: Проверете JWT secret в test properties

4. **File upload tests failing**
   - Решение: Проверете permissions за temp директории

### Debug команди:

```bash
# Стартиране с debug информация
mvn test -X

# Стартиране с конкретен профил
mvn test -Dspring.profiles.active=test

# Пропускане на тестове
mvn install -DskipTests
```

## Continuous Integration

За автоматизирано тестване в CI/CD:

```yaml
# GitHub Actions example
- name: Run tests
  run: mvn test -Dspring.profiles.active=test
```

## Заключение

Тестовете осигуряват:
- ✅ **Функционална валидация** на всички API endpoints
- ✅ **Сигурностни проверки** за автентикация и авторизация
- ✅ **Интеграционно тестване** на цялата система
- ✅ **Регресионно тестване** при промени в кода

За въпроси или проблеми, моля проверете логовете или се свържете с development екипа. 