import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import CompanyHeader from './CompanyHeader';

function CompanyApplication() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const companyId = localStorage.getItem('companyId');

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [viewingApplication, setViewingApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [statusUpdate, setStatusUpdate] = useState('');
  const [candidateNames, setCandidateNames] = useState({});

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

  const fetchApplications = async (jobId) => {
    try {
      let url = `${API_BASE_URL}/job-applications/job/${jobId}`;
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }
      const response = await axios.get(url, axiosConfig);
      const apps = response.data;
      setApplications(apps);

      const nameMap = {};
      await Promise.all(apps.map(async (app) => {
        if (!candidateNames[app.candidateId]) {
          try {
            const res = await axios.get(`${API_BASE_URL}/candidates/${app.candidateId}`, axiosConfig);
            nameMap[app.candidateId] = res.data.name;
          } catch {
            nameMap[app.candidateId] = 'Unknown';
          }
        }
      }));

      setCandidateNames(prev => ({ ...prev, ...nameMap }));
    } catch (error) {
      setMessage('Error fetching applications: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleViewApplications = (jobId) => {
    setSelectedJobId(jobId);
    fetchApplications(jobId);
  };

  const handleViewApplication = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/job-applications/${id}`, axiosConfig);
      setViewingApplication(response.data);

      const candidateId = response.data.candidateId;
      if (!candidateNames[candidateId]) {
        const candidateRes = await axios.get(`${API_BASE_URL}/candidates/${candidateId}`, axiosConfig);
        setCandidateNames((prev) => ({
          ...prev,
          [candidateId]: candidateRes.data.name,
        }));
      }

      const modal = new window.bootstrap.Modal(document.getElementById('viewApplicationModal'));
      modal.show();
    } catch (error) {
      setMessage('Error viewing application: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleStatusUpdate = async (id) => {
    if (!statusUpdate) {
      setMessage('Please select a status to update.');
      return;
    }

    try {
      await axios.put(
        `${API_BASE_URL}/job-applications/${id}?status=${statusUpdate}`,
        null,
        axiosConfig
      );
      setMessage('Application status updated successfully!');
      setStatusUpdate('');
      fetchApplications(selectedJobId);

      const modal = bootstrap.Modal.getInstance(document.getElementById('viewApplicationModal'));
      if (modal) modal.hide();
    } catch (error) {
      setMessage('Error updating status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteJob = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await axios.delete(`${API_BASE_URL}/jobs/${id}`, axiosConfig);
        setMessage('Job deleted successfully!');
        setSelectedJobId(null);
        setApplications([]);
        fetchJobs();
      } catch (error) {
        setMessage('Error deleting job: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const applyFilters = () => {
    if (selectedJobId) {
      fetchApplications(selectedJobId);
    } else {
      setMessage('Please select a job to apply filters.');
    }
  };

  const clearFilters = () => {
    setStatusFilter('');
    if (selectedJobId) {
      fetchApplications(selectedJobId);
    }
  };

  return (
    <div>
      <CompanyHeader />
      <div className="container py-5">
        <h2 className="text-center mb-4 fw-bold">Company Job Applications</h2>

        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
            {message}
          </div>
        )}

        {/* Jobs Table */}
        <div className="card shadow-lg mb-4">
          <div className="card-header bg-dark text-white">
            <h5>Your Job Listings</h5>
          </div>
          <div className="card-body table-responsive">
            {jobs.length === 0 ? (
              <p>No jobs posted yet.</p>
            ) : (
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Position</th>
                    <th>Location</th>
                    <th>Job Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>{job.position}</td>
                      <td>{job.location}</td>
                      <td>{job.jobType}</td>
                      <td>
                        <button className="btn btn-info btn-sm me-1" onClick={() => handleViewApplications(job.id)}>View Applications</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteJob(job.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Applications Section */}
        {selectedJobId && (
          <>
            {/* Filters */}
            <div className="card shadow-lg mb-4">
              <div className="card-header bg-primary text-white">
                <h5>Filter Applications for {jobs.find((job) => job.id === selectedJobId)?.position}</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <select className="form-select" value={statusFilter} onChange={handleFilterChange}>
                      <option value="">Select Status</option>
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offered">Offered</option>
                      <option value="Rejected">Rejected</option>
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
                <h5>Applications for {jobs.find((job) => job.id === selectedJobId)?.position}</h5>
              </div>
              <div className="card-body table-responsive">
                {applications.length === 0 ? (
                  <p>No applications found for this job.</p>
                ) : (
                  <table className="table table-hover align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Candidate ID</th>
                        <th>Qualification</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td>{candidateNames[app.candidateId] || app.candidateId}</td>
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
          </>
        )}

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
                <p><strong>Candidate Name:</strong> {candidateNames[viewingApplication?.candidateId] || viewingApplication?.candidateId}</p>
                <p><strong>Job ID:</strong> {viewingApplication.jobId}</p>
                 <p><strong>Qualification:</strong> {viewingApplication.qualification}</p>
                <p><strong>Resume:</strong> <a href={viewingApplication.resumeLink} target="_blank" rel="noopener noreferrer">View Resume</a></p>
                <p><strong>Status:</strong> {viewingApplication.status}</p>

                {viewingApplication.status !== 'Offered' && viewingApplication.status !== 'Rejected' && viewingApplication.status !== 'Withdrawn'&& viewingApplication.status !== 'Accepted'  && (
                  <div className="mt-3">
                    <select
                      className="form-select mb-2"
                      value={statusUpdate}
                      onChange={(e) => setStatusUpdate(e.target.value)}
                    >
                      <option value="" disabled>Select Status</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offered">Offered</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <button
                      className="btn btn-success"
                      onClick={() => handleStatusUpdate(viewingApplication.id)}
                      disabled={!statusUpdate}
                    >
                      Update Status
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

export default CompanyApplication;
