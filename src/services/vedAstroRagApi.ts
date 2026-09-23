import axios from './axios';
import { RagPassage, VedAstroRagResponse, ChatMessage } from './vedAstroRagTypes';

const VEDASTRO_BASE_URL = 'https://api.vedastro.org/api/Calculate';

/**
 * Searches classical Vedic texts using the VedAstro RAG API.
 * GET /api/Calculate/SearchSourceText/Query/{question}/TopK/5
 */
export const searchVedicTexts = async (question: string): Promise<RagPassage[]> => {
  const encodedQuestion = encodeURIComponent(question.trim());
  const url = `${VEDASTRO_BASE_URL}/SearchSourceText/Query/${encodedQuestion}/TopK/5`;

  try {
    const response = await axios.get<VedAstroRagResponse>(url, {
      timeout: 15000,
    });

    const data = response.data;

    // Check status and return payload
    if (data && data.Status === 'Pass' && Array.isArray(data.Payload)) {
      return data.Payload;
    }

    if (data && Array.isArray(data.Payload)) {
      return data.Payload;
    }

    return [];
  } catch (error: any) {
    console.error('Error fetching Vedic RAG passages:', error?.response?.data || error.message || error);
    throw error;
  }
};

/**
 * Programmatically cleans and merges RAG passages from classical texts.
 * Merges similar information, removes duplicates, and groups by source text.
 * Runs entirely client-side without requiring any external LLM keys.
 */
export const synthesizePassagesProgrammatically = (passages: RagPassage[]): string => {
  if (!passages || passages.length === 0) {
    return "I couldn't find a relevant reference in the available classical texts.";
  }

  // Helper to clean passage text
  const cleanText = (text: string): string => {
    return text
      // Remove HTML line breaks
      .replace(/<br\s*\/?>/gi, ' ')
      // Remove any other HTML tags
      .replace(/<\/?[^>]+(>|$)/g, '')
      // Remove page header patterns like: ---------------- page 56 of 135 -----------------
      .replace(/-+\s*page\s*\d+\s*of\s*\d+\s*-+/gi, '')
      // Remove book name headers like: 108 Uttara Kalamrita |
      .replace(/\d+\s+[A-Za-z\s]+\|\s+/gi, '')
      // Remove long lines of dashes or underscores
      .replace(/[-_]{3,}/g, ' ')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Group passages by sourceName
  const groups: Record<string, { texts: string[]; pages: number[] }> = {};

  passages.forEach((p) => {
    const book = p.sourceName.trim();
    if (!groups[book]) {
      groups[book] = { texts: [], pages: [] };
    }
    
    if (!groups[book].pages.includes(p.pageNumber)) {
      groups[book].pages.push(p.pageNumber);
    }

    const cleaned = cleanText(p.text);
    if (cleaned) {
      groups[book].texts.push(cleaned);
    }
  });

  const finalBookParagraphs: string[] = [];

  Object.entries(groups).forEach(([book, group]) => {
    const sentences: string[] = [];
    
    group.texts.forEach((text) => {
      // Split into sentences (by period, exclamation, or question mark followed by space or end of string)
      const matches = text.match(/[^.!?]+[.!?]+(\s+|$)/g) || [text];
      matches.forEach((sentence) => {
        const cleanedSentence = sentence.trim();
        if (cleanedSentence.length < 5) return; // skip very short fragments

        // Check for duplicates/near-duplicates (substring match or vice versa)
        const isDuplicate = sentences.some((existing) => {
          const eLower = existing.toLowerCase();
          const cLower = cleanedSentence.toLowerCase();
          return eLower.includes(cLower) || cLower.includes(eLower);
        });

        if (!isDuplicate) {
          sentences.push(cleanedSentence);
        }
      });
    });

    if (sentences.length > 0) {
      const mergedText = sentences.join(' ');
      const pagesStr = group.pages.sort((a, b) => a - b).join(', ');
      finalBookParagraphs.push(`From **${book}** (Page ${pagesStr}):\n${mergedText}`);
    }
  });

  if (finalBookParagraphs.length === 0) {
    return "I couldn't find a relevant reference in the available classical texts.";
  }

  return finalBookParagraphs.join('\n\n');
};

/**
 * Compatibility wrapper to maintain signature in chat UI.
 * Synthesizes retrieved passages programmatically.
 */
export const generateVedicAnswer = async (
  question: string,
  passages: RagPassage[],
  history: ChatMessage[]
): Promise<string> => {
  // Directly synthesize using programmatic function to avoid calling Gemini
  return synthesizePassagesProgrammatically(passages);
};
