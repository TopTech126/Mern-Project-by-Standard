import axios from 'axios';
import { getCookie } from '../auth/helpers';

export let API;

if (process.env.NODE_ENV === 'production') {
  API = axios.create({ baseURL: '' });
} else {
  API = axios.create({ baseURL: 'http://localhost:5000' });
}

export const setHeaders = () => {
  const headers = {
    headers: {
      Accept: 'application/json',
      token: JSON.stringify(getCookie('token')),
      authType: JSON.stringify(getCookie('authType')),
    },
  };

  return headers;
};
