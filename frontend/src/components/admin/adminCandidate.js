import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import AdminHeader from './adminNavbar'; // Adjust path as per your project structure
import { FaTrash, FaSearch, FaUser, FaFileAlt } from 'react-icons/fa';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './AdminCandidate.css'; // Custom CSS for styling

function AdminCandidate() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');

  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  // References for scrolling
  const candidatesSectionRef = useRef(null);
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
    fetchCandidates();
  }, [token, navigate]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/candidates`, axiosConfig);
      setCandidates(response.data);
      await Promise.all(
        response.data.map(async (candidate) => {
          const appsResponse = await axios.get(`${API_BASE_URL}/job-applications/candidate/${candidate.id}`, axiosConfig);
          setApplications((prevApps) => ({
            ...prevApps,
            [candidate.id]: appsResponse.data,
          }));
        })
      );
    } catch (error) {
      setMessage('Error fetching data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCandidate = async (candidateId) => {
    if (window.confirm('Are you sure you want to delete this candidate and all their applications?')) {
      setLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/candidates/${candidateId}`, axiosConfig);
        setCandidates(candidates.filter((c) => c.id !== candidateId));
        setApplications((prevApps) => {
          const updatedApps = { ...prevApps };
          delete updatedApps[candidateId];
          return updatedApps;
        });
        setMessage('Candidate and related applications deleted successfully!');
        setSelectedCandidateId(null);
        // Scroll to candidates section after deletion
        setTimeout(() => {
          candidatesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      } catch (error) {
        setMessage('Error deleting candidate: ' + (error.response?.data?.message || error.message));
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
          for (let candidateId in updatedApps) {
            updatedApps[candidateId] = updatedApps[candidateId].filter((app) => app.id !== applicationId);
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

  const handleCandidateClick = (candidateId) => {
    setSelectedCandidateId(candidateId);
    // Scroll to applications section
    setTimeout(() => {
      applicationsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleBackToCandidates = () => {
    setSelectedCandidateId(null);
    // Scroll to candidates section
    setTimeout(() => {
      candidatesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <AdminHeader />

      {/* Candidates Section */}
      <section className="py-5 bg-light" ref={candidatesSectionRef}>
        <div className="container">
          <h2 className="mb-4 text-center text-primary animate__animated animate__fadeInDown">
            Manage Candidates
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
                placeholder="Search candidates..."
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
          ) : filteredCandidates.length === 0 ? (
            <p className="text-center text-muted">No candidates found.</p>
          ) : (
            <div className="row g-4">
              {filteredCandidates.map((candidate) => (
                <div key={candidate.id} className="col-md-6 col-lg-4">
                  <div
                    className="card shadow-lg border-0 h-100 animate__animated animate__fadeInUp"
                    style={{ borderRadius: '12px', cursor: 'pointer' }}
                    onClick={() => handleCandidateClick(candidate.id)}
                  >
                    <div className="card-body p-4">
                      <h5 className="card-title text-primary">
                        <FaUser className="me-2" /> {candidate.name}
                      </h5>
                      <p className="text-muted mb-2">Email: {candidate.email}</p>
                      <p className="mb-2">Phone: {candidate.phone}</p>
                      <p className="mb-2">Skills: {candidate.skills.join(', ')}</p>
                      <p className="mb-2">Applications: {applications[candidate.id]?.length || 0}</p>
                      <a
                        href={candidate.resumeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mb-2 d-block text-info"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Resume
                      </a>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCandidate(candidate.id);
                        }}
                      >
                        <FaTrash /> Delete Candidate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Applications Section */}
      {selectedCandidateId && (
        <section className="py-5 bg-white" ref={applicationsSectionRef}>
          <div className="container">
            <h3 className="mb-4 text-primary animate__animated animate__fadeInDown">
              Applications by {candidates.find((c) => c.id === selectedCandidateId)?.name}
            </h3>
            <div className="row g-4">
              {applications[selectedCandidateId]?.length > 0 ? (
                applications[selectedCandidateId].map((app) => (
                  <div key={app.id} className="col-md-6 col-lg-4">
                    <div className="card shadow-lg border-0 h-100 animate__animated animate__fadeInUp">
                      <div className="card-body p-4">
                        <h5 className="card-title text-info">
                          <FaFileAlt className="me-2" /> Application ID: {app.id.slice(-6)}
                        </h5>
                        <p className="text-muted mb-2">Job ID: {app.jobId.slice(-6)}</p>
                        <p className="mb-2">Status: {app.status}</p>
                        <p className="mb-2">Qualification: {app.qualification}</p>
                        <a
                          href={app.resumeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mb-2 d-block"
                        >
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
                <p className="text-center text-muted">No applications submitted by this candidate.</p>
              )}
            </div>
            <button
              className="btn btn-secondary mt-4"
              onClick={handleBackToCandidates}
            >
              Back to Candidates
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

export default AdminCandidate;