
import axios from 'axios';
export const createClient = (baseURL: string, token?: string) => {
  const api = axios.create({ baseURL });
  api.interceptors.request.use((c) => { if (token) c.headers.Authorization = `Bearer ${token}`; return c; });
  return {
    profiles: {
      upsert: (payload: any) => api.post('/v1/profiles', payload).then(r => r.data),
    },
    match: {
      run: (payload: any) => api.post('/v1/match', payload).then(r => r.data),
    },
    assess: {
      run: (payload: any) => api.post('/v1/assess/run', payload).then(r => r.data),
    },
    career: {
      recommend: (payload: any) => api.post('/v1/career/recommend', payload).then(r => r.data),
    },
  };
};
