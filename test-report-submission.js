import fetch from 'node-fetch';

async function testReportSubmission() {
  try {
    console.log('Testing report submission...');
    
    // First, let's try to login as inspector
    console.log('1. Attempting to login as inspector...');
    const loginResponse = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'username=inspector&password=password123'
    });
    
    console.log('Login response status:', loginResponse.status);
    console.log('Login response headers:', Object.fromEntries(loginResponse.headers.entries()));
    
    // Extract session cookie
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookieHeader);
    
    if (!setCookieHeader) {
      console.log('❌ No session cookie received from login');
      return;
    }
    
    const sessionCookie = setCookieHeader.split(';')[0];
    console.log('Session cookie:', sessionCookie);
    
    // Now try to submit a report
    console.log('2. Attempting to submit report...');
    const reportData = {
      reportType: 'household',
      address: '123 Test Street',
      barangay: 'Test Barangay',
      municipality: 'Test Municipality',
      latitude: '14.5995',
      longitude: '120.9842',
      reportData: {
        householdHead: 'Test Head',
        occupants: '5',
        toiletType: 'water_sealed',
        waterSource: 'piped',
        wasteDisposal: 'collected',
        compliance: 'fully_compliant',
        observations: 'Test observations'
      }
    };
    
    const reportResponse = await fetch('http://localhost:3000/user/report/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie
      },
      body: JSON.stringify(reportData)
    });
    
    console.log('Report submission status:', reportResponse.status);
    const responseText = await reportResponse.text();
    console.log('Report submission response:', responseText);
    
    if (reportResponse.ok) {
      console.log('✅ Report submission successful!');
    } else {
      console.log('❌ Report submission failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testReportSubmission();