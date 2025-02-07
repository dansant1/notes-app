export const login = async (email: string, password: string): Promise<{ access: string; refresh: string }> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }); 

    console.log("Response status:", response.status); 

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();

    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);

    return data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const refreshToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    throw new Error('No refresh token found');
  }

  const response = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }

  const data = await response.json();
  localStorage.setItem('access_token', data.access);
  return data.access;
};
  
export const register = async (email: string, password: string): Promise<{ access: string; refresh: string }> => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, username: email }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const loginData = await login(email, password);

    return loginData;
  } catch (error) {
    console.error('Error during registration or login:', error);
    throw error;
  }
};
  
export const getToken = (): string | null => {
    return localStorage.getItem("access_token");
};

export const logout = (): void => {
    localStorage.removeItem("access_token");
};