import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import CompanyHeader from './CompanyHeader';
import 'bootstrap-icons/font/bootstrap-icons.css';

function CompanyHome() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const companyId = localStorage.getItem('companyId');

  const [companyData, setCompanyData] = useState({ name: '', jobIds: [] });
  const [recentJobs, setRecentJobs] = useState([]);
  const [totalApplications, setTotalApplications] = useState(0);
  const [acceptedOfferedCount, setAcceptedOfferedCount] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !companyId) {
      navigate('/login');
    } else {
      fetchCompanyData();
      fetchRecentJobs();
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
    } catch (error) {
      setMessage('Error fetching company data: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchRecentJobs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/company/${companyId}`, axiosConfig);
      const jobs = response.data;
      // Sort jobs by creation date (assuming a `createdAt` field exists; adjust if different)
      const sortedJobs = jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentJobs(sortedJobs.slice(0, 5));

      // Fetch applications for all jobs to calculate total applications and Accepted/Offered counts
      let totalApps = 0;
      let acceptedOffered = 0;

      for (const job of jobs) {
        const appsResponse = await axios.get(`${API_BASE_URL}/job-applications/job/${job.id}`, axiosConfig);
        const applications = appsResponse.data;
        totalApps += applications.length;
        acceptedOffered += applications.filter(app => ['Accepted', 'Offered'].includes(app.status)).length;
      }

      setTotalApplications(totalApps);
      setAcceptedOfferedCount(acceptedOffered);
    } catch (error) {
      setMessage('Error fetching jobs or applications: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleView = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/${id}`, axiosConfig);
      const modal = new window.bootstrap.Modal(document.getElementById('viewJobModal'));
      modal.show();
      document.getElementById('modalJobDetails').innerHTML = `
        <h6><strong>Position:</strong> ${response.data.position}</h6>
        <p><strong>Location:</strong> ${response.data.location}</p>
        <p><strong>Experience:</strong> ${response.data.experience}</p>
        <p><strong>Description:</strong> ${response.data.description}</p>
        <p><strong>Skills:</strong> ${response.data.skills.join(', ')}</p>
        <p><strong>Job Type:</strong> ${response.data.jobType}</p>
      `;
    } catch (error) {
      setMessage('Error fetching job details: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div>
      <CompanyHeader />

      {/* Hero Section */}
      <section className="py-5 text-white" style={{ backgroundColor: '#2f88ec', marginTop: '6%', borderRadius: '0.5%' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="display-5 fw-bold">Empowering Your Hiring Journey</h1>
              <p className="lead">Welcome to your recruitment hub. Post jobs, manage applications, and connect with top talent—seamlessly.</p>
              <a href="/company" className="btn btn-primary btn-lg mt-3">Post a Job</a>
            </div>
            <div className="col-md-6 text-end d-none d-md-block">
              <img src="https://cdn-icons-png.flaticon.com/512/2920/2920030.png" alt="Company illustration" className="img-fluid" style={{ maxHeight: '300px' }} />
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
                  <i className="bi bi-bar-chart-fill fs-1 text-primary"></i>
                  <h5 className="mt-3">Real-time Insights</h5>
                  <p>Track job stats and performance instantly on your dashboard.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <i className="bi bi-people-fill fs-1 text-success"></i>
                  <h5 className="mt-3">Manage Applicants</h5>
                  <p>Filter, track, and review applicants with ease.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <i className="bi bi-pencil-square fs-1 text-warning"></i>
                  <h5 className="mt-3">Quick Posting</h5>
                  <p>Create new job posts within minutes, right from the dashboard.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Section */}
      <div className="container py-5">
        <h2 className="mb-4 fw-bold">Welcome, {companyData.name || 'Company'}!</h2>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} shadow-sm`} style={{ borderRadius: '8px' }}>
            {message}
          </div>
        )}

        {/* Quick Stats */}
        <div className="row g-4 mb-4">
          {[
            { label: 'Active Job Postings', count: companyData.jobIds.length, color: 'primary' },
            { label: 'Applications Received', count: totalApplications, color: 'success' },
            { label: 'Applications Accepted/Offered', count: acceptedOfferedCount, color: 'warning' },
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
              <a href="/company" className="btn btn-success">Post a New Job</a>
              <a href="/capplications" className="btn btn-primary">View Applications</a>
              <a href="/companyProfile" className="btn btn-warning">Edit Profile</a>
            </div>
          </div>
        </div>

        {/* Recent Job Postings (Card Format) */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Recent Job Postings</h5>
          </div>
          <div className="card-body">
            {recentJobs.length === 0 ? (
              <p>No jobs posted yet.</p>
            ) : (
              <div className="row g-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="col-md-6 col-lg-4">
                    <div className="card shadow-sm h-100 border-0" style={{ borderRadius: '12px' }}>
                      <div className="card-body">
                        <h5 className="card-title text-primary">{job.position}</h5>
                        <p className="text-muted mb-2">Location: {job.location}</p>
                        <p className="mb-2">Job Type: {job.jobType}</p>
                        <button
                          className="btn btn-outline-info btn-sm"
                          onClick={() => handleView(job.id)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <a href="/capplications" className="btn btn-link mt-4">View All Jobs</a>
          </div>
        </div>

        {/* Job Details Modal */}
        <div className="modal fade" id="viewJobModal" tabIndex="-1" aria-labelledby="viewJobModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title" id="viewJobModalLabel">Job Details</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body" id="modalJobDetails"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyHome;