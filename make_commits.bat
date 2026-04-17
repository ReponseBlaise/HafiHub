@echo off
cd /d c:\Users\Blaise\Documents\HafiHub

REM Commit 3-5: Environment and utilities
git add backend/.env.example && git commit -m "chore: add environment variables template"
git add backend/src/utils/jwt.js && git commit -m "feat: implement JWT token utilities"
git add backend/src/utils/password.js && git commit -m "feat: implement password hashing utilities with bcrypt"

REM Commit 6-7: Database setup
git add backend/src/utils/db.js && git commit -m "feat: setup Prisma database connection"
git add backend/prisma/schema.prisma && git commit -m "feat: define database schema with User and Post models"

REM Commit 8-9: Authentication
git add backend/src/services/auth.service.js && git commit -m "feat: implement authentication service with JWT"
git add backend/src/controllers/auth.controller.js && git commit -m "feat: implement auth controller for login and register"

REM Commit 10-11: Auth routes and middleware
git add backend/src/routes/auth.routes.js && git commit -m "feat: add authentication routes"
git add backend/src/middlewares/auth.js && git commit -m "feat: implement JWT authentication middleware"

REM Commit 12-14: Post feature
git add backend/src/services/post.service.js && git commit -m "feat: implement post service with CRUD operations"
git add backend/src/controllers/post.controller.js && git commit -m "feat: implement post controller with listing and creation"
git add backend/src/routes/post.routes.js && git commit -m "feat: add post routes with CRUD endpoints"

REM Commit 15-16: Comments feature
git add backend/src/services/comment.service.js && git commit -m "feat: implement comment service"
git add backend/src/controllers/comment.controller.js && git commit -m "feat: implement comment controller"

REM Commit 17-18: Likes feature
git add backend/src/services/like.service.js && git commit -m "feat: implement like service"
git add backend/src/controllers/like.controller.js && git commit -m "feat: implement like controller"

REM Commit 19-20: User profile
git add backend/src/services/user.service.js && git commit -m "feat: implement user service with profile methods"
git add backend/src/controllers/user.controller.js && git commit -m "feat: implement user controller"

REM Commit 21: Comments and likes routes
git add backend/src/routes/comment.routes.js && git commit -m "feat: add comment routes"

REM Commit 22: Likes routes
git add backend/src/routes/like.routes.js && git commit -m "feat: add like routes"

REM Commit 23: User routes
git add backend/src/routes/user.routes.js && git commit -m "feat: add user profile routes"

REM Commit 24-26: Events feature
git add backend/src/controllers/event.controller.js && git commit -m "feat: implement event controller with full CRUD"
git add backend/src/routes/event.routes.js && git commit -m "feat: add event routes"
git add backend/src/controllers/booking.controller.js && git commit -m "feat: implement booking controller"

REM Commit 27-28: News feature
git add backend/src/routes/booking.routes.js && git commit -m "feat: add booking routes"
git add backend/src/controllers/news.controller.js && git commit -m "feat: implement news controller"

REM Commit 29: News routes
git add backend/src/routes/news.routes.js && git commit -m "feat: add news routes"

REM Commit 30-31: Database migrations and seed
git add backend/prisma/migrations && git commit -m "feat: add database migrations for comments and likes"
git add backend/seed.js && git commit -m "feat: add database seeding script with sample data"

REM Commit 32-33: Server setup
git add backend/src/server.js && git commit -m "feat: setup express server with all routes"
git add backend/src/prisma/schema.prisma && git commit -m "feat: copy schema to src folder"

REM Commit 34: Frontend initialization
git add frontend/package.json && git commit -m "chore: initialize frontend project with react and vite"

REM Commit 35-36: React app structure
git add frontend/src/App.jsx && git commit -m "feat: setup main app component with routing"
git add frontend/src/main.jsx && git commit -m "feat: setup react entry point"

REM Commit 37-38: Authentication UI
git add frontend/src/contexts/AuthContext.jsx && git commit -m "feat: implement auth context for global state"
git add frontend/src/pages/Login.jsx && git commit -m "feat: implement login page"

REM Commit 39: Register page
git add frontend/src/pages/Register.jsx && git commit -m "feat: implement register page"

REM Commit 40-41: Navigation and styling
git add frontend/src/components/Navbar.jsx && git commit -m "feat: implement navigation bar component"
git add frontend/src/styles/navbar.css && git commit -m "style: add navbar styling"

REM Commit 42-44: Post pages
git add frontend/src/pages/Home.jsx && git commit -m "feat: implement home page with post feed"
git add frontend/src/pages/PostDetail.jsx && git commit -m "feat: implement post detail page with comments"
git add frontend/src/pages/CreatePost.jsx && git commit -m "feat: implement create post page"

REM Commit 45-46: Event pages
git add frontend/src/pages/Events.jsx && git commit -m "feat: implement events listing page"
git add frontend/src/pages/EventDetail.jsx && git commit -m "feat: implement event detail page with booking"

REM Commit 47-49: Additional features
git add frontend/src/pages/CreateEvent.jsx && git commit -m "feat: implement create event page"
git add frontend/src/pages/EditEvent.jsx && git commit -m "feat: implement edit event page"
git add frontend/src/pages/News.jsx && git commit -m "feat: implement news feed page"

REM Commit 50: Complete styling
git add frontend/src/styles && git commit -m "style: add comprehensive CSS styling for all pages"

echo All 50 commits created successfully!
