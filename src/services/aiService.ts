
// AI Service for text summarization
// This will be connected to your DeepSeek API

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export const summarizeText = async (text: string): Promise<string> => {
  // For now, return a placeholder response until API key is provided
  const API_KEY = localStorage.getItem('deepseek_api_key');
  
  if (!API_KEY) {
    return `📝 **Summary Preview**

I'd love to help summarize your content, but I need your DeepSeek API key to connect to the AI service. 

**Your content preview:**
${text.length > 200 ? text.substring(0, 200) + '...' : text}

**What I'll do once connected:**
• Create a concise, accessible summary
• Highlight key points and main ideas  
• Structure the content for easy listening
• Maintain important context and details

Please add your DeepSeek API key in the settings to enable AI summarization.`;
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating accessible, clear summaries. Summarize the following text in a way that is easy to understand when read aloud. Focus on key points, main ideas, and important details. Structure your response with clear sections if the content is long. Make it conversational and accessible.'
          },
          {
            role: 'user',
            content: `Please summarize this text: ${text}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'Unable to generate summary.';
  } catch (error) {
    console.error('Error calling DeepSeek API:', error);
    throw new Error('Failed to generate summary. Please check your API key and try again.');
  }
};

// Function to save API key to localStorage
export const saveApiKey = (apiKey: string) => {
  localStorage.setItem('deepseek_api_key', apiKey);
};

// Function to get API key from localStorage
export const getApiKey = (): string | null => {
  return localStorage.getItem('deepseek_api_key');
};

// Function to remove API key from localStorage
export const removeApiKey = () => {
  localStorage.removeItem('deepseek_api_key');
};
