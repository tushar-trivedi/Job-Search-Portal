import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';

function Signup() {
  const [userType, setUserType] = useState('candidate');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    resumeLink: '',
    skills: '',
    location: '',
    description: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      let payload;
      let url;
      if (userType === 'candidate') {
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          resumeLink: formData.resumeLink,
          skills: formData.skills.split(',').map(skill => skill.trim())
        };
        url = `${API_BASE_URL}/candidates`;
      } else {
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          location: formData.location,
          description: formData.description
        };
        url = `${API_BASE_URL}/companies`;
      }

      const response = await axios.post(url, payload);
      setMessage(`Successfully signed up as ${userType}!`);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error during signup. Please try again.');
    }
  };

  return (
    <>
    <div className="w-100 bg-secondary text-white py-3 px-4 d-flex justify-content-between align-items-center shadow-sm"
        style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
        <h4 className="m-0">jobsearchportal</h4>
      </div>
    <div className="d-flex justify-content-center align-items-start bg-light" style={{ minHeight: '100vh', paddingTop: '5%' }}>
      <div className="card p-4 shadow-sm border rounded" style={{ maxWidth: '600px', width: '100%' }}>
        <h2 className="text-center mb-4">Sign Up</h2>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
            {message}
          </div>
        )}

        <div className="mb-4 text-center">
          <h5 className="mb-2">Sign up as</h5>
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-outline-primary ${userType === 'candidate' ? 'active' : ''}`}
              onClick={() => setUserType('candidate')}
            >
              Candidate
            </button>
            <button
              type="button"
              className={`btn btn-outline-primary ${userType === 'company' ? 'active' : ''}`}
              onClick={() => setUserType('company')}
            >
              Company
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input type="password" className="form-control" name="password" value={formData.password} onChange={handleInputChange} required />
          </div>

          {userType === 'candidate' ? (
            <>
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-control" name="phone" value={formData.phone} onChange={handleInputChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Resume Link</label>
                <input type="url" className="form-control" name="resumeLink" value={formData.resumeLink} onChange={handleInputChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Skills (comma-separated)</label>
                <input type="text" className="form-control" name="skills" placeholder="e.g., Java, React" value={formData.skills} onChange={handleInputChange} required />
              </div>
            </>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">Location</label>
                <input type="text" className="form-control" name="location" value={formData.location} onChange={handleInputChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} required />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-success w-100">Sign Up</button>
        </form>

        <p className="mt-3 text-center">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
    </>
  );
}

export default Signup;
