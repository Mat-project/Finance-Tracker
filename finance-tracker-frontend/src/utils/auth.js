import axios from 'axios';

const TOKEN_KEY = 'finance_tracker_token';
const USER_KEY = 'finance_tracker_user';

export const setToken = (token, user = null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  }
};

export const getToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Token ${token}`;
  }
  return token;
};

export const getStoredUser = () => {
  const userStr = localStorage.getItem(USER_KEY);
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Error parsing stored user:', e);
    return null;
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete axios.defaults.headers.common['Authorization'];
};

export const isAuthenticated = () => {
  return !!getToken() && !!getStoredUser();
};

// Setup axios response interceptor to handle token expiration
export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Token might be expired or invalid
        removeToken();
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  // Request interceptor
  axios.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
};
