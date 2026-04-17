@echo off
cd /d c:\Users\Blaise\Documents\HafiHub

REM Commit 14-16: Post controller and routes
git add backend/src/controllers/post.controller.js && git commit -m "feat: implement post controller with listing and creation"
git add backend/src/routes/post.routes.js && git commit -m "feat: add post routes with CRUD endpoints"
git add backend/src/services/comment.service.js && git commit -m "feat: implement comment service for post discussions"

REM Commit 17-19: Comments and likes
git add backend/src/controllers/comment.controller.js && git commit -m "feat: implement comment controller"
git add backend/src/services/like.service.js && git commit -m "feat: implement like service for post interactions"
git add backend/src/controllers/like.controller.js && git commit -m "feat: implement like controller"

REM Commit 20-22: Routes and user service
git add backend/src/routes/comment.routes.js && git commit -m "feat: add comment routes"
git add backend/src/routes/like.routes.js && git commit -m "feat: add like routes"
git add backend/src/services/user.service.js && git commit -m "feat: implement user service with profile methods"

REM Commit 23-25: User routes and event feature
git add backend/src/controllers/user.controller.js && git commit -m "feat: implement user controller for profiles"
git add backend/src/routes/user.routes.js && git commit -m "feat: add user profile routes"
git add backend/src/controllers/event.controller.js && git commit -m "feat: implement event controller with full CRUD"

REM Commit 26-28: Event routes and bookings
git add backend/src/routes/event.routes.js && git commit -m "feat: add event routes with filtering and pagination"
git add backend/src/controllers/booking.controller.js && git commit -m "feat: implement booking controller for event reservations"
git add backend/src/routes/booking.routes.js && git commit -m "feat: add booking routes"

REM Commit 29-30: News feature
git add backend/src/controllers/news.controller.js && git commit -m "feat: implement news controller for articles"
git add backend/src/routes/news.routes.js && git commit -m "feat: add news routes"

REM Commit 31-32: Database and server
git add backend/prisma/migrations && git commit -m "feat: add database migrations for complete schema"
git add backend/src/server.js && git commit -m "feat: setup express server with all routes and middleware"

REM Commit 33-34: Seed data and frontend init
git add backend/seed.js && git commit -m "feat: add database seeding script with comprehensive test data"
git add frontend/package.json && git commit -m "chore: initialize frontend react project with vite"

REM Commit 35-37: React app and auth
git add frontend/src/main.jsx && git commit -m "feat: setup react entry point with root component"
git add frontend/src/App.jsx && git commit -m "feat: implement main app component with routing system"
git add frontend/src/contexts/AuthContext.jsx && git commit -m "feat: implement authentication context for global state management"

REM Commit 38-40: Auth pages
git add frontend/src/pages/Login.jsx && git commit -m "feat: implement login page with form validation"
git add frontend/src/pages/Register.jsx && git commit -m "feat: implement register page with user signup"
git add frontend/src/components/Navbar.jsx && git commit -m "feat: implement navigation bar component with routing"

REM Commit 41-42: Home and post pages
git add frontend/src/pages/Home.jsx && git commit -m "feat: implement home page with post feed and pagination"
git add frontend/src/pages/PostDetail.jsx && git commit -m "feat: implement post detail page with comments and interactions"

REM Commit 43-45: Post creation and editing
git add frontend/src/pages/CreatePost.jsx && git commit -m "feat: implement create post page with form validation"
git add frontend/src/pages/EditPost.jsx && git commit -m "feat: implement edit post page with authorization checks"
git add frontend/src/services/api.js && git commit -m "feat: implement API client with all endpoint methods"

REM Commit 46: User profile
git add frontend/src/pages/UserProfile.jsx && git commit -m "feat: implement user profile page with statistics"

REM Commit 47: Search functionality
git add frontend/src/pages/Search.jsx && git commit -m "feat: implement search page for posts and users"

REM Commit 48-49: Events feature
git add frontend/src/pages/Events.jsx && git commit -m "feat: implement events listing page with filtering"
git add frontend/src/pages/EventDetail.jsx && git commit -m "feat: implement event detail page with booking system"

REM Commit 50: Create event and news
git add frontend/src/pages/CreateEvent.jsx && git commit -m "feat: implement create event page for event hosting"

REM Commit 51: Edit event
git add frontend/src/pages/EditEvent.jsx && git commit -m "feat: implement edit event page with authorization"

REM Commit 52-53: News pages
git add frontend/src/pages/News.jsx && git commit -m "feat: implement news feed page with filtering"
git add frontend/src/pages/NewsDetail.jsx && git commit -m "feat: implement news article detail page"

REM Commit 54-55: Components and styling
git add frontend/src/components/PostCard.jsx && git commit -m "feat: implement reusable post card component"
git add frontend/src/styles && git commit -m "style: add comprehensive CSS styling for all pages and components"

REM Commit 56: Configuration and setup
git add frontend/vite.config.js && git commit -m "chore: configure vite build tool for react"

REM Commit 57: Frontend build files
git add frontend/index.html && git commit -m "chore: setup html entry point for frontend"

REM Commit 58-60: Assets and icons
git add frontend/public && git commit -m "feat: add public assets including logo and favicon"
git add frontend/src/App.css && git commit -m "style: add app-level styles"
git add frontend/src/index.css && git commit -m "style: add global index styles"

REM Commit 61: Cleanup
git add . && git commit -m "chore: finalize project structure and remove batch script" || echo "All files committed"

echo All commits have been created successfully!
