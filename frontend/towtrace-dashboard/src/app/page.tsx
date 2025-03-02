'use client';  // Marks this as a Client Component for interactivity

import React from 'react';
import axios, { AxiosError, isAxiosError } from 'axios';  // Import isAxiosError explicitly

export default function Home() {
  const fetchData = async () => {
    console.log('Button clicked!');  // Debug to confirm the button is clicked
    try {
      const response = await axios.get('https://towtrace-api.justin-michael-hobbs.workers.dev/api/test', {
        timeout: 5000, // 5-second timeout for the API request
      });
      console.log('API Response:', response.data);
      alert('API Success: ' + response.data); // Show a popup for confirmation
    } catch (error: unknown) {  // Explicitly type error as unknown for safety
      if (isAxiosError(error)) {  // Use the imported isAxiosError function
        const axiosError = error as AxiosError;  // Narrow to AxiosError for type safety
        console.error('Axios Error:', {
          message: axiosError.message,
          status: axiosError.response?.status,
          data: axiosError.response?.data,
          request: axiosError.request,
          config: axiosError.config,
        });
        alert('API Error: ' + axiosError.message); // Show error in a popup
      } else {
        console.error('Unexpected Error:', error);
        alert('Unexpected Error: ' + (error instanceof Error ? error.message : String(error)));
      }
    }
  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>TowTrace Dashboard</h1>
      <button 
        onClick={fetchData}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px', 
          cursor: 'pointer',  // Ensures the button looks clickable
          backgroundColor: '#007bff',  // Blue background for visibility
          color: '#fff',  // White text for contrast
          border: 'none',  // Removes default border
          borderRadius: '5px',  // Rounded corners for modern look
        }}
      >
        Test API
      </button>
    </div>
  );
}