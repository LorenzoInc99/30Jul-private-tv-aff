// Check if broadcaster ID 37 exists in tvstations table
const checkTvstations = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/tvstations');
    const data = await response.json();
    console.log('TV Stations:', data);
    
    // Look for ID 37
    const station37 = data.find(station => station.id === 37);
    console.log('Station 37:', station37);
    
  } catch (error) {
    console.error('Error checking tvstations:', error);
  }
};

checkTvstations();
