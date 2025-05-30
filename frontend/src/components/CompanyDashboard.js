import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import CompanyProfile from './CompanyProfile';
import CompanyHeader from './CompanyHeader';

function CompanyDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const companyId = localStorage.getItem('companyId');

  const [formData, setFormData] = useState({
    position: '',
    location: '',
    experience: '',
    description: '',
    skills: '',
    jobType: 'Full-time',
  });

  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState('');
  const [editingJob, setEditingJob] = useState(null);
  const [viewingJob, setViewingJob] = useState(null);

  useEffect(() => {
    if (!token || !companyId) {
      navigate('/login');
    } else {
      fetchJobs();
    }
  }, [token, companyId, navigate]);

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/company/${companyId}`, axiosConfig);
      setJobs(response.data);
    } catch (error) {
      setMessage('Error fetching jobs: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      position: formData.position,
      companyId,
      location: formData.location,
      experience: formData.experience,
      description: formData.description,
      skills: formData.skills.split(',').map((s) => s.trim()),
      jobType: formData.jobType,
    };
    try {
      if (editingJob) {
        await axios.put(`${API_BASE_URL}/jobs/${editingJob.id}`, payload, axiosConfig);
        setMessage('Job updated successfully!');
      } else {
        await axios.post(`${API_BASE_URL}/jobs`, payload, axiosConfig);
        setMessage('Job posted successfully!');
      }
      setFormData({
        position: '',
        location: '',
        experience: '',
        description: '',
        skills: '',
        jobType: 'Full-time',
      });
      setEditingJob(null);
      fetchJobs();
    } catch (error) {
      setMessage('Error: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleView = async (id) => {
    const response = await axios.get(`${API_BASE_URL}/jobs/${id}`, axiosConfig);
    setViewingJob(response.data);
    const modal = new window.bootstrap.Modal(document.getElementById('viewJobModal'));
    modal.show();
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      position: job.position,
      location: job.location,
      experience: job.experience,
      description: job.description,
      skills: job.skills.join(', '),
      jobType: job.jobType,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await axios.delete(`${API_BASE_URL}/jobs/${id}`, axiosConfig);
        setMessage('Job deleted successfully!');
        fetchJobs();
      } catch (error) {
        setMessage('Error deleting job: ' + (error.response?.data?.message || error.message));
      }
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
      <div className="container py-5">
        <h2 className="text-center mb-4 fw-bold">Company Dashboard</h2>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
            {message}
          </div>
        )}

        {/* Job Form */}
        <div className="card shadow-lg mb-4">
          <div className="card-header bg-primary text-white">
            <h5>{editingJob ? 'Edit Job Posting' : 'Post a New Job'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <input type="text" className="form-control" name="position" placeholder="Position" value={formData.position} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6">
                  <input type="text" className="form-control" name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6">
                  <input type="text" className="form-control" name="experience" placeholder="Experience" value={formData.experience} onChange={handleInputChange} required />
                </div>
                <div className="col-md-6">
                  <select className="form-select" name="jobType" value={formData.jobType} onChange={handleInputChange}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div className="col-12">
                  <textarea className="form-control" rows="3" name="description" placeholder="Job Description" value={formData.description} onChange={handleInputChange} required></textarea>
                </div>
                <div className="col-12">
                  <input type="text" className="form-control" name="skills" placeholder="Skills (comma separated)" value={formData.skills} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="mt-3">
                <button type="submit" className="btn btn-success">{editingJob ? 'Update Job' : 'Post Job'}</button>
                {editingJob && (
                  <button type="button" className="btn btn-secondary ms-2" onClick={() => {
                    setEditingJob(null);
                    setFormData({
                      position: '',
                      location: '',
                      experience: '',
                      description: '',
                      skills: '',
                      jobType: 'Full-time',
                    });
                  }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white">
            <h5>Your Job Listings</h5>
          </div>
          <div className="card-body table-responsive">
            {jobs.length === 0 ? <p>No jobs posted yet.</p> : (
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Position</th>
                    <th>Location</th>
                    <th>Experience</th>
                    <th>Job Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.position}</td>
                      <td>{job.location}</td>
                      <td>{job.experience}</td>
                      <td>{job.jobType}</td>
                      <td>
                        <button className="btn btn-info btn-sm me-1" onClick={() => handleView(job.id)}>View</button>
                        <button className="btn btn-warning btn-sm me-1" onClick={() => handleEdit(job)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(job.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* View Modal */}
      <div className="modal fade" id="viewJobModal" tabIndex="-1" aria-labelledby="viewJobModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-scrollable">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5 className="modal-title" id="viewJobModalLabel">Job Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {viewingJob && (
                <>
                  <h6><strong>Position:</strong> {viewingJob.position}</h6>
                  <p><strong>Location:</strong> {viewingJob.location}</p>
                  <p><strong>Experience:</strong> {viewingJob.experience}</p>
                  <p><strong>Description:</strong> {viewingJob.description}</p>
                  <p><strong>Skills:</strong> {viewingJob.skills.join(', ')}</p>
                  <p><strong>Job Type:</strong> {viewingJob.jobType}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyDashboard;
