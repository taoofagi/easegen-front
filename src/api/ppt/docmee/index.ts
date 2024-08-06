// index.ts
import axios from 'axios';

interface ApiResponse {
  data: {
    token: string;
    expireTime: number;
    uid: string;
  };
  code: number;
  message: string;
}

async function createApiToken(apiKey: string, uid?: string, limit?: number): Promise<string | null> {
  const url = 'https://docmee.cn/api/user/createApiToken';
  const headers = {
    'Content-Type': 'application/json',
    'Api-Key': apiKey,
  };
  const data = {
    uid: uid || '',
    limit: limit || null,
  };

  try {
    const response = await axios.post<ApiResponse>(url, data, { headers });
    if (response.data.code === 0) {
      return response.data.data.token;
    } else {
      console.error('Error in response:', response.data.message);
      return null;
    }
  } catch (error) {
    console.error('Error fetching token:', error);
    return null;
  }
}

export { createApiToken };