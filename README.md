# Frontend Application - Next.js

This is a frontend application built with **Next.js**, designed to work seamlessly with the backend API.

---

## 🚀 Getting Started

Follow the steps below to run the project locally.

---

## 📦 Installation

Install dependencies:

```bash
npm install
```

or if you use yarn:

```bash
yarn install
```

---

## 🧑‍💻 Development

Run the development server:

```bash
npm run dev
```

or:

```bash
yarn dev
```

The application will be available at:

```
http://localhost:3000
```

---

## 🏗️ Build

To build the application for production:

```bash
npm run build
```

---

## ▶️ Run Production

After building, start the production server:

```bash
npm run start
```

---

## 🧹 Linting

Run lint check:

```bash
npm run lint
```

---

## 📁 Project Structure

```
.
├── app/            # App router (Next.js 13+)
├── pages/          # Pages router (if used)
├── components/     # Reusable UI components
├── public/         # Static assets
├── styles/         # Global styles
├── .env.local      # Environment variables
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## 📚 Learn More

- Next.js Documentation: https://nextjs.org/docs
- React Documentation: https://react.dev/

---

## ⚠️ Notes

- Make sure the backend API is running before starting the frontend.
- Update `NEXT_PUBLIC_API_URL` according to your backend environment.

---
