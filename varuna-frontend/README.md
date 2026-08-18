# Varuna Frontend

This repository contains the standalone frontend for the Varuna project, configured specifically for Vercel deployment.

## Deployment on Vercel

To deploy this project on Vercel:

1. Create a new GitHub repository and push this code to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/varuna-frontend.git
   git push -u origin main
   ```

2. Log into [Vercel](https://vercel.com/) and click **Add New** -> **Project**.
3. Import your newly created `varuna-frontend` repository.
4. Expand the **Environment Variables** section and add:
   - `VITE_API_URL`: Set this to your deployed backend API URL (e.g., `https://varuna-backend.example.com`).
5. Vercel will automatically detect the React/Vite project.
6. Click **Deploy**.

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```
