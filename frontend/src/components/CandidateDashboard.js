import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import CandidateHeader from './candidate/CandidateHeader';
import { FaBuilding, FaBriefcase, FaSearch, FaFilter } from 'react-icons/fa';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'animate.css'; // For animations

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
  const [showFilters, setShowFilters] = useState(false);

  // References for scrolling
  const filterSectionRef = useRef(null);
  const jobsSectionRef = useRef(null);

  useEffect(() => {
    if (!token || !candidateId) {
      setMessage('Please log in to access the dashboard.');
      navigate('/login');
      return;
    }

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
      // Scroll to the jobs section after fetching jobs
      setTimeout(() => {
        jobsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100); // Small delay to ensure DOM updates
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
      // Scroll to jobs section after search
      setTimeout(() => {
        jobsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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
      // Scroll to jobs section after search
      setTimeout(() => {
        jobsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
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

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!applyFormData.candidateId || !applyFormData.qualification || !applyFormData.resumeLink) {
      setMessage('Error: All fields are required.');
      return;
    }

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

  const filteredJobs = locationFilter
    ? selectedCompanyJobs.filter((job) =>
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      )
    : selectedCompanyJobs;

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
    // Scroll to filter section
    setTimeout(() => {
      filterSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div>
      <CandidateHeader />
      <div className="container py-5">
        <h2 className="text-center mb-4 fw-bold animate__animated animate__fadeInDown">
          Candidate Dashboard
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

        {/* Collapsible Search and Filter Section */}
        <div className="card shadow-lg mb-4" ref={filterSectionRef}>
          <div
            className="card-header bg-primary text-white d-flex justify-content-between align-items-center"
            style={{ cursor: 'pointer' }}
            onClick={handleFilterToggle}
          >
            <h4 className="mb-0">
              <FaFilter className="me-2" /> Search & Filter Jobs
            </h4>
            <i className={`bi ${showFilters ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
          </div>
          {showFilters && (
            <div className="card-body animate__animated animate__fadeIn">
              <div className="row g-3">
                <div className="col-md-6">
                  <form onSubmit={handleSearchPosition}>
                    <div className="input-group">
                      <span className="input-group-text bg-primary text-white">
                        <FaSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by position (e.g., Software Engineer)"
                        value={searchPosition}
                        onChange={(e) => setSearchPosition(e.target.value)}
                        style={{ borderRadius: '0 8px 8px 0', padding: '10px' }}
                      />
                      <button className="btn btn-primary ms-2" type="submit">
                        Search
                      </button>
                    </div>
                  </form>
                </div>
                <div className="col-md-6">
                  <form onSubmit={handleSearchSkill}>
                    <div className="input-group">
                      <span className="input-group-text bg-primary text-white">
                        <FaSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by skill (e.g., Java)"
                        value={searchSkill}
                        onChange={(e) => setSearchSkill(e.target.value)}
                        style={{ borderRadius: '0 8px 8px 0', padding: '10px' }}
                      />
                      <button className="btn btn-primary ms-2" type="submit">
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
                    style={{ borderRadius: '8px', padding: '10px' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Companies List in Card Format */}
        <div className="mb-4">
          <h3 className="mb-4 text-primary animate__animated animate__fadeInDown">Companies</h3>
          {companies.length === 0 ? (
            <p className="text-center text-muted">No companies found.</p>
          ) : (
            <div className="row g-4">
              {companies.map((company) => (
                <div key={company.id} className="col-md-6 col-lg-4">
                  <div
                    className="card shadow-lg border-0 h-100 animate__animated animate__fadeInUp"
                    style={{ borderRadius: '12px', cursor: 'pointer' }}
                    onClick={() => fetchCompanyJobs(company.id)}
                  >
                    <div className="card-body p-4">
                      <h5 className="card-title text-primary">
                        <FaBuilding className="me-2" /> {company.name}
                      </h5>
                      <p className="text-muted mb-2">Location: {company.location}</p>
                      <p className="mb-2">Description: {company.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Jobs List in Card Format */}
        {selectedCompanyJobs.length > 0 && (
          <div className="mb-4" ref={jobsSectionRef}>
            <h3 className="mb-4 text-primary animate__animated animate__fadeInDown">Available Jobs</h3>
            {filteredJobs.length === 0 ? (
              <p className="text-center text-muted">No jobs found.</p>
            ) : (
              <div className="row g-4">
                {filteredJobs.map((job) => {
                  const application = jobApplications.find(
                    (app) => app.jobId === job.id && app.candidateId === candidateId
                  );
                  const status = application ? application.status : null;
                  const applicationId = application ? application.id : null;

                  return (
                    <div key={job.id} className="col-md-6 col-lg-4">
                      <div
                        className="card shadow-lg border-0 h-100 animate__animated animate__fadeInUp"
                        style={{ borderRadius: '12px' }}
                      >
                        <div className="card-body p-4">
                          <h5 className="card-title text-success">
                            <FaBriefcase className="me-2" /> {job.position}
                          </h5>
                          <p className="text-muted mb-2">Location: {job.location}</p>
                          <p className="mb-2">Experience: {job.experience} years</p>
                          <p className="mb-2">Job Type: {job.jobType}</p>
                          <p className="mb-2">Skills: {job.skills.join(', ')}</p>
                          <p className="mb-2">Description: {job.description}</p>
                          <p className="mb-2">Status: {status || 'Not Applied'}</p>
                          <div className="d-flex flex-wrap gap-2">
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
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

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
    </div>
  );
}

export default CandidateDashboard;