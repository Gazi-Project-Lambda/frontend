# 📝 Angular Notes Application

A full-featured **single-page application (SPA)** built with **modern Angular (v21+)**. The app includes secure user authentication and a complete **CRUD (Create, Read, Update, Delete)** interface for managing personal notes, backed by a live REST API.

🌐 **Live Demo:** [https://frontend-rho-eight-53.vercel.app](https://frontend-rho-eight-53.vercel.app)

---

## ✨ Features

### 🔐 User Authentication

* Secure user registration
* JWT-based login

### 🛡️ Protected Routes

* Notes page is accessible only to authenticated users
* Enforced via Angular Route Guards

### 🗒️ Full CRUD for Notes

* Create new notes with title and content
* View all user-owned notes
* Update notes in-place
* Delete notes with confirmation dialog

### 🎨 Rich User Experience

* Real-time search & filtering by title or content
* Drag-and-drop reordering of notes
* Mark notes as **completed** with visual strikethrough
* Loading spinners and clear error handling

### 📱 Responsive Design

* Clean, modern UI
* Optimized for both desktop and mobile devices

---

## 🛠️ Technology Stack

* **Frontend:** Angular v21 (Standalone Components)
* **Styling:** CSS (modern gradient-based theme)
* **Icons:** Remix Icon
* **State Management:** RxJS
* **Drag & Drop:** Angular CDK
* **Testing:** Vitest

---

## 🚀 Getting Started

Follow these instructions to run the project locally for development and testing.

### ✅ Prerequisites

* Node.js **v20.x** or higher
* Angular CLI **v21.x** or higher

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Gazi-Project-Lambda/angular-login.git
cd angular-login
```

---

### 2️⃣ Install Dependencies

```bash
npm install
```

---

### 3️⃣ Backend & Proxy Setup (⚠️ Crucial Step)

This project communicates with a **live backend API**. To avoid CORS issues during local development, an Angular proxy is required.

Create a file named **`proxy.conf.json`** in the root directory with the following content:

```json
{
  "/api": {
    "target": "https://notes-fwm8.onrender.com",
    "secure": false,
    "changeOrigin": true
  }
}
```

✔️ The `angular.json` file is already configured to use this proxy when running `ng serve`.

---

### 4️⃣ Run the Development Server

```bash
ng serve
```

Open your browser and navigate to:

👉 [http://localhost:4200/](http://localhost:4200/)

The application will automatically reload when you modify source files.

---

## 🌐 Backend API

* **Base URL:** [https://notes-fwm8.onrender.com](https://notes-fwm8.onrender.com)
* **Backend Included:** ❌ No (uses a live hosted API)
* **API Documentation:** See `api-notes.pdf`

No backend setup is required as long as the proxy configuration is correct.

---

## 📜 Available Scripts

In the project directory, you can run:

### ▶️ `ng serve`

Runs the application in development mode.

### 🏗️ `ng build`

Builds the application for production into the `dist/` folder with full optimization.

### 🧪 `ng test`

Launches the unit test runner in interactive watch mode using **Vitest**.

---

## 📦 Deployment

To deploy the application:

```bash
ng build
```

The production-ready files will be generated in:

```
dist/angular-login/browser
```

This folder can be deployed to any static hosting provider such as:

* Vercel
* Netlify
* GitHub Pages

✅ The production build uses the live API directly, so the proxy is **not required** after deployment.

---

## 👤 Author

**Gazi – Project Lambda**

---

⭐ If you like this project, feel free to star the repository!
