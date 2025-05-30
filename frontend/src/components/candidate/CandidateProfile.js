import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import CandidateHeader from './CandidateHeader';

function CandidateProfile() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const candidateId = localStorage.getItem('candidateId');

  const [candidateData, setCandidateData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    resumeLink: '',
    skills: [],
  });
  const [formData, setFormData] = useState({
    id: candidateId || '',
    name: '',
    email: '',
    phone: '',
    resumeLink: '',
    skills: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!token || !candidateId) {
      navigate('/login');
    } else {
      fetchCandidateData();
    }
  }, [token, candidateId, navigate]);

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const formatErrorMessage = (error) => {
    // Check various possible error response structures
    if (error.response) {
      const { data } = error.response;
      if (typeof data === 'string') return data;
      if (data?.message) return data.message;
      if (data?.error) return data.error;
      if (data?.errors) return data.errors.join(', ');
      if (typeof data === 'object') return 'An error occurred. Please try again.';
    }
    return error.message || 'An unexpected error occurred.';
  };

  const fetchCandidateData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/candidates/${candidateId}`, axiosConfig);
      setCandidateData(response.data);
      setFormData({
        id: candidateId,
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        resumeLink: response.data.resumeLink,
        skills: response.data.skills.join(', '), // Convert array to comma-separated string for form
        password: '', // Password is not fetched for security
      });
    } catch (error) {
      setMessage(`Error fetching candidate data: ${formatErrorMessage(error)}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare payload, converting skills string to array
      const payload = {
        id: formData.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        resumeLink: formData.resumeLink,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill), // Convert comma-separated string to array
        ...(formData.password && { password: formData.password }), // Include password only if non-empty
      };
      await axios.put(`${API_BASE_URL}/candidates/${candidateId}`, payload, axiosConfig);
      setMessage('Candidate details updated successfully!');
      setCandidateData({
        ...candidateData,
        ...payload,
        skills: payload.skills, // Ensure skills is an array
      });
      setFormData({
        ...formData,
        skills: payload.skills.join(', '), // Convert back to string for form
        password: '', // Clear password after submission
      });
      setIsEditing(false);
      // Update localStorage with new candidate details
      localStorage.setItem('candidateDetails', JSON.stringify({
        ...candidateData,
        ...payload,
        skills: payload.skills,
      }));
    } catch (error) {
      setMessage(`Error updating candidate data: ${formatErrorMessage(error)}`);
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
    localStorage.removeItem('candidateId');
    navigate('/login');
  };

  return (
    <div>
      <CandidateHeader />
      <div className="container py-5" style={{ marginTop: '80px' }}>
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#343a40' }}>Candidate Profile</h2>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} shadow-sm`} style={{ borderRadius: '8px' }}>
            {message}
          </div>
        )}

        {/* Candidate Details Card */}
        <div className="card shadow-lg mb-4" style={{ border: 'none', borderRadius: '12px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
          <div className="card-header bg-primary text-white" style={{ borderRadius: '12px 12px 0 0', padding: '20px' }}>
            <h5 className="mb-0">Candidate Information</h5>
          </div>
          <div className="card-body" style={{ padding: '30px' }}>
            {!isEditing ? (
              <div className="row g-3">
                <div className="col-12">
                  <h6 style={{ color: '#495057', fontWeight: '600' }}><strong>Name:</strong> {candidateData.name}</h6>
                </div>
                <div className="col-12">
                  <p style={{ color: '#495057' }}><strong>Email:</strong> {candidateData.email}</p>
                </div>
                <div className="col-12">
                  <p style={{ color: '#495057' }}><strong>Phone:</strong> {candidateData.phone}</p>
                </div>
                <div className="col-12">
                  <p style={{ color: '#495057' }}><strong>Resume:</strong>{' '}
                    <a href={candidateData.resumeLink} target="_blank" rel="noopener noreferrer">
                      {candidateData.resumeLink}
                    </a>
                  </p>
                </div>
                <div className="col-12">
                  <p style={{ color: '#495057' }}><strong>Skills:</strong> {candidateData.skills.join(', ')}</p>
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
                    <label htmlFor="name" className="form-label" style={{ color: '#495057', fontWeight: '500' }}>Name</label>
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
                    <label htmlFor="phone" className="form-label" style={{ color: '#495057', fontWeight: '500' }}>Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      style={{ borderRadius: '8px', border: '1px solid #ced4da' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="resumeLink" className="form-label" style={{ color: '#495057', fontWeight: '500' }}>Resume Link</label>
                    <input
                      type="url"
                      className="form-control"
                      id="resumeLink"
                      name="resumeLink"
                      value={formData.resumeLink}
                      onChange={handleInputChange}
                      required
                      style={{ borderRadius: '8px', border: '1px solid #ced4da' }}
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="skills" className="form-label" style={{ color: '#495057', fontWeight: '500' }}>Skills (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="skills"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g., Java, Spring Boot, MongoDB"
                      required
                      style={{ borderRadius: '8px', border: '1px solid #ced4da' }}
                    />
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

export default CandidateProfile;