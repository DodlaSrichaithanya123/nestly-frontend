# 🌐 Nestly Frontend Setup Guide

## 🧠 Tech Stack
- **React 19 (Vite + TypeScript)**
- **Tailwind CSS** for styling
- **Axios** for API requests
- **React Router DOM v7** for navigation
- **Framer Motion** for animations
- **Lucide React & Heroicons** for icons

---

## ⚙️ Complete Setup Instructions

```bash
# 1️⃣ Navigate to the project folder
cd frontend

# 2️⃣ Install dependencies
npm install

# 3️⃣ Create an .env file in the root of the frontend directory
#    and add the following variable:
VITE_API_BASE_URL=http://localhost:8080

# ⚠️ Replace localhost:8080 with your actual backend URL
#     (for example, the Railway backend URL after deployment)

# 4️⃣ Create an .env.example file (for GitHub reference)
#    This file should contain only the variable name:
VITE_API_BASE_URL=

# 5️⃣ Ensure .env is listed in your .gitignore file
#    to prevent it from being pushed to GitHub

# 6️⃣ Run the development server
npm run dev

#    After running, open your browser and go to:
#    http://localhost:5173

# 7️⃣ Build for production
npm run build

#    This creates an optimized build in the /dist directory

# 8️⃣ Preview the production build locally
npm run preview

# 9️⃣ Lint your code to check for any errors or warnings
npm run lint

# 🪄 Useful Commands Summary
# npm install     → Install all dependencies
# npm run dev     → Run development server
# npm run build   → Build for production
# npm run preview → Preview production build
# npm run lint    → Run ESLint checks
