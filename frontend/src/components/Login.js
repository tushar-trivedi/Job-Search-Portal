import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('candidate');
  const [message, setMessage] = useState('');
  const [showAdminOption, setShowAdminOption] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, {
        email,
        password,
        role: userType,
      });

      const { token, role, user } = response.data;
      localStorage.setItem('jwtToken', token);

      if (role.toLowerCase() === 'company') {
        localStorage.setItem('companyId', user.id);
        navigate('/company');
      } else if (role.toLowerCase() === 'admin') {
        localStorage.setItem('adminId', user.id);
        navigate('/Admindash')
      } else {
        localStorage.setItem('candidateId', user.id);
        localStorage.setItem('candidateDetails', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          resumeLink: user.resumeLink,
          skills: user.skills,
        }));
        navigate('/candidate-dashboard');
      }

      setMessage('Login successful!');
    } catch (error) {
      setMessage(error.response?.data?.errorMessage || 'Login failed. Please check your credentials.');
    }
  };

  const toggleAdminOption = () => {
    setShowAdminOption(!showAdminOption);
  };

  return (
    <>
      <div className="w-100 bg-secondary text-white py-3 px-4 d-flex justify-content-between align-items-center shadow-sm"
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
        <h4 className="m-0">jobsearchportal</h4>
      </div>

      <div className={`d-flex justify-content-center align-items-start ${showAdminOption ? 'admin-mode-bg' : ''}`}
        style={{ minHeight: '100vh', paddingTop: '6rem' }}>
        <div className="card p-4 shadow-lg rounded-4 bg-light" style={{ width: '100%', maxWidth: '450px' }}>
          {/* Bookmark Icon at Top Left */}
          <div className="position-absolute" style={{ top: '10px', left: '10px', zIndex: 1 }}>
            <span
              className="bookmark-icon"
              onClick={toggleAdminOption}
              style={{
                cursor: 'pointer',
                fontSize: '24px',
                color: '#0000FF', // Blue color for bookmark
                transition: 'all 0.3s ease',
              }}
            >
              👤
            </span>
          </div>

          <h2 className="text-center mb-4">Login</h2>

          {message && (
            <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-4">
              <input
                type="email"
                className="form-control"
                id="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label htmlFor="email">Email</label>
            </div>

            <div className="form-floating mb-4">
              <input
                type="password"
                className="form-control"
                id="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password">Password</label>
            </div>

            <div className="mb-4 text-center">
              <label className="form-label d-block">Login as:</label>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  id="loginCandidate"
                  name="role"
                  value="candidate"
                  checked={userType === 'candidate'}
                  onChange={() => setUserType('candidate')}
                />
                <label className="form-check-label" htmlFor="loginCandidate">Candidate</label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  id="loginCompany"
                  name="role"
                  value="company"
                  checked={userType === 'company'}
                  onChange={() => setUserType('company')}
                />
                <label className="form-check-label" htmlFor="loginCompany">Company</label>
              </div>
              {showAdminOption && (
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    id="loginAdmin"
                    name="role"
                    value="admin"
                    checked={userType === 'admin'}
                    onChange={() => setUserType('admin')}
                  />
                  <label className="form-check-label" htmlFor="loginAdmin">Admin</label>
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>

          <p className="text-center mt-3">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>

      {/* CSS for Background Change */}
      <style>
        {`
          .admin-mode-bg {
            background-color: lightblue; /* Light blue background when admin option is shown */
            transition: background-color 0.5s ease;
          }

          .bookmark-icon:hover {
            transform: scale(1.2);
            color: '#0000FF'; // Blue color on hover
          }
        `}
      </style>
    </>
  );
}

export default Login;