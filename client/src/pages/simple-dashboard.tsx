import { useQuery } from "@tanstack/react-query";

export default function SimpleDashboard() {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    staleTime: 0
  });

  console.log("🎯 [SIMPLE-DASHBOARD] Rendering for user:", user?.username);

  return (
    <div style={{ 
      backgroundColor: '#000000', 
      color: '#ffffff', 
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Emergency Debug Banner */}
      <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        backgroundColor: '#ff0000',
        color: '#ffffff',
        padding: '15px',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        zIndex: 10000
      }}>
        🎯 SIMPLE DASHBOARD RENDERED - User: {user?.username || 'Loading...'} | Balance: {user?.balance || '0'} NTIQ
      </div>

      <div style={{ marginTop: '80px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>My Dashboard</h1>
        
        <div style={{ 
          backgroundColor: '#333333', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>Welcome, {user?.username || 'User'}!</h2>
          <p style={{ fontSize: '16px', color: '#cccccc' }}>
            Current Balance: <strong>{user?.balance || 0} NTIQ</strong>
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div style={{ backgroundColor: '#444444', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Stats</h3>
            <p>User ID: {user?.id}</p>
            <p>Username: {user?.username}</p>
            <p>Balance: {user?.balance} NTIQ</p>
          </div>

          <div style={{ backgroundColor: '#444444', padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Quick Actions</h3>
            <button 
              style={{
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
              onClick={() => window.location.href = '/home'}
            >
              Back to Home
            </button>
          </div>
        </div>

        <div style={{ marginTop: '40px', textAlign: 'center', color: '#888888' }}>
          <p>Dashboard component successfully rendered!</p>
          <p>Timestamp: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}