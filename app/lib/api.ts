import { apiCall, ErrorHandler } from "@/app/utils/errorHandler";
import { BaseError   } from "@/app/types/errors";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  /**
   * Fetch popular queries from the backend
   */
   subscribeToLatestQuestion(options: {
     onQuestion: (data: { key: string; value: string }) => void;
     onConnect?: () => void;
     onError?: (error: any) => void;
   }) {
     const url = `${API_URL}/query/updates`;
     let eventSource: EventSource | null = null;

     try {
       eventSource = new EventSource(url);

       eventSource.onopen = () => {
         options.onConnect?.();
       };

       eventSource.onmessage = (event) => {
         try {
           const data = JSON.parse(event.data);
           options.onQuestion(data);
         } catch (error) {
           ErrorHandler.logError(ErrorHandler.normalizeError(error), {
             operation: "parseLatestEvent",
             rawData: event.data
           });
         }
       };

       eventSource.onerror = (error) => {
         options.onError?.(error);
         ErrorHandler.logError(ErrorHandler.normalizeError(error), {
           operation: "eventStream",
           readyState: eventSource?.readyState
         });
       };

     } catch (error) {
       ErrorHandler.logError(ErrorHandler.normalizeError(error), {
         operation: "eventSourceConnection",
         rawData: error
       });
     }

     return () => {
       eventSource?.close();
     };
   },

  async getActiveConnection() {
    try {
      const response = await fetch(`${API_URL}/query/metrics`);
      const data = await response.json();
      return data;
    } catch (error) {
      ErrorHandler.logError(ErrorHandler.normalizeError(error), {
        operation: "getActiveConnection",
        rawData: error
      });
    }
  },
  /**
   * Generate command using AI
   */
  async generateCommand(payload: {
    content: string;
    key: string;
    question: string;
  }) {
    try {
      // Validate input before sending
      if (!payload.question || payload.question.trim().length === 0) {
        throw new BaseError("Please enter a question", 400, "VALIDATION_ERROR");
      }

      const data = await apiCall<{ answer: string }>(
        `${API_URL}/query/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          timeout: 45000, // 45 seconds for AI generation
        }
      );

      // Validate response
      if (!data.answer) {
        throw new BaseError(
          "No response generated. Please try again.",
          500,
          "EMPTY_RESPONSE"
        );
      }

      return data;
    } catch (error) {
      // Log error for debugging
      ErrorHandler.logError(ErrorHandler.normalizeError(error), {
        operation: "generateCommand",
        payload,
      });

      // Rethrow for component to handle
      throw error;
    }
  },

  /**
   * Post query to backend (currently commented out in original code)
   */
  async postQuery(key: string, value: string) {
    try {
      const data = await apiCall(
        `${API_URL}/query`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key, value }),
        }
      );

      return data;
    } catch (error) {
      // Log error for debugging
      ErrorHandler.logError(ErrorHandler.normalizeError(error), {
        operation: "postQuery",
        key,
      });

      // Rethrow for component to handle
      throw error;
    }
  },
};

/**
 * Wrapper for API calls with retry logic
 */
export const apiWithRetry = {
  // async getPopularQuery() {
  //   return ErrorHandler.retry(() => api.getPopularQuery(), {
  //     maxRetries: 2,
  //     shouldRetry: (error) => error.code === "NETWORK_ERROR" || error.statusCode >= 500,
  //   });
  // },

  async generateCommand(payload: Parameters<typeof api.generateCommand>[0]) {
    return ErrorHandler.retry(() => api.generateCommand(payload), {
      maxRetries: 1, // Only retry once for AI generation
      shouldRetry: (error) => error.code === "NETWORK_ERROR" || error.statusCode === 503,
    });
  },
};
