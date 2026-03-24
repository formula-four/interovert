# 1. Use a lightweight Node.js base image
FROM node:20-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Copy the root package.json and package-lock.json first
COPY package*.json ./

# 4. Install dependencies
# The --omit=dev flag is the magic trick here. It tells npm to install Express, pg, Mongoose, etc., 
# but it skips Vite, Tailwind, and ESLint, keeping your backend container small and fast.
RUN npm ci --omit=dev

# 5. Copy the rest of your project files (which includes your backend/ folder)
COPY . .

# 6. Expose the port Cloud Run uses
EXPOSE 8080

# 7. Start the server using the specific script you already have in your package.json
CMD ["npm", "run", "server"]