# Verify.ng

Verify.ng is a scam reporting and business verification platform built for helping people identify suspicious activity, report scams, and check whether a business or entity is legitimate.

## Features

- Home dashboard for quick access to key actions
- Scam reporting form for users to submit complaints
- Recent scams feed for public visibility
- Business verification workflow
- About and legal pages
- Installable app experience with a mobile-friendly interface
- Language-aware UI support

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase
- Lucide React

## Project Structure

- `src/pages/` — main app pages such as home, scam reporting, recent scams, and business verification
- `src/components/` — shared UI pieces like header, bottom navigation, and install prompt
- `src/lib/` — app logic and language context helpers
- `supabase/` — Supabase configuration and related database resources
- `public/` — static assets

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.local` file and configure your Supabase environment variables if required by your setup:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Check types:
   ```bash
   npm run typecheck
   ```

## Notes

This project integrates with Supabase for backend services and authentication-related flows. Make sure the required schema and data tables are configured before running the app in a production environment.

## License

This project is private and intended for internal or limited distribution unless otherwise stated.
