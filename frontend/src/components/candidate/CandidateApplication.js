import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import CandidateHeader from './CandidateHeader';

function CandidateApplication() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const candidateId = localStorage.getItem('candidateId');

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]); // New state for filtered applications
  const [message, setMessage] = useState('');
  const [viewingApplication, setViewingApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [jobDetails, setJobDetails] = useState({});

  useEffect(() => {
    if (!token || !candidateId) {
      navigate('/login');
    } else {
      fetchApplications();
    }
  }, [token, candidateId, navigate]);

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch all applications for the candidate
  const fetchApplications = async () => {
    try {
      // Fetch all applications without status filter
      const url = `${API_BASE_URL}/job-applications/candidate/${candidateId}`;
      const response = await axios.get(url, axiosConfig);
      const apps = response.data;
      setApplications(apps);
      setFilteredApplications(apps); // Initialize filteredApplications with all applications

      // Fetch job details for each application to display job information
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

  // View details of a specific application in a modal
  const handleViewApplication = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/job-applications/${id}`, axiosConfig);
      setViewingApplication(response.data);

      const jobId = response.data.jobId;
      if (!jobDetails[jobId]) {
        const jobRes = await axios.get(`${API_BASE_URL}/jobs/${jobId}`, axiosConfig);
        setJobDetails((prev) => ({
          ...prev,
          [jobId]: jobRes.data,
        }));
      }

      const modal = new window.bootstrap.Modal(document.getElementById('viewApplicationModal'));
      modal.show();
    } catch (error) {
      setMessage('Error viewing application: ' + (error.response?.data?.message || error.message));
    }
  };

  // Update the status of an application (e.g., Withdraw or Accept)
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(
        `${API_BASE_URL}/job-applications/${id}?status=${newStatus}`,
        {},
        axiosConfig
      );
      setMessage(`Application ${newStatus.toLowerCase()} successfully!`);
      setStatusUpdate('');
      
      // Update applications and filteredApplications
      const updatedApplications = applications.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      );
      setApplications(updatedApplications);
      setFilteredApplications(
        statusFilter
          ? updatedApplications.filter((app) => app.status === statusFilter)
          : updatedApplications
      );

      // Update viewingApplication if open
      if (viewingApplication && viewingApplication.id === id) {
        setViewingApplication({ ...viewingApplication, status: newStatus });
      }

      const modal = bootstrap.Modal.getInstance(document.getElementById('viewApplicationModal'));
      if (modal) modal.hide();
    } catch (error) {
      setMessage('Error updating status: ' + (error.response?.data?.message || error.message));
    }
  };

  // Handle status filter change
  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Apply status filter on frontend
  const applyFilters = () => {
    if (statusFilter) {
      const filtered = applications.filter((app) => app.status === statusFilter);
      setFilteredApplications(filtered);
    } else {
      setFilteredApplications(applications); // Show all applications if no filter
    }
  };

  // Clear filters and show all applications
  const clearFilters = () => {
    setStatusFilter('');
    setFilteredApplications(applications);
  };

  return (
    <div>
      <CandidateHeader />
      <div className="container py-5">
        <h2 className="text-center mb-4 fw-bold">My Job Applications</h2>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
            {message}
          </div>
        )}

        {/* Filters */}
        <div className="card shadow-lg mb-4">
          <div className="card-header bg-primary text-white">
            <h5>Filter Applications</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <select className="form-select" value={statusFilter} onChange={handleFilterChange}>
                  <option value="">Select Status</option>
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offered">Offered</option>
                  <option value="Withdrawn">Withdrawn</option>
                  <option value="Accepted">Accepted</option>
                </select>
              </div>
              <div className="col-12">
                <button className="btn btn-primary me-2" onClick={applyFilters}>Apply Filters</button>
                <button className="btn btn-secondary" onClick={clearFilters}>Clear Filters</button>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white">
            <h5>My Applications</h5>
          </div>
          <div className="card-body table-responsive">
            {filteredApplications.length === 0 ? (
              <p>No applications found.</p>
            ) : (
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Job Position</th>
                    <th>Location</th>
                    <th>Job Type</th>
                    <th>Qualification</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
                    <tr key={app.id}>
                      <td>{jobDetails[app.jobId]?.position || 'Loading...'}</td>
                      <td>{jobDetails[app.jobId]?.location || 'Loading...'}</td>
                      <td>{jobDetails[app.jobId]?.jobType || 'Loading...'}</td>
                      <td>{app.qualification}</td>
                      <td>{app.status}</td>
                      <td>
                        <button className="btn btn-info btn-sm" onClick={() => handleViewApplication(app.id)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* View Application Modal */}
        <div className="modal fade" id="viewApplicationModal" tabIndex="-1" aria-labelledby="viewApplicationModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title" id="viewApplicationModalLabel">Application Details</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {viewingApplication && (
                  <>
                    <p><strong>Job Position:</strong> {jobDetails[viewingApplication.jobId]?.position || 'Unknown'}</p>
                    <p><strong>Location:</strong> {jobDetails[viewingApplication.jobId]?.location || 'Unknown'}</p>
                    <p><strong>Job Type:</strong> {jobDetails[viewingApplication.jobId]?.jobType || 'Unknown'}</p>
                    <p><strong>Qualification:</strong> {viewingApplication.qualification}</p>
                    <p><strong>Resume:</strong> <a href={viewingApplication.resumeLink} target="_blank" rel="noopener noreferrer">View Resume</a></p>
                    <p><strong>Status:</strong> {viewingApplication.status}</p>

                    {(viewingApplication.status === 'Applied' || viewingApplication.status === 'Interviewing') && (
                      <div className="mt-3">
                        <button
                          className="btn btn-danger me-2"
                          onClick={() => handleStatusUpdate(viewingApplication.id, 'Withdrawn')}
                        >
                          Withdraw
                        </button>
                      </div>
                    )}
                    {viewingApplication.status === 'Offered' && (
                      <div className="mt-3">
                        <button
                          className="btn btn-success me-2"
                          onClick={() => handleStatusUpdate(viewingApplication.id, 'Accepted')}
                        >
                          Accept
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleStatusUpdate(viewingApplication.id, 'Withdrawn')}
                        >
                          Withdraw
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateApplication;