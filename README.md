# Sweet Shop Management

**Frontend GitHub Repository:** [Frontend_Sweet_Shop](https://github.com/SameerSinghal26/Frontend_Sweet_Shop)

## Project Explanation
This project is a full-stack Sweet Shop Management system. The backend is built with Node.js, Express, TypeScript, and MongoDB, providing RESTful APIs for user authentication, sweet management, and admin features. The frontend is built with React and TypeScript for a modern, responsive user experience.

### Key Features
- User registration and login with JWT authentication
- Admins can add, update, restock, and delete sweets
- Sweets are managed with image uploads via Cloudinary
- Search, filter, and sort sweets by name, category, and price
- Role-based access for users and admins

## Test-Driven Development (TDD)
TDD was implemented during the development of user login and registration features. Tests were written before the actual logic, following the Red-Green-Refactor cycle. This ensured robust authentication and error handling. Example: Before implementing the login/register endpoints, tests were created to validate input, check for duplicate users, and verify token generation.

## Auth/User Model Overview
The authentication system uses JWT for secure login and registration. The `User` model stores user details, including name, email, password (hashed), and role (user/admin). Passwords are securely hashed, and the model includes methods for password comparison and role checks. Registration and login endpoints validate input and issue JWT tokens for session management.

## Middleware Overview
Custom middleware is used for:
- **Auth Middleware:** Verifies JWT tokens and attaches user info to requests, protecting private routes.
- **Admin Middleware:** Restricts access to admin-only endpoints, ensuring only authorized users can manage sweets.
- **Multer Middleware:** Handles image uploads for sweets, integrating with Cloudinary for storage.

## Sweet Controller Overview
The sweet controller manages all sweet-related operations:
- **Add Sweet:** Validates input, uploads image to Cloudinary, and associates the sweet with the admin.
- **Search Sweets:** Supports filtering by name, category, price, and admin, with sorting options.
- **Update Sweet:** Allows admins to edit sweet details and replace images.
- **Restock/Delete:** Admins can restock inventory or delete sweets.
- **Purchase:** Users can purchase sweets, which decrements stock.

## My AI Usage

### AI Tools Used
- ChatGPT

### How I Used Them
- Used Copilot to generate boilerplate for controllers, models, and especially for backend test files. Tests were then manually edited for coverage and accuracy.
- Used Copilot and ChatGPT to debug errors in Multer configuration and image uploading to Cloudinary.
- Used Copilot to create frontend templates and then manually customized them for project needs.

### Reflection on AI Impact
- AI tools greatly accelerated development, especially for repetitive code and initial test generation.
- Copilot helped resolve errors quickly and suggested best practices, improving code quality.
- ChatGPT provided architectural guidance and helped solve integration issues.
- AI allowed more time to focus on business logic and clean design, making the workflow faster and more reliable.

## Getting Started

### Backend Setup
1. Clone the repository:
   ```
   git clone https://github.com/SameerSinghal26/Backend_Sweet_Shop.git
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables in a `.env` file (see `.env.example`). You will need:
   - MongoDB connection string
   - Cloudinary API keys
   - JWT access and refresh token secrets
   - PORT
4. Start the server in development mode:
   ```
   npm run dev
   ```


## Scripts
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Start the production server
- `npm run dev`: Start the server in development mode (with nodemon)
- `npm test`: Run backend tests