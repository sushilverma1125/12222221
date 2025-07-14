import axios from "axios";
import { logFrontend } from "./logger";

const BASE_URL = "http://localhost:4000";

export interface ShortenUrlRequest {
  url: string;
  validity?: number;  // minutes
  shortcode?: string;
}

export interface ShortenUrlResponse {
  shortLink: string;
  expiry: string;
}

export async function shortenUrl(data: ShortenUrlRequest): Promise<ShortenUrlResponse> {
  try {
    const response = await axios.post<ShortenUrlResponse>(`${BASE_URL}/shorturls`, data);
    await logFrontend("info", "api", `Short URL created: ${response.data.shortLink}`);
    return response.data;
  } catch (error: any) {
    await logFrontend("error", "api", `Shorten URL failed: ${error.message}`);
    throw error;
  }
}

export interface UrlStats {
  originalUrl: string;
  createdAt: string;
  expiry: string;
  totalClicks: number;
  clicks: Array<{ timestamp: string; referrer: string | null; location: string }>;
}

export async function getUrlStats(shortcode: string): Promise<UrlStats> {
  try {
    const response = await axios.get<UrlStats>(`${BASE_URL}/shorturls/${shortcode}`);
    await logFrontend("info", "api", `Fetched stats for shortcode: ${shortcode}`);
    return response.data;
  } catch (error: any) {
    await logFrontend("error", "api", `Get URL stats failed: ${error.message}`);
    throw error;
  }
}
