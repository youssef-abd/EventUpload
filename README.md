
# 📸 EventSnap — Collaborative Event Photo Sharing App

A slick, real-time web app that lets guests instantly upload and view photos from events — no account required. Designed for simplicity, privacy, and seamless photo sharing.

![App Preview](https://source.unsplash.com/featured/?event,party,camera) <!-- Replace with actual screenshot -->

---

##  Features

-  **Instant Guest Uploads** — Join via code and share photos on the spot  
-  **Organizer Dashboard** — Download all photos, manage event data  
-  **Bulk Zip Download** — Download all photos from an event in one click  
-  **Live Event Feed** — Real-time updates via Supabase channels  
-  **Responsive UI** — Tailwind-powered mobile-first interface  
-  **No Login Needed** — Just join with event code and name  

---

##  Tech Stack

| Component        | Tech                           |
|------------------|--------------------------------|
| Frontend         | React + TypeScript + Vite      |
| Styling          | Tailwind CSS                   |
| State Mgmt       | React Hooks                    |
| Backend-as-a-Service | Supabase (DB, Auth, Storage, Realtime) |
| File Upload      | Supabase Storage + `react-dropzone` |
| Notifications    | `react-hot-toast`              |
| File Compression | JSZip for ZIP downloads        |

---

##  Architecture Highlights

-  **LocalStorage Auth** — Persist guest info across sessions  
-  **Supabase Storage** — Store and serve event photos  
-  **Realtime Events** — Postgres triggers via Supabase channels  
-  **Event Isolation** — Every event is scoped to a unique code  
-  **Organizer Mode** — Secure with unique organizer codes  
-  **Cover Image Upload** — Each event has a customizable hero image  

---

##  Project Structure

```

event-photo-upload/
├── src/
│   ├── components/      # UI modules (Upload, Access, Dashboard)
│   ├── lib/             # Supabase client config
│   ├── App.tsx          # App shell + routing logic
│   ├── index.css        # Tailwind directives
│   └── main.tsx         # Entry point
├── supabase/            # Database migrations
├── public/              # Static assets
├── tailwind.config.js   # Styling config
├── vite.config.ts       # Build config

````

---

##  Getting Started

```bash
git clone https://github.com/your-username/event-photo-upload.git
cd EventUpload
npm install
npm run dev
````

> ⚠️ Requires a [Supabase](https://supabase.com) project with:
>
> * `events` and `photos` tables
> * Supabase Storage buckets: `photos` and `covers`
> * RLS policies for public insert/select access

---

##  Sample `.env`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

##  UI Screens

| Guest Upload                                                  | Organizer Dashboard                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| ![Upload Screen](https://source.unsplash.com/400x300/?upload) | ![Dashboard](https://source.unsplash.com/400x300/?dashboard,event) |

---

##  License

[MIT](LICENSE)

---

##  Inspiration

> Created to solve the chaos of collecting photos after weddings, parties, and meetups. No app downloads, no signups. Just magic links and shared memories.

---

##  Want to Contribute?

Pull requests are welcome! Got a feature idea? Open an issue. Let’s make event photo sharing effortless for everyone.

```
