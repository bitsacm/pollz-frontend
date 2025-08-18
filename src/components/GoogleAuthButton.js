import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

// The backend URL is now defined directly for this component.
const BACKEND_URL = process.env.REACT_APP_API_URL;

const GoogleAuthButton = () => {
  // Destructure the login function from your custom AuthContext
  const { login } = useAuth();
  const buttonRef = useRef(null);
  const initializationAttempts = useRef(0);

  const handleCredentialResponse = async (response) => {
    const idToken = response.credential;
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
      console.error('Backend error:', err);
      toast.error('Login failed. Please try again.');
    }
  };

  useEffect(() => {
    /**
     * Loads the Google Identity Services script dynamically.
     */
    const loadGoogleScript = () => {
      return new Promise((resolve, reject) => {
        if (document.getElementById('google-jssdk')) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.id = 'google-jssdk';
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Failed to load Google script'));
        document.body.appendChild(script);
      });
    };

    /**
     * Renders the Google button
     */
    const renderGoogleButton = () => {
      if (!buttonRef.current || !window.google?.accounts?.id) {
        return false;
      }

      // Clear any existing button content
      buttonRef.current.innerHTML = '';
      
      try {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
        });
        return true;
      } catch (error) {
        console.error('Error rendering Google button:', error);
        return false;
      }
    };

    /**
     * Initializes Google login
     */
    const initializeGoogleLogin = async () => {
      try {
        await loadGoogleScript();
        
        if (!window.google?.accounts?.id) {
          console.error('Google Identity Services not available');
          return;
        }

        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        // Try to render the button
        if (!renderGoogleButton()) {
          // If rendering failed, try again after a short delay
          setTimeout(() => {
            if (initializationAttempts.current < 3) {
              initializationAttempts.current++;
              renderGoogleButton();
            }
          }, 500);
        }
      } catch (error) {
        console.error('Error during Google login initialization:', error);
      }
    };

    initializationAttempts.current = 0;
    initializeGoogleLogin();
  }, []);

  return (
    <div className="w-full">
      <div ref={buttonRef} className="w-full min-h-[40px] flex items-center justify-center"></div>
    </div>
  );
};

export default GoogleAuthButton;
