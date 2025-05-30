import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import AdminHeader from './adminNavbar';
import 'bootstrap-icons/font/bootstrap-icons.css';

function AddAdminPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post(`${API_BASE_URL}/admins`, formData, axiosConfig);
      setMessage('Admin added successfully!');
      setFormData({ username: '', email: '', password: '' });
      setTimeout(() => navigate('/AdminPage'), 2000); // Redirect after 2 seconds
    } catch (error) {
      setMessage('Error adding admin: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AdminHeader />

      {/* Hero Section */}
      <section
        className="py-5 text-white text-center"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          minHeight: '200px',
          marginTop: '6.5%' ,
        }}
      >
        <div className="container">
          <h1 className="display-5 fw-bold animate__animated animate__fadeInDown">Add a New Admin</h1>
          <p className="lead animate__animated animate__fadeInUp animate__delay-1s">
            Expand your team by adding a new admin to manage the platform.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0 animate__animated animate__zoomIn">
                <div className="card-body p-4">
                  <h3 className="text-center mb-4 text-primary">New Admin Details</h3>

                  {message && (
                    <div
                      className={`alert ${
                        message.includes('Error') ? 'alert-danger' : 'alert-success'
                      } animate__animated animate__fadeIn`}
                      style={{ borderRadius: '8px' }}
                    >
                      {message}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Username Field */}
                    <div className="mb-3">
                      <label htmlFor="username" className="form-label fw-bold">
                        <i className="bi bi-person-fill me-2 text-primary"></i>Username
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                        required
                        style={{ borderRadius: '8px', padding: '10px' }}
                      />
                    </div>

                    {/* Email Field */}
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-bold">
                        <i className="bi bi-envelope-fill me-2 text-primary"></i>Email
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email"
                        required
                        style={{ borderRadius: '8px', padding: '10px' }}
                      />
                    </div>

                    {/* Password Field */}
                    <div className="mb-4">
                      <label htmlFor="password" className="form-label fw-bold">
                        <i className="bi bi-lock-fill me-2 text-primary"></i>Password
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                        style={{ borderRadius: '8px', padding: '10px' }}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="d-grid">
                      <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={loading}
                        style={{
                          borderRadius: '8px',
                          padding: '12px',
                          background: 'linear-gradient(90deg, #1e3a8a, #3b82f6)',
                          border: 'none',
                          transition: 'transform 0.2s ease',
                        }}
                        onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                        onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Adding...
                          </>
                        ) : (
                          'Add Admin'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Background */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'url(https://www.transparenttextures.com/patterns/light-paper-fibers.png)',
          opacity: 0.05,
          zIndex: -1,
        }}
      ></div>
    </div>
  );
}

export default AddAdminPage;