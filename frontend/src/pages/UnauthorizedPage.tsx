import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}>
      <h1>403 - Forbidden</h1>
      <p>Sorry, you do not have permission to access this page.</p>
      <p>
        If you believe this is an error, please contact support.
      </p>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ marginRight: '10px', padding: '10px 15px', cursor: 'pointer' }}
        >
          Go Back
        </button>
        <Link to="/">
          <button style={{ padding: '10px 15px', cursor: 'pointer' }}>
            Go to Homepage
          </button>
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 