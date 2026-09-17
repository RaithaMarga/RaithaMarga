import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import Home from './pages/Home';
import { LanguageProvider } from './context/LanguageContext';

import FarmerDashboardShell from './pages/farmer/FarmerDashboardShell';
import FarmerOverview from './pages/farmer/Overview';
import AddProduce from './pages/farmer/AddProduce';
import MyListings from './pages/farmer/MyListings';
import BuyerMatches from './pages/farmer/BuyerMatches';
import MyDeals from './pages/farmer/MyDeals';
import FarmerVerification from './pages/farmer/Verification';
import FarmerProfile from './pages/farmer/Profile';

import BuyerDashboardShell from './pages/buyer/BuyerDashboardShell';
import BuyerOverview from './pages/buyer/Overview';
import BrowseProduce from './pages/buyer/BrowseProduce';
import RecommendedMatches from './pages/buyer/RecommendedMatches';
import RequestsOrders from './pages/buyer/RequestsOrders';
import Deals from './pages/buyer/Deals';
import TrustVerification from './pages/buyer/TrustVerification';
import BuyerProfile from './pages/buyer/Profile';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/AdminDashboard';

// Forces AddProduce to remount whenever the :id param changes, so its
// lazy initial state (read from context) is recomputed per listing
// instead of needing an effect to re-sync form state.
const EditProduceRoute = () => {
  const { id } = useParams();
  return <AddProduce key={id} />;
};

function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/get-started" element={<Register />} />

          <Route path="/farmer/dashboard" element={<FarmerDashboardShell />}>
            <Route index element={<FarmerOverview />} />
            <Route path="add-produce" element={<AddProduce />} />
            <Route path="listings" element={<MyListings />} />
            <Route path="listings/:id/edit" element={<EditProduceRoute />} />
            <Route path="matches" element={<BuyerMatches />} />
            <Route path="deals" element={<MyDeals />} />
            <Route path="verification" element={<FarmerVerification />} />
            <Route path="profile" element={<FarmerProfile />} />
          </Route>

          <Route path="/buyer/dashboard" element={<BuyerDashboardShell />}>
            <Route index element={<BuyerOverview />} />
            <Route path="browse" element={<BrowseProduce />} />
            <Route path="recommended" element={<RecommendedMatches />} />
            <Route path="requests" element={<RequestsOrders />} />
            <Route path="deals" element={<Deals />} />
            <Route path="trust" element={<TrustVerification />} />
            <Route path="profile" element={<BuyerProfile />} />
          </Route>

          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}

export default App;
