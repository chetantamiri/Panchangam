export interface RagPassage {
  sourceName: string;
  pageNumber: number;
  chunkIndex: number;
  text: string;
  score: number;
}

export interface VedAstroRagResponse {
  Status: string;
  Input: {
    CalculatorName: string;
    Type: string;
    Parameters: Array<{
      Name: string;
      Type: string;
      Value: string | number | null;
    }>;
  };
  Payload: RagPassage[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  passages?: RagPassage[];
  timestamp: string; // ISO string for better JSON compatibility
  isError?: boolean;
}
