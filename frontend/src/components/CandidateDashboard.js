import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import CandidateHeader from './candidate/CandidateHeader';

function CandidateDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');
  const candidateId = localStorage.getItem('candidateId');

  const [candidate, setCandidate] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyJobs, setSelectedCompanyJobs] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [searchPosition, setSearchPosition] = useState('');
  const [searchSkill, setSearchSkill] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [message, setMessage] = useState('');
  const [applyingJob, setApplyingJob] = useState(null);
  const [applyFormData, setApplyFormData] = useState({
    candidateId: candidateId || '',
    qualification: '',
    resumeLink: '',
  });

  useEffect(() => {
    if (!token || !candidateId) {
      setMessage('Please log in to access the dashboard.');
      navigate('/login');
      return;
    }

    // Load candidate details from localStorage
    const storedCandidate = JSON.parse(localStorage.getItem('candidateDetails'));
    if (storedCandidate) {
      setCandidate(storedCandidate);
      setApplyFormData((prev) => ({
        ...prev,
        resumeLink: storedCandidate.resumeLink || '',
      }));
    }

    fetchCompanies();
    fetchJobApplications();
  }, [token, candidateId, navigate]);

  const axiosConfig = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/companies`, axiosConfig);
      setCompanies(response.data);
    } catch (error) {
      setMessage('Error fetching companies: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 401) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('candidateId');
        navigate('/login');
      }
    }
  };

  const fetchJobApplications = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/job-applications/candidate/${candidateId}`,
        axiosConfig
      );
      setJobApplications(response.data);
    } catch (error) {
      setMessage('Error fetching job applications: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 401) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('candidateId');
        navigate('/login');
      }
    }
  };

  const fetchCompanyJobs = async (companyId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/company/${companyId}`, axiosConfig);
      setSelectedCompanyJobs(response.data);
      setMessage('');
    } catch (error) {
      setMessage('Error fetching jobs: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 401) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('candidateId');
        navigate('/login');
      }
    }
  };

  const handleSearchPosition = async (e) => {
    e.preventDefault();
    if (!searchPosition) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/jobs/search/position/${encodeURIComponent(searchPosition)}`,
        axiosConfig
      );
      setSelectedCompanyJobs(response.data);
      setMessage(`Search results for position: ${searchPosition}`);
    } catch (error) {
      setMessage('Error searching jobs: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 401) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('candidateId');
        navigate('/login');
      }
    }
  };

  const handleSearchSkill = async (e) => {
    e.preventDefault();
    if (!searchSkill) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/jobs/search/skill/${encodeURIComponent(searchSkill)}`,
        axiosConfig
      );
      setSelectedCompanyJobs(response.data);
      setMessage(`Search results for skill: ${searchSkill}`);
    } catch (error) {
      setMessage('Error searching jobs: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 401) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('candidateId');
        navigate('/login');
      }
    }
  };

  const handleApply = (job) => {
    setApplyingJob(job);
    setApplyFormData({
      candidateId: candidateId || '',
      qualification: '',
      resumeLink: candidate?.resumeLink || '',
    });
    const modal = new window.bootstrap.Modal(document.getElementById('applyJobModal'));
    modal.show();
  };

  const handleApplyInputChange = (e) => {
    const { name, value } = e.target;
    setApplyFormData({ ...applyFormData, [name]: value });
  };

  // Kept for updating applications or other purposes
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyFormData.candidateId || !applyFormData.qualification || !applyFormData.resumeLink) {
      setMessage('Error: All fields are required.');
      return;
    }
    const payload = {
      candidateId: applyFormData.candidateId,
      jobId: applyingJob.id,
      qualification: applyFormData.qualification,
      resumeLink: applyFormData.resumeLink,
      status: 'Applied',
    };
    try {
      await axios.put(`${API_BASE_URL}/job-applications`, payload, axiosConfig);
      setMessage('Application submitted successfully!');
      setApplyFormData({
        candidateId: candidateId || '',
        qualification: '',
        resumeLink: candidate?.resumeLink || '',
      });
      setApplyingJob(null);
      fetchJobApplications();
      const modal = new window.bootstrap.Modal(document.getElementById('applyJobModal'));
      modal.hide();
    } catch (error) {
      setMessage('Error submitting application: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 401) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('candidateId');
        navigate('/login');
      }
    }
  };

  // New function for creating applications via POST
  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyFormData.candidateId || !applyFormData.qualification || !applyFormData.resumeLink) {
      setMessage('Error: All fields are required.');
      return;
    }

    // Verify job status is "Not Applied"
    const application = jobApplications.find(
      (app) => app.jobId === applyingJob.id && app.candidateId === candidateId
    );
    if (application) {
      setMessage('Error: You have already applied for this job.');
      return;
    }

    const payload = {
      candidateId: applyFormData.candidateId,
      jobId: applyingJob.id,
      qualification: applyFormData.qualification,
      resumeLink: applyFormData.resumeLink,
      status: 'Applied',
    };

    try {
      await axios.post(`${API_BASE_URL}/job-applications`, payload, axiosConfig);
      setMessage('Application submitted successfully!');
      setApplyFormData({
        candidateId: candidateId || '',
        qualification: '',
        resumeLink: candidate?.resumeLink || '',
      });
      setApplyingJob(null);
      fetchJobApplications();
      const modal = new window.bootstrap.Modal(document.getElementById('applyJobModal'));
      modal.hide();
    } catch (error) {
      setMessage('Error submitting application: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 401) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('candidateId');
        navigate('/login');
      }
    }
  };

  const handleWithdraw = async (applicationId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/job-applications/${applicationId}?status=Withdrawn`,
        {},
        axiosConfig
      );
      setMessage('Application withdrawn successfully.');
      fetchJobApplications();
    } catch (error) {
      setMessage('Error withdrawing application: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 401) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('candidateId');
        navigate('/login');
      }
    }
  };

  const handleAccept = async (applicationId) => {
    try {
      await axios.put(
        `${API_BASE_URL}/job-applications/${applicationId}?status=Accepted`,
        {},
        axiosConfig
      );
      setMessage('Application accepted successfully.');
      fetchJobApplications();
    } catch (error) {
      setMessage('Error accepting application: ' + (error.response?.data?.message || error.message));
      if (error.response?.status === 401) {
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('candidateId');
        navigate('/login');
      }
    }
  };

  // Client-side location filter
  const filteredJobs = locationFilter
    ? selectedCompanyJobs.filter((job) =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    : selectedCompanyJobs;

  return (
    <div>
      <CandidateHeader />
      <div className="container py-5">
        <h2 className="text-center mb-4 fw-bold">Candidate Dashboard</h2>
        {message && (
          <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
            {message}
          </div>
        )}

        {/* Companies List */}
        <div className="card shadow-lg mb-4">
          <div className="card-header bg-dark text-white">
            <h4>Companies</h4>
          </div>
          <div className="card-body">
            {companies.length === 0 ? (
              <p>No companies found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Description</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company) => (
                      <tr key={company.id}>
                        <td>{company.name}</td>
                        <td>{company.location}</td>
                        <td>{company.description}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => fetchCompanyJobs(company.id)}
                          >
                            View Jobs
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Job Search and Filter */}
        <div className="card shadow-lg mb-4">
          <div className="card-header bg-primary text-white">
            <h4>Search Jobs</h4>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <form onSubmit={handleSearchPosition}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by position (e.g., Software Engineer)"
                      value={searchPosition}
                      onChange={(e) => setSearchPosition(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit">
                      Search
                    </button>
                  </div>
                </form>
              </div>
              <div className="col-md-6">
                <form onSubmit={handleSearchSkill}>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by skill (e.g., Java)"
                      value={searchSkill}
                      onChange={(e) => setSearchSkill(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit">
                      Search
                    </button>
                  </div>
                </form>
              </div>
              <div className="col-12">
                <label htmlFor="locationFilter" className="form-label">
                  Filter by Location
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="locationFilter"
                  placeholder="e.g., San Francisco"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="card shadow-lg">
          <div className="card-header bg-dark text-white">
            <h4>Jobs</h4>
          </div>
          <div className="card-body">
            {filteredJobs.length === 0 ? (
              <p>No jobs found.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Position</th>
                      <th>Location</th>
                      <th>Experience</th>
                      <th>Job Type</th>
                      <th>Skills</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredJobs.map((job) => {
                      const application = jobApplications.find(
                        (app) => app.jobId === job.id && app.candidateId === candidateId
                      );
                      const status = application ? application.status : null;
                      const applicationId = application ? application.id : null;

                      return (
                        <tr key={job.id}>
                          <td>{job.position}</td>
                          <td>{job.location}</td>
                          <td>{job.experience}</td>
                          <td>{job.jobType}</td>
                          <td>{job.skills.join(', ')}</td>
                          <td>{job.description}</td>
                          <td>{status || 'Not Applied'}</td>
                          <td>
                            {!status && (
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleApply(job)}
                              >
                                Apply
                              </button>
                            )}
                            {(status === 'Applied' || status === 'Interviewing') && (
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleWithdraw(applicationId)}
                              >
                                Withdraw
                              </button>
                            )}
                            {status === 'Offered' && (
                              <>
                                <button
                                  className="btn btn-success btn-sm me-2"
                                  onClick={() => handleAccept(applicationId)}
                                >
                                  Accept
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleWithdraw(applicationId)}
                                >
                                  Withdraw
                                </button>
                              </>
                            )}
                            {(status === 'Withdrawn' || status === 'Accepted') && null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Apply Job Modal */}
        <div
          className="modal fade"
          id="applyJobModal"
          tabIndex="-1"
          aria-labelledby="applyJobModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-dialog-scrollable">
            <div className="modal-content shadow">
              <div className="modal-header">
                <h5 className="modal-title" id="applyJobModalLabel">
                  Apply for {applyingJob?.position}
                </h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                {applyingJob && (
                  <form onSubmit={handleSubmitApplication}>
                    <div className="mb-3">
                      <label htmlFor="candidateId" className="form-label">
                        Candidate ID
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="candidateId"
                        value={applyFormData.candidateId}
                        onChange={handleApplyInputChange}
                        required
                        disabled
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="qualification" className="form-label">
                        Qualification
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="qualification"
                        placeholder="e.g., B.Sc. Computer Science"
                        value={applyFormData.qualification}
                        onChange={handleApplyInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="resumeLink" className="form-label">
                        Resume Link
                      </label>
                      <input
                        type="url"
                        className="form-control"
                        name="resumeLink"
                        placeholder="e.g., https://s3.amazonaws.com/resumes/john_doe_application.pdf"
                        value={applyFormData.resumeLink}
                        onChange={handleApplyInputChange}
                        required
                      />
                    </div>
                    <div className="mt-3">
                      <button type="submit" className="btn btn-success">
                        Submit Application
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => {
                          setApplyFormData({
                            candidateId: candidateId || '',
                            qualification: '',
                            resumeLink: candidate?.resumeLink || '',
                          });
                          setApplyingJob(null);
                        }}
                        data-bs-dismiss="modal"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateDashboard;