import { useCallback } from 'react';
import { toast } from 'react-toastify';

const useRazorpay = () => {
  const initiatePayment = useCallback((options) => {
    if (!window.Razorpay) {
      toast.error('Razorpay SDK not loaded. Please refresh the page.');
      return;
    }

    const rzp = new window.Razorpay({
      ...options,
      handler: function(response) {
        if (options.handler) {
          options.handler(response);
        }
      },
      modal: {
        ondismiss: function() {
        }
      }
    });

    rzp.on('payment.failed', function(response) {
      console.error('Payment failed:', response.error);
      toast.error(`Payment failed: ${response.error.description}`);
    });

    rzp.open();
  }, []);

  return { initiatePayment };
};

export default useRazorpay;