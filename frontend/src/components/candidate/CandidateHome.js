import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import CandidateHeader from './CandidateHeader';
import 'bootstrap-icons/font/bootstrap-icons.css';

function CandidateHome() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const candidateId = localStorage.getItem('candidateId');

  const [candidateData, setCandidateData] = useState({ name: '' });
  const [recentApplications, setRecentApplications] = useState([]);
  const [jobDetails, setJobDetails] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !candidateId) {
      navigate('/login');
    } else {
      fetchCandidateData();
      fetchRecentApplications();
    }
  }, [token, candidateId, navigate]);

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchCandidateData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/candidates/${candidateId}`, axiosConfig);
      setCandidateData(response.data);
    } catch (error) {
      setMessage('Error fetching candidate data: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchRecentApplications = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/job-applications/candidate/${candidateId}`, axiosConfig);
      const apps = response.data.slice(0, 5); // Limit to 5 recent applications
      setRecentApplications(apps);

      // Fetch job details for each application
      const jobMap = {};
      await Promise.all(
        apps.map(async (app) => {
          if (!jobDetails[app.jobId]) {
            try {
              const res = await axios.get(`${API_BASE_URL}/jobs/${app.jobId}`, axiosConfig);
              jobMap[app.jobId] = res.data;
            } catch {
              jobMap[app.jobId] = { position: 'Unknown', location: 'Unknown', jobType: 'Unknown' };
            }
          }
        })
      );
      setJobDetails(prev => ({ ...prev, ...jobMap }));
    } catch (error) {
      setMessage('Error fetching applications: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewApplication = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/job-applications/${id}`, axiosConfig);
      const app = response.data;
      const jobId = app.jobId;

      // Ensure job details are fetched
      if (!jobDetails[jobId]) {
        const jobRes = await axios.get(`${API_BASE_URL}/jobs/${jobId}`, axiosConfig);
        setJobDetails(prev => ({ ...prev, [jobId]: jobRes.data }));
      }

      const modal = new window.bootstrap.Modal(document.getElementById('viewApplicationModal'));
      modal.show();
      document.getElementById('modalApplicationDetails').innerHTML = `
        <h6><strong>Job Position:</strong> ${jobDetails[jobId]?.position || 'Unknown'}</h6>
        <p><strong>Location:</strong> ${jobDetails[jobId]?.location || 'Unknown'}</p>
        <p><strong>Job Type:</strong> ${jobDetails[jobId]?.jobType || 'Unknown'}</p>
        <p><strong>Qualification:</strong> ${app.qualification}</p>
        <p><strong>Resume:</strong> <a href="${app.resumeLink}" target="_blank" rel="noopener noreferrer">View Resume</a></p>
        <p><strong>Status:</strong> ${app.status}</p>
      `;
    } catch (error) {
      setMessage('Error fetching application details: ' + (error.response?.data?.message || error.message));
    }
  };

  // Calculate the number of offers received (status: "Offered")
  const offersReceived = recentApplications.filter(app => app.status === 'Offered').length;

  return (
    <div>
      <CandidateHeader />

      {/* Hero Section */}
      <section className="py-5 text-white" style={{ backgroundColor: '#add8e6', marginTop: '5%' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="display-5 fw-bold">Your Path to the Perfect Job</h1>
              <p className="lead">Welcome to your career hub. Search for jobs, manage applications, and showcase your skills to top employers.</p>
              <a href="/candidate-dashboard" className="btn btn-primary btn-lg mt-3">Search Jobs</a>
            </div>
            <div className="col-md-6 text-end d-none d-md-block">
              <img src="https://cdn-icons-png.flaticon.com/512/2920/2920030.png" alt="Candidate illustration" className="img-fluid" style={{ maxHeight: '300px' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <i className="bi bi-search fs-1 text-primary"></i>
                  <h5 className="mt-3">Explore Opportunities</h5>
                  <p>Find and apply to jobs that match your skills and interests.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <i className="bi bi-file-earmark-text-fill fs-1 text-success"></i>
                  <h5 className="mt-3">Track Applications</h5>
                  <p>Monitor the status of your applications in real-time.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <i className="bi bi-person-fill fs-1 text-warning"></i>
                  <h5 className="mt-3">Build Your Profile</h5>
                  <p>Create a standout profile to attract employers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Section */}
      <div className="container py-5">
        <h2 className="mb-4 fw-bold">Welcome, {candidateData.name || 'Candidate'}!</h2>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} shadow-sm`} style={{ borderRadius: '8px' }}>
            {message}
          </div>
        )}

        {/* Quick Stats */}
        <div className="row g-4 mb-4">
          {[
            { label: 'Applications Submitted', count: recentApplications.length, color: 'primary' },
            { label: 'Offers Received', count: offersReceived, color: 'success' },
            { label: 'Profile Views', count: 'N/A', color: 'warning' }
          ].map((stat, index) => (
            <div className="col-md-4" key={index}>
              <div className={`card shadow-sm text-center border-${stat.color}`} style={{ borderRadius: '12px' }}>
                <div className="card-body">
                  <h5 className={`text-${stat.color}`}>{stat.count}</h5>
                  <p>{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-dark text-white">
            <h5>Quick Actions</h5>
          </div>
          <div className="card-body">
            <div className="d-flex flex-wrap gap-3">
              <a href="/jobsearch" className="btn btn-success">Search Jobs</a>
              <a href="/candidate-applications" className="btn btn-primary">View Applications</a>
              <a href="/candidate-profile" className="btn btn-warning">Edit Profile</a>
            </div>
          </div>
        </div>

        {/* Recent Applications */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Recent Applications</h5>
          </div>
          <div className="card-body">
            {recentApplications.length === 0 ? (
              <p>No applications submitted yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Job Position</th>
                      <th>Location</th>
                      <th>Job Type</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((app) => (
                      <tr key={app.id}>
                        <td>{jobDetails[app.jobId]?.position || 'Loading...'}</td>
                        <td>{jobDetails[app.jobId]?.location || 'Loading...'}</td>
                        <td>{jobDetails[app.jobId]?.jobType || 'Loading...'}</td>
                        <td>{app.status}</td>
                        <td>
                          <button className="btn btn-outline-info btn-sm" onClick={() => handleViewApplication(app.id)}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <a href="/candidate-applications" className="btn btn-link mt-2">View All Applications</a>
          </div>
        </div>

        {/* Application Details Modal */}
        <div className="modal fade" id="viewApplicationModal" tabIndex="-1" aria-labelledby="viewApplicationModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title" id="viewApplicationModalLabel">Application Details</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body" id="modalApplicationDetails"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateHome;