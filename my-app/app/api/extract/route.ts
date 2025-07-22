import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import TranscriptClient from "youtube-transcript-api";

// Only available on the server
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json(
        { error: "Missing YouTube URL." },
        { status: 400 }
      );
    }
    // Extract video ID from URL
    const videoIdMatch = url.match(/[?&]v=([\w-]{11})/);
    let videoId = videoIdMatch ? videoIdMatch[1] : null;
    if (!videoId) {
      // Try alternate format (youtu.be/VIDEOID)
      const altMatch = url.match(/youtu\.be\/([\w-]{11})/);
      if (altMatch) {
        videoId = altMatch[1];
      } else {
        return NextResponse.json(
          { error: "Invalid YouTube URL." },
          { status: 400 }
        );
      }
    }
    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured." },
        { status: 500 }
      );
    }
    // Use googleapis to fetch video data
    const youtube = google.youtube({ version: "v3", auth: YOUTUBE_API_KEY });
    let snippet = null;
    try {
      const videoRes = await youtube.videos.list({
        part: ["snippet"],
        id: [videoId],
      });
      if (!videoRes.data.items || videoRes.data.items.length === 0) {
        return NextResponse.json(
          { error: "Video not found or unavailable." },
          { status: 404 }
        );
      }
      snippet = videoRes.data.items[0].snippet;
    } catch (err: unknown) {
      let message = "Failed to fetch video details.";
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as Record<string, unknown>).message === "string"
      ) {
        message += " " + ((err as Record<string, unknown>).message as string);
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }

    // Fetch transcript using youtube-transcript-api
    let transcript: unknown = null;
    let transcriptError: string | null = null;
    try {
      const client = new TranscriptClient();
      await client.ready;
      transcript = await client.getTranscript(videoId);
    } catch (err: unknown) {
      transcript = null;
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as Record<string, unknown>).message === "string"
      ) {
        transcriptError = (err as Record<string, unknown>).message as string;
      } else {
        transcriptError = "Transcript not available.";
      }
    }

    // Fetch top-level comments using googleapis
    let comments: Array<{ author: string; text: string }> = [];
    let commentsError: string | null = null;
    try {
      const commentRes = await youtube.commentThreads.list({
        part: ["snippet"],
        videoId,
        maxResults: 10,
        textFormat: "plainText",
      });
      if (commentRes.data.items) {
        comments = commentRes.data.items.map((item: unknown) => {
          if (
            item &&
            typeof item === "object" &&
            "snippet" in item &&
            item.snippet &&
            typeof item.snippet === "object" &&
            "topLevelComment" in item.snippet &&
            item.snippet.topLevelComment &&
            typeof item.snippet.topLevelComment === "object" &&
            "snippet" in item.snippet.topLevelComment &&
            item.snippet.topLevelComment.snippet &&
            typeof item.snippet.topLevelComment.snippet === "object" &&
            "authorDisplayName" in item.snippet.topLevelComment.snippet &&
            "textDisplay" in item.snippet.topLevelComment.snippet
          ) {
            return {
              author: (
                item.snippet.topLevelComment.snippet as {
                  authorDisplayName: string;
                }
              ).authorDisplayName,
              text: (
                item.snippet.topLevelComment.snippet as { textDisplay: string }
              ).textDisplay,
            };
          }
          return { author: "", text: "" };
        });
      }
    } catch (err: unknown) {
      comments = [];
      if (
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as Record<string, unknown>).message === "string"
      ) {
        commentsError = (err as Record<string, unknown>).message as string;
      } else {
        commentsError = "Comments not available.";
      }
    }

    return NextResponse.json({
      videoId,
      title: snippet?.title,
      description: snippet?.description,
      channelTitle: snippet?.channelTitle,
      transcript,
      transcriptError,
      comments,
      commentsError,
    });
  } catch (error: unknown) {
    let message = "Internal server error.";
    if (
      error &&
      typeof error === "object" &&
      "message" in error &&
      typeof (error as Record<string, unknown>).message === "string"
    ) {
      message = (error as Record<string, unknown>).message as string;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
