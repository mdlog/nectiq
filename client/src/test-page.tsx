import React from 'react';

export default function TestPage() {
    return (
        <div style={{ padding: '20px', backgroundColor: 'lightblue', color: 'black' }}>
            <h1>Test Page - React is Working!</h1>
            <p>If you can see this, React is rendering correctly.</p>
            <p>Current time: {new Date().toLocaleString()}</p>
        </div>
    );
}
