import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import AdminHeader from './adminNavbar';
import { FaTrash, FaSearch, FaBuilding, FaBriefcase, FaFileAlt } from 'react-icons/fa';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './AdminCompany.css'; // Custom CSS for additional styling

function AdminCompany() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');

  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState({});
  const [applications, setApplications] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);

  // References for scrolling
  const companiesSectionRef = useRef(null);
  const jobsSectionRef = useRef(null);
  const applicationsSectionRef = useRef(null);

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchCompanies();
  }, [token, navigate]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/companies`, axiosConfig);
      setCompanies(response.data);
      await Promise.all(
        response.data.map(async (company) => {
          const jobsResponse = await axios.get(`${API_BASE_URL}/jobs/company/${company.id}`, axiosConfig);
          setJobs((prevJobs) => ({
            ...prevJobs,
            [company.id]: jobsResponse.data,
          }));
          await Promise.all(
            jobsResponse.data.map(async (job) => {
              const appsResponse = await axios.get(`${API_BASE_URL}/job-applications/job/${job.id}`, axiosConfig);
              setApplications((prevApps) => ({
                ...prevApps,
                [job.id]: appsResponse.data,
              }));
            })
          );
        })
      );
    } catch (error) {
      setMessage('Error fetching data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (window.confirm('Are you sure you want to delete this company and all its jobs/applications?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/companies/${companyId}`, axiosConfig);
        setCompanies(companies.filter((c) => c.id !== companyId));
        setJobs((prevJobs) => {
          const updatedJobs = { ...prevJobs };
          delete updatedJobs[companyId];
          return updatedJobs;
        });
        setApplications((prevApps) => {
          const updatedApps = { ...prevApps };
          Object.keys(updatedApps).forEach((jobId) => {
            if (jobs[companyId]?.some((job) => job.id === jobId)) delete updatedApps[jobId];
          });
          return updatedApps;
        });
        setMessage('Company and related data deleted successfully!');
        setSelectedCompanyId(null);
        setSelectedJobId(null);
      } catch (error) {
        setMessage('Error deleting company: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job and all its applications?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/jobs/${jobId}`, axiosConfig);
        const companyId = Object.keys(jobs).find((id) => jobs[id].some((job) => job.id === jobId));
        setJobs((prevJobs) => ({
          ...prevJobs,
          [companyId]: prevJobs[companyId].filter((job) => job.id !== jobId),
        }));
        setApplications((prevApps) => {
          const updatedApps = { ...prevApps };
          delete updatedApps[jobId];
          return updatedApps;
        });
        setMessage('Job and related applications deleted successfully!');
        setSelectedJobId(null);
        // Scroll to jobs section after deletion
        setTimeout(() => {
          jobsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } catch (error) {
        setMessage('Error deleting job: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/job-applications/${applicationId}`, axiosConfig);
        setApplications((prevApps) => {
          const updatedApps = { ...prevApps };
          for (let jobId in updatedApps) {
            updatedApps[jobId] = updatedApps[jobId].filter((app) => app.id !== applicationId);
          }
          return updatedApps;
        });
        setMessage('Application deleted successfully!');
        // Scroll to applications section after deletion
        setTimeout(() => {
          applicationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } catch (error) {
        setMessage('Error deleting application: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCompanyClick = (companyId) => {
    setSelectedCompanyId(companyId);
    setSelectedJobId(null);
    // Scroll to jobs section
    setTimeout(() => {
      jobsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleJobClick = (jobId) => {
    setSelectedJobId(jobId);
    // Scroll to applications section
    setTimeout(() => {
      applicationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleBackToCompanies = () => {
    setSelectedCompanyId(null);
    setSelectedJobId(null);
    // Scroll to companies section
    setTimeout(() => {
      companiesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleBackToJobs = () => {
    setSelectedJobId(null);
    // Scroll to jobs section
    setTimeout(() => {
      jobsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <AdminHeader />

      {/* Companies Section */}
      <section className="py-5 bg-light" ref={companiesSectionRef}>
        <div className="container">
          <h2 className="mb-4 text-center text-primary animate__animated animate__fadeInDown">
            Manage Companies
          </h2>

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

          {/* Search Bar */}
          <div className="mb-4">
            <div className="input-group shadow-sm">
              <span className="input-group-text bg-primary text-white">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ borderRadius: '0 8px 8px 0', padding: '10px' }}
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <p className="text-center text-muted">No companies found.</p>
          ) : (
            <div className="row g-4">
              {filteredCompanies.map((company) => (
                <div key={company.id} className="col-md-6 col-lg-4">
                  <div
                    className="card shadow-lg border-0 h-100 animate__animated animate__fadeInUp"
                    style={{ borderRadius: '12px', cursor: 'pointer' }}
                    onClick={() => handleCompanyClick(company.id)}
                  >
                    <div className="card-body p-4">
                      <h5 className="card-title text-primary">
                        <FaBuilding className="me-2" /> {company.name}
                      </h5>
                      <p className="text-muted mb-2">Location: {company.location}</p>
                      <p className="mb-2">Jobs Posted: {jobs[company.id]?.length || 0}</p>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCompany(company.id);
                        }}
                      >
                        <FaTrash /> Delete Company
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Jobs Section */}
      {selectedCompanyId && (
        <section className="py-5 bg-white" ref={jobsSectionRef}>
          <div className="container">
            <h3 className="mb-4 text-primary animate__animated animate__fadeInDown">
              Jobs by {companies.find((c) => c.id === selectedCompanyId)?.name}
            </h3>
            <div className="row g-4">
              {jobs[selectedCompanyId]?.length > 0 ? (
                jobs[selectedCompanyId].map((job) => (
                  <div key={job.id} className="col-md-6 col-lg-4">
                    <div
                      className="card shadow-lg border-0 h-100 animate__animated animate__fadeInUp"
                      style={{ borderRadius: '12px', cursor: 'pointer' }}
                      onClick={() => handleJobClick(job.id)}
                    >
                      <div className="card-body p-4">
                        <h5 className="card-title text-success">
                          <FaBriefcase className="me-2" /> {job.position}
                        </h5>
                        <p className="text-muted mb-2">Location: {job.location}</p>
                        <p className="mb-2">
                          Applications: {applications[job.id]?.length || 0}
                        </p>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJob(job.id);
                          }}
                        >
                          <FaTrash /> Delete Job
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted">No jobs posted by this company.</p>
              )}
            </div>

            {/* Applications Section */}
            {selectedJobId && (
              <div className="mt-5" ref={applicationsSectionRef}>
                <h4 className="mb-4 text-primary animate__animated animate__fadeInDown">
                  Applications for {jobs[selectedCompanyId]?.find((j) => j.id === selectedJobId)?.position}
                </h4>
                <div className="row g-4">
                  {applications[selectedJobId]?.length > 0 ? (
                    applications[selectedJobId].map((app) => (
                      <div key={app.id} className="col-md-6 col-lg-4">
                        <div className="card shadow-lg border-0 h-100 animate__animated animate__fadeInUp">
                          <div className="card-body p-4">
                            <h5 className="card-title text-info">
                              <FaFileAlt className="me-2" /> Application ID: {app.id.slice(-6)}
                            </h5>
                            <p className="text-muted mb-2">Candidate ID: {app.candidateId.slice(-6)}</p>
                            <p className="mb-2">Status: {app.status}</p>
                            <p className="mb-2">Qualification: {app.qualification}</p>
                            <a href={app.resumeLink} target="_blank" rel="noopener noreferrer" className="mb-2 d-block">
                              View Resume
                            </a>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteApplication(app.id);
                              }}
                            >
                              <FaTrash /> Delete Application
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted">No applications for this job.</p>
                  )}
                </div>
                <button
                  className="btn btn-secondary mt-4"
                  onClick={handleBackToJobs}
                >
                  Back to Jobs
                </button>
              </div>
            )}

            <button
              className="btn btn-secondary mt-4"
              onClick={handleBackToCompanies}
            >
              Back to Companies
            </button>
          </div>
        </section>
      )}

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

export default AdminCompany;