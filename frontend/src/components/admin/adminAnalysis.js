import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import AdminHeader from './adminNavbar'; // Adjust path as per your project structure
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'animate.css'; // For animations

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function AnalysisPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('jwtToken');

  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
    fetchData();
  }, [token, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const companiesResponse = await axios.get(`${API_BASE_URL}/companies`, axiosConfig);
      setCompanies(companiesResponse.data);

      const jobsResponse = await axios.get(`${API_BASE_URL}/jobs`, axiosConfig);
      setJobs(jobsResponse.data);

      const appsResponse = await axios.get(`${API_BASE_URL}/job-applications`, axiosConfig);
      setApplications(appsResponse.data);
    } catch (error) {
      setMessage('Error fetching data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Bar Chart: Jobs Posted by Company
  const jobsByCompany = companies.map((company) => {
    const jobCount = jobs.filter((job) => job.companyId === company.id).length;
    return { name: company.name, jobCount };
  });

  const jobsBarData = {
    labels: jobsByCompany.map((c) => c.name),
    datasets: [
      {
        label: 'Jobs Posted',
        data: jobsByCompany.map((c) => c.jobCount),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Jobs Posted by Company' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Number of Jobs' } },
      x: { title: { display: true, text: 'Company' } },
    },
  };

  // Bar Chart: Applications Accepted by Company
  const acceptedByCompany = companies.map((company) => {
    const acceptedCount = applications.filter(
      (app) => app.status === 'Accepted' && jobs.find((job) => job.id === app.jobId)?.companyId === company.id
    ).length;
    return { name: company.name, acceptedCount };
  });

  const acceptedBarData = {
    labels: acceptedByCompany.map((c) => c.name),
    datasets: [
      {
        label: 'Applications Accepted',
        data: acceptedByCompany.map((c) => c.acceptedCount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const acceptedBarOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Applications Accepted by Company' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Number of Accepted Applications' } },
      x: { title: { display: true, text: 'Company' } },
    },
  };

  // Pie Chart: Application Status Distribution (Including Pending)
  const totalApplications = applications.length;

  const statusCounts = {
    Withdrawn: applications.filter((app) => app.status === 'Withdrawn').length,
    Rejected: applications.filter((app) => app.status === 'Rejected').length,
    Offered: applications.filter((app) => app.status === 'Offered').length,
    Accepted: applications.filter((app) => app.status === 'Accepted').length,
    Pending: applications.filter(
      (app) =>
        !['Withdrawn', 'Rejected', 'Offered', 'Accepted'].includes(app.status)
    ).length, // Includes statuses like "Applied", "Interviewing", etc.
  };

  // Calculate percentages (avoid division by zero)
  const statusPercentages = totalApplications > 0 ? {
    Withdrawn: ((statusCounts.Withdrawn / totalApplications) * 100).toFixed(1),
    Rejected: ((statusCounts.Rejected / totalApplications) * 100).toFixed(1),
    Offered: ((statusCounts.Offered / totalApplications) * 100).toFixed(1),
    Accepted: ((statusCounts.Accepted / totalApplications) * 100).toFixed(1),
    Pending: ((statusCounts.Pending / totalApplications) * 100).toFixed(1),
  } : {
    Withdrawn: 0,
    Rejected: 0,
    Offered: 0,
    Accepted: 0,
    Pending: 0,
  };

  const pieData = {
    type: 'pie',
    labels: ['Withdrawn', 'Rejected', 'Offered', 'Accepted', 'Pending'],
    datasets: [
      {
        label: 'Application Status (%)',
        data: [
          statusCounts.Withdrawn,
          statusCounts.Rejected,
          statusCounts.Offered,
          statusCounts.Accepted,
          statusCounts.Pending,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)', // Withdrawn
          'rgba(255, 159, 64, 0.6)', // Rejected
          'rgba(54, 162, 235, 0.6)', // Offered
          'rgba(75, 192, 192, 0.6)', // Accepted
          'rgba(153, 102, 255, 0.6)', // Pending (Purple)
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: `Application Status Distribution (Total: ${totalApplications})` },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const percentage = totalApplications > 0 ? ((value / totalApplications) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Fourth Section: Key Metrics
  // 1. Acceptance Ratio: (Accepted Applications / Total Applications) * 100
  const acceptanceRatio = totalApplications > 0 ? ((statusCounts.Accepted / totalApplications) * 100).toFixed(1) : 0;

  // 2. Rejection Ratio: (Rejected Applications / Total Applications) * 100
  const rejectionRatio = totalApplications > 0 ? ((statusCounts.Rejected / totalApplications) * 100).toFixed(1) : 0;

  // 3. Offer Success Rate: (Accepted Applications / Offered Applications) * 100
  const offerSuccessRate = statusCounts.Offered > 0 ? ((statusCounts.Accepted / statusCounts.Offered) * 100).toFixed(1) : 0;

  // 4. Average Applications per Job: Total Applications / Total Jobs
  const totalJobs = jobs.length;
  const avgApplicationsPerJob = totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0;

  // 5. Job Fill Rate: (Jobs with at least one Accepted Application / Total Jobs) * 100
  const jobsWithAccepted = new Set(applications.filter(app => app.status === 'Accepted').map(app => app.jobId)).size;
  const jobFillRate = totalJobs > 0 ? ((jobsWithAccepted / totalJobs) * 100).toFixed(1) : 0;

  return (
    <div>
      <AdminHeader />

      {/* Main Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="mb-4 text-center text-primary animate__animated animate__fadeInDown">
            Analysis Dashboard
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

          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {/* Bar Chart: Jobs Posted by Company */}
              <div className="col-12">
                <div className="card shadow-lg border-0 animate__animated animate__fadeInUp">
                  <div className="card-body p-4">
                    <Bar data={jobsBarData} options={barOptions} />
                  </div>
                </div>
              </div>

              {/* Bar Chart: Applications Accepted by Company */}
              <div className="col-12">
                <div className="card shadow-lg border-0 animate__animated animate__fadeInUp">
                  <div className="card-body p-4">
                    <Bar data={acceptedBarData} options={acceptedBarOptions} />
                  </div>
                </div>
              </div>

              {/* Pie Chart: Application Status Distribution */}
              <div className="col-12">
                <div className="card shadow-lg border-0 animate__animated animate__fadeInUp">
                  <div className="card-body p-4">
                    <div className="row">
                      <div className="col-md-6">
                        <Pie data={pieData} options={pieOptions} />
                      </div>
                      <div className="col-md-6 d-flex align-items-center">
                        <div>
                          <h5 className="text-primary">Application Status Counts</h5>
                          <ul className="list-unstyled">
                            <li>
                              <strong>Withdrawn:</strong> {statusCounts.Withdrawn} ({statusPercentages.Withdrawn}%)
                            </li>
                            <li>
                              <strong>Rejected:</strong> {statusCounts.Rejected} ({statusPercentages.Rejected}%)
                            </li>
                            <li>
                              <strong>Offered:</strong> {statusCounts.Offered} ({statusPercentages.Offered}%)
                            </li>
                            <li>
                              <strong>Accepted:</strong> {statusCounts.Accepted} ({statusPercentages.Accepted}%)
                            </li>
                            <li>
                              <strong>Pending:</strong> {statusCounts.Pending} ({statusPercentages.Pending}%)
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fourth Section: Key Recruitment Metrics */}
              <div className="col-12">
                <div className="card shadow-lg border-0 animate__animated animate__fadeInUp">
                  <div className="card-body p-4">
                    <h3 className="mb-4 text-primary">Key Recruitment Metrics</h3>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded shadow-sm">
                          <h5 className="text-success">Acceptance Ratio</h5>
                          <p>{acceptanceRatio}%</p>
                          <small className="text-muted">
                            Formula: (Accepted Applications / Total Applications) × 100
                          </small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded shadow-sm">
                          <h5 className="text-danger">Rejection Ratio</h5>
                          <p>{rejectionRatio}%</p>
                          <small className="text-muted">
                            Formula: (Rejected Applications / Total Applications) × 100
                          </small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded shadow-sm">
                          <h5 className="text-primary">Offer Success Rate</h5>
                          <p>{offerSuccessRate}%</p>
                          <small className="text-muted">
                            Formula: (Accepted Applications / Offered Applications) × 100
                          </small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded shadow-sm">
                          <h5 className="text-info">Average Applications per Job</h5>
                          <p>{avgApplicationsPerJob}</p>
                          <small className="text-muted">
                            Formula: Total Applications / Total Jobs
                          </small>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-light rounded shadow-sm">
                          <h5 className="text-warning">Job Fill Rate</h5>
                          <p>{jobFillRate}%</p>
                          <small className="text-muted">
                            Formula: (Jobs with Accepted Applications / Total Jobs) × 100
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

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

export default AnalysisPage;