import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import axios from 'axios';

// The backend URL is now defined directly for this component.
const BACKEND_URL = process.env.BACKEND_URL;

const GoogleAuthButton = () => {
  // Destructure the login function from your custom AuthContext
  const { login } = useAuth();

  useEffect(() => {
    /**
     * Loads the Google Identity Services script dynamically.
     * This is an asynchronous function that returns a Promise.
     * @returns {Promise<boolean>} A promise that resolves when the script is loaded.
     */
    const loadGoogleScript = () => {
      return new Promise((resolve, reject) => {
        // Check if the script is already loaded to avoid duplicates
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
     * Initializes the Google One Tap and Sign-in with Google button.
     * This function is called once the Google script has been loaded.
     */
    const initializeGoogleLogin = async () => {
      try {
        await loadGoogleScript();
        // Check if the google object is available on the window
        if (!window.google) {
          console.error('Google Identity Services script not loaded.');
          return;
        }
        window.google.accounts.id.initialize({
          // Replace with your actual client ID for production
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse, // The function to call after a successful login
        });
        const buttonContainer = document.getElementById('google-login-button');
        if (buttonContainer && buttonContainer.childElementCount === 0) {
          // Render the Google login button inside the specified container
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
          });
        }
      } catch (error) {
        console.error('Error during Google login initialization:', error);
      }
    };

    initializeGoogleLogin();
    // The empty dependency array ensures this effect runs only once on mount
  }, []);

  const handleCredentialResponse = async (response) => {
    const idToken = response.credential;
    try {
      // Send the ID token to your backend for verification and authentication
      const backendResponse = await axios.post(`${BACKEND_URL}/api/main/auth/google-login/`, {
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

  return (
    <div>
      {/* This div will be replaced by the Google login button */}
      <div id="google-login-button"></div>
      <div id="error-message" style={{ marginTop: '10px' }}></div>
    </div>
  );
};

export default GoogleAuthButton;
