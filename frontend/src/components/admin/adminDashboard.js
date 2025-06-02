import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { FaBuilding, FaBriefcase, FaUsers, FaFileAlt, FaCheckCircle, FaChartLine } from 'react-icons/fa';
import 'bootstrap-icons/font/bootstrap-icons.css';
import AdminHeader from './adminNavbar';

function AdminPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const adminId = localStorage.getItem('adminId');

  const [companies, setCompanies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [acceptedApplications, setAcceptedApplications] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token || !adminId) {
      navigate('/login');
      return;
    }
    fetchStats();
  }, [token, adminId, navigate]);

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchStats = async () => {
    try {
      const [companiesRes, candidatesRes, jobsRes, applicationsRes, acceptedRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/companies`, axiosConfig),
        axios.get(`${API_BASE_URL}/candidates`, axiosConfig),
        axios.get(`${API_BASE_URL}/jobs`, axiosConfig),
        axios.get(`${API_BASE_URL}/job-applications`, axiosConfig),
        axios.get(`${API_BASE_URL}/job-applications/status/Accepted`, axiosConfig),
      ]);

      setCompanies(companiesRes.data);
      setCandidates(candidatesRes.data);
      setJobs(jobsRes.data);
      setApplications(applicationsRes.data);
      setAcceptedApplications(acceptedRes.data.length);
    } catch (error) {
      setMessage('Error fetching stats: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 401) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('adminId');
        navigate('/login');
      }
    }
  };

  return (
    <div>
      <AdminHeader/>
      {/* Hero Section */}
      <section className="py-5 text-white" style={{ backgroundColor: '#1e3a8a', marginTop: '6.5%' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h1 className="display-5 fw-bold">Welcome Master Admin</h1>
              <p className="lead">Manage your platform with ease—oversee companies, candidates, jobs, and applications seamlessly.</p>
              <a href="/admin-dashboard" className="btn btn-primary btn-lg mt-3">Get Started</a>
            </div>
            <div className="col-md-6 text-end d-none d-md-block">
              <img
                src="https://cdn-icons-png.flaticon.com/512/2920/2920030.png"
                alt="Admin illustration"
                className="img-fluid"
                style={{ maxHeight: '300px' }}
              />
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
                  <h5 className="mt-3">Platform Insights</h5>
                  <p>Monitor companies, candidates, jobs, and applications in real-time.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <i className="bi bi-shield-lock-fill fs-1 text-success"></i>
                  <h5 className="mt-3">Admin Control</h5>
                  <p>Manage user accounts and platform settings with full control.</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <i className="bi bi-clock-history fs-1 text-warning"></i>
                  <h5 className="mt-3">History Tracking</h5>
                  <p>Review past activities and platform history effortlessly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Dashboard Section */}
      <div className="container py-5">
        <h2 className="mb-4 fw-bold">Welcome, Master Admin!</h2>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} shadow-sm`} style={{ borderRadius: '8px' }}>
            {message}
          </div>
        )}

        {/* Quick Stats */}
        <div className="row g-4 mb-4">
          {[
            { label: 'Total Companies', count: companies.length, color: 'primary', icon: <FaBuilding className="fs-1" /> },
            { label: 'Total Candidates', count: candidates.length, color: 'success', icon: <FaUsers className="fs-1" /> },
            { label: 'Total Jobs', count: jobs.length, color: 'warning', icon: <FaBriefcase className="fs-1" /> },
            { label: 'Total Applications', count: applications.length, color: 'info', icon: <FaFileAlt className="fs-1" /> },
            { label: 'Accepted Applications', count: acceptedApplications, color: 'success', icon: <FaCheckCircle className="fs-1" /> },
            { label: 'Analysis', count: 'do', color: 'danger', icon: <FaChartLine className="fs-1" /> },
          ].map((stat, index) => (
            <div className="col-md-4" key={index}>
              <div
                className={`card shadow-sm text-center border-${stat.color}`}
                style={{ borderRadius: '12px' }}
              >
                <div className="card-body">
                  <div className={`text-${stat.color} mb-2`}>{stat.icon}</div>
                  {stat.count !== '' && <h5 className={`text-${stat.color}`}>{stat.count}</h5>}
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
              <a href="/adminCompany" className="btn btn-primary">Manage Companies</a>
              <a href="/adminCandidate" className="btn btn-success">Manage Candidates</a>
              <a href="/adminCompany" className="btn btn-warning">Manage Jobs</a>
              <a href="/addAdmin" className="btn btn-info">Add Admin</a>
              <a href="/adminAnalysis" className="btn btn-secondary">View History</a>
              <a href="/adminAnalysis" className="btn btn-danger">Analysis</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;