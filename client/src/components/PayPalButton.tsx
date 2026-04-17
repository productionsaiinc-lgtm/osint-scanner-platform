import React, { useEffect } from 'react';

/**
 * PayPal Hosted Buttons Component
 * Renders the PayPal Hosted Button using the new PayPal SDK
 * The SDK is loaded in index.html and the button is rendered here
 */
export const PayPalButton: React.FC = () => {
  useEffect(() => {
    // Wait for PayPal SDK to load
    const loadPayPalButton = () => {
      if (window.paypal && window.paypal.HostedButtons) {
        try {
          window.paypal.HostedButtons({
            hostedButtonId: "VXXVRLTM4ZR68"
          }).render("#paypal-container-VXXVRLTM4ZR68");
        } catch (error) {
          console.error("Error rendering PayPal button:", error);
        }
      } else {
        // Retry if SDK not loaded yet
        setTimeout(loadPayPalButton, 100);
      }
    };

    // Check if DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadPayPalButton);
      return () => document.removeEventListener('DOMContentLoaded', loadPayPalButton);
    } else {
      loadPayPalButton();
    }
  }, []);

  return (
    <div className="flex justify-center">
      <div id="paypal-container-VXXVRLTM4ZR68"></div>
    </div>
  );
};

export default PayPalButton;

// Declare PayPal global types
declare global {
  interface Window {
    paypal?: {
      HostedButtons: (config: { hostedButtonId: string }) => {
        render: (selector: string) => void;
      };
    };
  }
}
