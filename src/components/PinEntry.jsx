import React, { useState } from 'react';

export default function PinEntry({ onPinSubmit }) {
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (pin.length === 4 && /^\d{4}$/.test(pin)) {
        onPinSubmit(pin);
        setErrorMessage('');
    } else {
        setErrorMessage('Please enter a valid 4-digit PIN.');
    }
  };

  return (
    <section className="upload upload__section" aria-label="PIN Entry">
      <div className="upload__header">
        <h2 className="upload__title">Enter PIN</h2>
        <p className="upload__hint">Enter the 4-digit PIN from Telegram.</p>
      </div>

      <form onSubmit={handleSubmit} className="upload__actions">
        <input
          type="text"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          maxLength="4"
          placeholder="1234"
          className="options__input"
          style={{width: '100px', textAlign: 'center'}}
        />
        <button type="submit" className="btn btn--primary">
          Get Document
        </button>
      </form>

      {errorMessage && (
        <div role="alert" className="alert alert--error" aria-live="assertive">{errorMessage}</div>
      )}
    </section>
  );
}