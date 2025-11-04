
# Unified Inbox for Multi-Channel Customer Outreach

 This is a full-stack unified inbox application built for the Attack Capital associate position assignment[cite: 1]. The platform aggregates customer messages from **Twilio (SMS & WhatsApp)** into a single, real-time dashboard.

It's built with a modern, type-safe stack using **Next.js 14 (App Router)** for the frontend and API, **Postgres with Prisma** for the database, and **Better Auth** for secure, cookie-based authentication.

## 🎥 Video Walkthrough

 *(**Required Deliverable:** Record your 3-5 minute video and paste the link here)* [cite: 65]

[Link to your Loom or unlisted YouTube video]

## 💻 Tech Stack

  *  **Framework:** Next.js 14 (App Router) [cite: 7]
  * **Language:** TypeScript
  * **Database:** Postgres
  *  **ORM:** Prisma [cite: 8]
  *  **Authentication:** Better Auth [cite: 9]
  *  **Primary Integration:** Twilio (SMS & WhatsApp) [cite: 10]
  *  **Data Fetching:** React Query (`@tanstack/react-query`) [cite: 42]
  *  **Styling:** Inline CSS (for this demo) / Tailwind CSS [cite: 41]

## ✨ Key Features

  * **Secure Authentication:** Full sign-in, sign-out, and session management using Better Auth.
  * **Protected Routes:** `middleware.ts` protects all dashboard routes and redirects unauthenticated users to the `/login` page.
  * **Inbound Message Webhook:** A secure API endpoint (`/api/webhooks/twilio`) that receives all incoming SMS and WhatsApp messages. It validates the Twilio signature, finds or creates a contact, and saves the message to the database.
  * **Outbound Message API:** A secure API endpoint (`/api/messages`) that allows authenticated users to send messages via Twilio.
  * **Dynamic Conversation List:** The inbox sidebar fetches all unique contacts from the database and displays the last message received from each.
  * **Dynamic Message History:** Clicking a conversation fetches the full message history (inbound and outbound) for that specific contact.
  * **Real-Time UI Updates:** After sending a message, **React Query** automatically invalidates its cache and refetches both the conversation list and the message history, making the UI update instantly.

-----

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 1\. Clone the Repository

```bash
git clone [YOUR_GITHUB_REPO_URL]
cd unified-inbox
```

### 2\. Install Dependencies

```bash
npm install
```

### 3\. Set Up Environment Variables

Create a `.env` file in the root of the project and add the following variables.

```.env
# 1. DATABASE
# Get this from Supabase or your local Postgres instance
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# 2. AUTHENTICATION
# Generate a secure secret (e.g., from https://generate-secret.vercel.app/)
AUTH_SECRET="YOUR_AUTH_SECRET"
# (Optional) Add Google credentials for OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# 3. TWILIO
# Get these from your Twilio Console Dashboard
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="YOUR_TWILIO_AUTH_TOKEN"
# Your Twilio number (e.g., +15551234567 or whatsapp:+14155238886)
TWILIO_NUMBER="YOUR_TWILIO_PHONE_NUMBER"
```

### 4\. Run Database Migrations

This will apply the schema from `prisma/schema.prisma` to your database.

```bash
npx prisma migrate dev
```

*(Optional: Run `npx prisma studio` to view your database in a browser)*

### 5\. Run the Application

```bash
npm run dev
```

Your app will be available at `http://localhost:3000`.

### 6\. (Crucial) Test Twilio Webhooks with `ngrok`

Twilio cannot send webhooks to `localhost`. You must use `ngrok` to expose your local server.

1.  Run `ngrok http 3000` in a new terminal.
2.  Copy the `https://<random-string>.ngrok.io` URL.
3.  Go to your Twilio Phone Number settings in the console.
4.  Under "Messaging", set the "A MESSAGE COMES IN" webhook to `https://<random-string>.ngrok.io/api/webhooks/twilio` and set the method to `HTTP POST`.
5.  Send a test SMS or WhatsApp to your Twilio number to seed your database.

