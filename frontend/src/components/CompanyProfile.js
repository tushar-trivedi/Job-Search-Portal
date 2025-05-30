import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import CompanyHeader from './CompanyHeader';

function CompanyProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const companyId = localStorage.getItem('companyId');

  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    location: '',
    description: '',
    jobIds: [],
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    description: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!token || !companyId) {
      navigate('/login');
    } else {
      fetchCompanyData();
    }
  }, [token, companyId, navigate]);

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchCompanyData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/companies/${companyId}`, axiosConfig);
      setCompanyData(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        location: response.data.location,
        description: response.data.description,
        password: '', // Password is not fetched from API for security
      });
    } catch (error) {
      setMessage('Error fetching company data: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only include password in payload if it's non-empty
      const payload = {
        name: formData.name,
        email: formData.email,
        location: formData.location,
        description: formData.description,
        ...(formData.password && { password: formData.password }),
      };
      await axios.put(`${API_BASE_URL}/companies/${companyId}`, payload, axiosConfig);
      setMessage('Company details updated successfully!');
      setCompanyData({ ...companyData, ...payload });
      setFormData({ ...formData, password: '' }); // Clear password after submission
      setIsEditing(false);
    } catch (error) {
      setMessage('Error updating company data: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setMessage('');
    if (isEditing) {
      setFormData({ ...formData, password: '' }); // Clear password when canceling edit
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('companyId');
    navigate('/login');
  };

  return (
    <div>
      <CompanyHeader/>
   
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#343a40' }}>Company Profile</h2>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} shadow-sm`} style={{ borderRadius: '8px' }}>
            {message}
          </div>
        )}

        {/* Company Details Card */}
        <div className="card shadow-lg mb-4" style={{ border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
          <div className="card-header bg-primary text-white" style={{ borderRadius: '12px 12px 0 0', padding: '20px' }}>
            <h5 className="mb-0">Company Information</h5>
          </div>
          <div className="card-body" style={{ padding: '30px' }}>
            {!isEditing ? (
              <div className="row g-3">
                <div className="col-12">
                  <h6 style={{ color: '#495057', fontWeight: '600' }}><strong>Name:</strong> {companyData.name}</h6>
                </div>
                <div className="col-12">
                  <p style={{ color: '#495057' }}><strong>Email:</strong> {companyData.email}</p>
                </div>
                <div className="col-12">
                  <p style={{ color: '#495057' }}><strong>Location:</strong> {companyData.location}</p>
                </div>
                <div className="col-12">
                  <p style={{ color: '#495057' }}><strong>Description:</strong> {companyData.description}</p>
                </div>
                <div className="col-12">
                  <p style={{ color: '#495057' }}><strong>Job Postings:</strong> {companyData.jobIds.length}</p>
                </div>
                <div className="col-12">
                  <button
                    className="btn btn-warning"
                    onClick={handleEditToggle}
                    style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: '500' }}
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="name" className="form-label" style={{ color: '#495057', fontWeight: '500' }}>Company Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      style={{ borderRadius: '8px', border: '1px solid #ced4da' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="email" className="form-label" style={{ color: '#495057', fontWeight: '500' }}>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      style={{ borderRadius: '8px', border: '1px solid #ced4da' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="password" className="form-label" style={{ color: '#495057', fontWeight: '500' }}>New Password (optional)</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      style={{ borderRadius: '8px', border: '1px solid #ced4da' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="location" className="form-label" style={{ color: '#495057', fontWeight: '500' }}>Location</label>
                    <input
                      type="text"
                      className="form-control"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      style={{ borderRadius: '8px', border: '1px solid #ced4da' }}
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="description" className="form-label" style={{ color: '#495057', fontWeight: '500' }}>Description</label>
                    <textarea
                      className="form-control"
                      id="description"
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      style={{ borderRadius: '8px', border: '1px solid #ced4da' }}
                    ></textarea>
                  </div>
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-success me-2"
                      style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: '500' }}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleEditToggle}
                      style={{ borderRadius: '8px', padding: '10px 20px', fontWeight: '500' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;