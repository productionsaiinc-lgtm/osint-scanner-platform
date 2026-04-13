import React from 'react';

/**
 * PayPal Button Component
 * Renders the PayPal payment button with embedded styling and form
 */
export const PayPalButton: React.FC = () => {
  return (
    <div className="flex justify-center">
      <style>{`.pp-S6B9XRDM24NRC{text-align:center;border:none;border-radius:0.25rem;min-width:11.625rem;padding:0 2rem;height:2.625rem;font-weight:bold;background-color:#FFD140;color:#000000;font-family:"Helvetica Neue",Arial,sans-serif;font-size:1rem;line-height:1.25rem;cursor:pointer;}`}</style>
      <form
        action="https://www.paypal.com/ncp/payment/S6B9XRDM24NRC"
        method="post"
        target="_blank"
        style={{
          display: 'inline-grid',
          justifyItems: 'center',
          alignContent: 'start',
          gap: '0.5rem',
        }}
      >
        <input
          className="pp-S6B9XRDM24NRC"
          type="submit"
          value="Buy Now"
        />
        <img
          src="https://www.paypalobjects.com/images/Debit_Credit_APM.svg"
          alt="cards"
        />
        <section style={{ fontSize: '0.75rem' }}>
          Powered by{' '}
          <img
            src="https://www.paypalobjects.com/paypal-ui/logos/svg/paypal-wordmark-color.svg"
            alt="paypal"
            style={{ height: '0.875rem', verticalAlign: 'middle' }}
          />
        </section>
      </form>
    </div>
  );
};

export default PayPalButton;
