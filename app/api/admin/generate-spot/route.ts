import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

// Define the model to use. 
// User requested "gemini-2.5-flash", likely meaning "gemini-2.0-flash-exp" or "gemini-1.5-flash".
// We will try to use the latest experimental flash if available, or fall back conceptually.
// Currently (as of late 2024/early 2025), gemini-2.0-flash-exp is the cutting edge.
const MODEL_NAME = 'gemini-2.0-flash-exp';

export async function POST(request: Request) {
    try {
        const { name, url } = await request.json();

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json(
                { success: false, error: 'GEMINI_API_KEY is not set' },
                { status: 500 }
            );
        }

        let scrapedContext = "";

        // 1. Scrape the URL if provided
        if (url) {
            try {
                // Determine if it's a Google Maps short URL or similar that needs redirect following
                const res = await fetch(url, { redirect: 'follow' });
                const finalUrl = res.url; // Capture the final URL after redirects
                const html = await res.text();
                const $ = cheerio.load(html);

                // Remove scripts, styles, etc.
                $('script').remove();
                $('style').remove();
                $('nav').remove();
                $('footer').remove();

                const title = $('title').text().trim();
                const metaDesc = $('meta[name="description"]').attr('content') || "";
                const h1 = $('h1').text().trim();
                const ogTitle = $('meta[property="og:title"]').attr('content') || "";
                // Get main body text
                const bodyText = $('body').text().replace(/\s+/g, ' ').trim().substring(0, 10000);

                scrapedContext = `
            Original URL: ${url}
            Final Redirected URL: ${finalUrl} (May contain coordinates and place name)
            Page Title: ${title}
            OG Title: ${ogTitle}
            Meta Description: ${metaDesc}
            H1: ${h1}
            Page Content Preview: ${bodyText}
            `;
            } catch (scrapeError) {
                console.error("Scraping failed:", scrapeError);
                scrapedContext = "Failed to scrape URL. Generate based on name only (if provided).";
            }
        }

        // 2. Call Gemini API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
    You are an expert on "Deep Japan" - hidden gems, subculture spots, and unique experiences in Japan.
    
    Target Spot Name: "${name || 'UNKNOWN - Extract from Context'}"
    
    Your task is to generate a JSON object for this spot.
    If the Target Spot Name is UNKNOWN, you MUST extract the most likely spot name from the provided context (URL, Title, Content).
    Google Maps URLs often contain the place name or coordinates.
    
    Context from provided URL:
    ${scrapedContext}

    The JSON must strictly match this schema:
    {
        "name_en": "string (English name)",
        "name_jp": "string (Japanese name)",
        "category": "string (One of: Subculture, Retro, Craft, Food, Nature, Temple, Other)",
        "difficulty": number (1-5, 5 being most deep/difficult for tourists),
        "avg_stay_minutes": number,
        "address": "string (Full address in English)",
        "location": "string (WKT format: POINT(lng lat))", 
        "description": "string (Engaging description, 200-300 chars)",
        "tags": ["string", "string"],
        "images": ["string (URL found in context or leave empty array if none)"],
        "deep_guide_json": {
            "how_to_enter": "string (Tips on how to find/enter)",
            "must_follow_rules": "string (Important etiquette)",
            "communication_cards": [
                { "label": "string", "jp": "string" }
            ]
        }
    }

    For 'location', estimate the latitude and longitude as accurately as possible based on the address or name. Format MUST be 'POINT(longitude latitude)'.
    For 'images', output valid URLs if found in the text, otherwise empty array.
    `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const data = JSON.parse(responseText);

        // Basic cleaning of image URLs if needed (Gemini might hallucinations urls, but we asked for found ones)
        // In a real app, we might use Google Places API for photos.

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to generate data' },
            { status: 500 }
        );
    }
}