-----

## 🏛️ Architectural Decisions

  * **Next.js 14 App Router:** Chosen as the full-stack framework to co-locate UI, API routes, and middleware in a single, type-safe project.
  * **Prisma ORM:** Used for its excellent TypeScript support, which makes database interactions robust and prevents common errors.
  *  **Normalized `Message` Schema:** A key decision was to use a single, unified `Message` table for all communication channels[cite: 33]. A `channel` enum (`SMS`, `WHATSAPP`) and `direction` enum (`INBOUND`, `OUTBOUND`) allow the UI to be built from one data source.
  *  **React Query for Data Fetching:** Chosen over simple `useEffect` to handle caching, loading states, and error retries professionally[cite: 42]. We use query invalidation (`invalidateQueries`) to create a real-time feel after sending a message.
  * **Secure Webhooks:** The Twilio webhook uses `twilio.validateRequest` to verify the `X-Twilio-Signature` header, ensuring that all inbound requests are genuinely from Twilio and not a malicious actor.

## 📊 Database Schema (ERD)

 This is the `prisma` schema, visualized using Mermaid[cite: 60].

```mermaid
erDiagram
    User ||--o{ TeamMembership : "is part of"
    Team ||--o{ TeamMembership : "has"
    Team ||--o{ Contact : "owns"

    User ||--o{ Message : "sends"
    User ||--o{ Note : "writes"

    Contact ||--o{ Message : "history"
    Contact ||--o{ Note : "about"

    Message {
        string id PK
        string content
        string contactId FK
        string userId FK
        ChannelType channel
        MessageDirection direction
        MessageStatus status
        string twilioSid UK
        datetime createdAt
    }

    Contact {
        string id PK
        string teamId FK
        string phone UK
        string email UK
    }

    User {
        string id PK
        string email UK
        string name
    }

    Team {
        string id PK
        string name
    }

    TeamMembership {
        string id PK
        string userId FK
        string teamId FK
        UserRole role
    }
```

-----

## 📈 Integration Comparison Table

 This table compares the channels specified in the assignment[cite: 20, 64].

| Channel | Setup Complexity | Cost Model (Approx.) | Latency | Reliability |
| :--- | :--- | :--- | :--- | :--- |
| **Twilio SMS** | **Easy.** Buy number, set webhook. | Per-message (\~$0.0079) + Number rental (~$1/mo). | Very Low (seconds) | Very High (carrier-grade) |
| **Twilio WhatsApp** | **Medium.** Requires Facebook Business approval. Sandbox is easy. | Per-conversation (24hr window). \~$0.015 (user-initiated). | Very Low (real-time) | Very High (internet-based) |
| **Email (API)** | **Easy.** (e.g., Resend, Postmark). Integrate API key. | Free tier, then per-1000. Very cheap at scale. | Low (seconds to minutes) | High (can hit spam filters) |
| **Email (IMAP)** | **Very Hard.** Requires polling or IMAP `IDLE` commands. Inbound is complex. | Free (server cost only) | High (depends on poll interval) | Medium (complex to maintain) |

-----

## ⏭️ Future Improvements

  *  **Real-Time with WebSockets:** For a true real-time app, I would implement WebSockets (e.g., via Pusher, Ably, or Socket.io) to push inbound messages to the client instead of relying on manual refreshes[cite: 18].
  *  **Optimistic UI:** When sending a message, the UI could be updated *before* the API call finishes, providing a faster, more "optimistic" user experience[cite: 42].
  *  **Contact Profile:** Build the "Contact Profile" modal [cite: 36] to show contact history, add notes, and see all their metadata.
  *  **Analytics Dashboard:** Implement the (optional) analytics dashboard [cite: 5, 40] to track response times, channel volume, etc.
  *  **Full Channel Integration:** Add the optional Email, Twitter, and Facebook integrations[cite: 46, 47].