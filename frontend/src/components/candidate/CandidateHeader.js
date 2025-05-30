import { NavLink, useNavigate } from 'react-router-dom';

function CandidateHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('candidateId');
    navigate('/login');
  };

  const navLinkStyles = ({ isActive }) => ({
    textDecoration: isActive ? 'underline' : 'none',
    backgroundColor: isActive ? '#0d6efd' : 'transparent',
    color: isActive ? 'white' : 'lightgray',
    borderRadius: '5px',
    padding: '6px 12px',
    margin: '0 4px',
    fontWeight: isActive ? 'bold' : 'normal',
  });

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm sticky-top w-100" style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
      <div className="container-fluid">
        <NavLink className="navbar-brand fw-bold" to="/">Candidate Portal</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <NavLink to="/candHome" style={navLinkStyles}>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/candidateProfile" style={navLinkStyles}>Profile</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/candidate-dashboard" style={navLinkStyles}>Job Search</NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/candapplications" style={navLinkStyles}>Applications</NavLink>
            </li>
            <li className="nav-item">
              <button className="btn btn-outline-light ms-3" onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default CandidateHeader;