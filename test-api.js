// Test script to directly test the API endpoint
const testBroadcasterClick = async () => {
  try {
    console.log('Testing broadcaster click API...');
    
    const response = await fetch('http://localhost:3000/api/broadcaster-clicks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ broadcasterIds: [1] }), // Test with ID 1
    });
    
    const result = await response.json();
    console.log('API Response:', result);
    console.log('Status:', response.status);
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
};

testBroadcasterClick();
