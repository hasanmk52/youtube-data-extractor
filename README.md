# YouTube Data Extractor

This project is a full-stack Next.js application that extracts YouTube video data—including title, description, transcript, and top-level comments—using the YouTube Data API and the `youtube-transcript-api` library. Users can input a YouTube URL, view the extracted data, and download it as a JSON file.

## Features

- **YouTube URL Input**: Enter a YouTube video URL to extract data.
- **Transcript Fetching**: Retrieves video transcripts using `youtube-transcript-api`.
- **Video Details & Comments**: Fetches video title, description, and up to 10 top-level comments using the YouTube Data API v3.
- **Download JSON**: Download the aggregated data as a JSON file.
- **Robust Error Handling**: Graceful handling of missing data, invalid URLs, and API errors.
- **Responsive UI**: Built with React and shadcn/ui for a modern, accessible experience.

## Project Structure

- `app/`
  - `page.tsx`: Main UI for input, extraction, and download.
  - `api/extract/route.ts`: Next.js API route for backend data aggregation.
- `lib/`: Utility functions.
- `public/`: Static assets (SVGs, favicon, etc).
- `.env.local`: Store your `YOUTUBE_API_KEY` securely (not checked into version control).
- `.taskmaster/tasks/tasks.json`: Taskmaster file for project task breakdown and tracking.

## Taskmaster-Driven Workflow

This project was planned and implemented using **Taskmaster**, a task management system that:

- Breaks down the project into granular, actionable tasks and subtasks (see `.taskmaster/tasks/tasks.json`).
- Tracks dependencies and progress for each feature.
- Ensures a systematic, testable, and maintainable development process.

**How Taskmaster Helped:**

- Defined clear backend and frontend milestones (API, UI, error handling, download, deployment).
- Ensured robust error handling and production readiness.
- Provided a transparent, step-by-step implementation and testing strategy.

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up environment variables:**
   - Create a `.env.local` file in the project root:
     ```env
     YOUTUBE_API_KEY=your_actual_youtube_api_key
     ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project is deployed and publicly accessible at:

👉 [https://youtube-data-extractor-r34i4e71h-hasan-kagalwalas-projects.vercel.app/](https://youtube-data-extractor-r34i4e71h-hasan-kagalwalas-projects.vercel.app/)

Deploy to [Vercel](https://vercel.com/) for serverless, production-ready hosting:

1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` and follow the prompts.
3. Set your environment variables in the Vercel dashboard.
4. Visit your deployed app and verify all features work as expected.
