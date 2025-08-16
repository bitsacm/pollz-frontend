import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const GoogleAuthButton = () => {
  const { login } = useAuth();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Send the Google access token to your Django backend
        const response = await authAPI.googleLogin({
          access_token: tokenResponse.access_token
        });
        
        // Store the Django auth tokens and user info
        const { tokens, user } = response.data;
        
        // Store tokens in localStorage for API interceptor
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        
        // Store user info in context
        login(user);
        
        toast.success('Login successful!');
      } catch (error) {
        console.error('Failed to authenticate with backend:', error);
        toast.error('Login failed. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      toast.error('Google login failed. Please try again.');
    },
  });

  return (
    <button
      onClick={() => googleLogin()}
      className="text-theme-light-gray hover:text-theme-warm-yellow px-3 py-2 text-sm font-medium transition-colors duration-200"
    >
      Login
    </button>
  );
};

export default GoogleAuthButton;