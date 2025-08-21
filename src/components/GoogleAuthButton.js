import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

// The backend URL is now defined directly for this component.
const BACKEND_URL = process.env.REACT_APP_API_URL;

const GoogleAuthButton = () => {
  // Destructure the login function from your custom AuthContext
  const { login } = useAuth();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const handleCredentialResponse = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    try {
      // Send the ID token to your backend for verification and authentication
      const backendResponse = await axios.post(`${BACKEND_URL}/main/auth/google-login/`, {
        id_token: idToken,
      });
      const data = backendResponse.data;
      if (data.tokens && data.tokens.access && data.tokens.refresh && data.user) {
        // Store the tokens in local storage for future API calls
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        // Call the login function from your AuthContext to update the application state
        login(data.user);
        toast.success('Login successful!');
      } else {
        throw new Error('Invalid response from backend');
      }
    } catch (err) {
        if (err.response && err.response.data) {
          const errorData = err.response.data;
          if (typeof errorData.error === 'string') {
            toast.error(errorData.error);
          } else if (typeof errorData.message === 'string') {
            toast.error(errorData.message);
          } else {
            toast.error('An unknown error occurred. Please try again.');
          }
        } else {
          console.error('Backend error:', err);
          toast.error('Login failed. Please try again.');
        }
      }
  };

  const handleError = () => {
    toast.error('Google login failed. Please try again.');
  };

  useEffect(() => {
    // Set a timer to show loading state briefly, then assume Google is ready
    const timer = setTimeout(() => {
      setIsGoogleLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isGoogleLoaded) {
    return (
      <span className="text-gray-500 px-3 py-2 text-sm font-medium">
        Login
      </span>
    );
  }

  return (
    <div className="google-login-wrapper">
      <GoogleLogin
        onSuccess={handleCredentialResponse}
        onError={handleError}
        useOneTap={false}
      />
      <style jsx global>{`
        .google-login-wrapper [role="button"] {
          all: unset !important;
          background: none !important;
          border: none !important;
          box-shadow: none !important;
          color: #e5e5e5 !important;
          padding: 8px 12px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          transition: color 200ms ease !important;
          cursor: pointer !important;
          font-family: inherit !important;
          opacity: 1 !important;
        }
        .google-login-wrapper [role="button"]:hover {
          color: #f5e74f !important;
        }
        .google-login-wrapper [role="button"] * {
          display: none !important;
        }
        .google-login-wrapper [role="button"]::before {
          content: "Login" !important;
          display: inline !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          color: inherit !important;
        }
        .google-login-wrapper iframe {
          display: none !important;
        }
        .google-login-wrapper div {
          display: contents !important;
        }
      `}</style>
    </div>
  );
};

export default GoogleAuthButton;