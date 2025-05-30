import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import CompanyProfile from './components/CompanyProfile';
import CompanyDashboard from './components/CompanyDashboard';
import CompanyApplication from './components/CompanyApplication';
import CompanyHome from './components/CompanyHome';
import CandidateProfile from './components/candidate/CandidateProfile'
import CandidateApplication from './components/candidate/CandidateApplication';
import CandidateHome from './components/candidate/CandidateHome';
import CandidateDashboard from './components/CandidateDashboard';
import AdminPage from './components/admin/adminDashboard';
import AddAdminPage from './components/admin/adddmin';
import AdminCompany from './components/admin/admincompany';
import AdminCandidate from './components/admin/adminCandidate';




function App() {
  return (
    <>
      <div className="container mt-5">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/company" element={<CompanyDashboard />} />
          <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
          <Route path="/companyProfile" element={<CompanyProfile/>}/>
          <Route path="/chome" element={<CompanyHome />} />
          <Route path="/capplications" element={<CompanyApplication/>}/>
          <Route path='/candapplications' element={<CandidateApplication/>}/>
          <Route path='/candHome' element={<CandidateHome/>}/>
          <Route path="/candidateProfile" element={<CandidateProfile/>}/>
          <Route path="/Admindash" element={<AdminPage/>}/>
          <Route path="/addAdmin" element={<AddAdminPage/>}/>
          <Route path="/adminCompany" element={<AdminCompany/>}/>
          <Route path="/adminCandidate" element={<AdminCandidate/>}/>
        </Routes>
      </div>
    </>
  );
}


export default App;