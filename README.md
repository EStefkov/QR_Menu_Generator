# QR Menu Generator

A full-stack web application for restaurants to create, manage, and share digital menus via QR codes. Built with Java Spring Boot (backend) and React + Vite (frontend).

---

## 🚀 Features

- **Digital Menu Management:** Create, edit, and organize restaurant menus and categories.
- **QR Code Generation:** Instantly generate QR codes for menus.
- **User Roles:** Admin, Manager, Co-Manager, and User roles with fine-grained permissions.
- **Order Management:** Place and track orders, including public order confirmation.
- **Favorites & Cart:** Users can favorite products and manage a shopping cart.
- **Profile Management:** Upload and update profile pictures.
- **Allergen Information:** Display allergen icons for menu items.
- **Multi-language Support:** Easily switch between supported languages.
- **Responsive UI:** Modern, mobile-friendly interface.

---

## 🗂️ Project Structure

```
QR_Menu_Generator/
│
├── src/                # Backend (Java Spring Boot)
│   └── main/java/com/example/qr_menu/
│       ├── configurations/   # Security, CORS, Web config
│       ├── controllers/      # REST API endpoints
│       ├── dto/              # Data Transfer Objects
│       ├── entities/         # JPA Entities
│       ├── exceptions/       # Global error handling
│       ├── repositories/     # Spring Data JPA Repos
│       ├── security/         # JWT, filters, utils
│       ├── services/         # Business logic
│       └── utils/            # Utility classes
│
├── front_end/          # Frontend (React + Vite)
│   ├── src/
│   │   ├── api/        # API calls
│   │   ├── components/ # React components
│   │   ├── contexts/   # React context providers
│   │   ├── pages/      # Page components
│   │   ├── translations/ # i18n files
│   │   └── utils/      # Utility functions
│   ├── public/         # Static assets (images, icons)
│   ├── index.html
│   └── package.json
│
├── uploads/            # Uploaded images (profile, menu, products)
└── README.md           # Project documentation
```

---

## 🛠️ Backend (Spring Boot)

### Prerequisites

- Java 17+
- Maven 3.6+
- MySQL or compatible database

### Setup & Run

1. **Configure Database:**  
   Edit `src/main/resources/application.properties` with your DB credentials and JWT secret.

2. **Database Migration:**  
   Flyway is used for DB migrations (see `src/main/resources/db/migration/`).

3. **Run the Application:**
   ```bash
   ./mvnw spring-boot:run
   ```
   The backend runs at [http://localhost:8080](http://localhost:8080).

### API Overview

- **Authentication:** `/api/auth/**`
- **Accounts:** `/api/accounts/**`
- **Menus:** `/api/menus/**`
- **Products:** `/api/products/**`
- **Categories:** `/api/categories/**`
- **Orders:** `/api/orders/**`
- **Favorites:** `/api/favorites/**`
- **Manager Assignments:** `/api/manager-assignments/**`
- **Uploads:** `/uploads/**` (static files)

See controller classes in `src/main/java/com/example/qr_menu/controllers/` for details.

---

## 💻 Frontend (React + Vite)

### Prerequisites

- Node.js 18+
- npm 9+

### Setup & Run

1. **Install dependencies:**
   ```bash
   cd front_end
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend runs at [http://localhost:5173](http://localhost:5173).

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🔒 Authentication & Authorization

- Uses JWT for stateless authentication.
- Role-based access control is enforced in `SecurityConfig.java`.
- Public endpoints: login, registration, menu viewing, QR code generation, and static uploads.
- Protected endpoints: menu management, orders, favorites, account updates, etc.

---

## 🖼️ File Uploads & Static Files

- Uploaded images (profile pictures, menu images, product images) are stored in the `uploads/` directory.
- Static files are served via `/uploads/**` endpoints.
- Default images are available for products and profiles.

---

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes.
4. Push to your branch and open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

**For more details, see the code and comments in each module. If you have questions or need help, please open an issue or contact the maintainer.** 
