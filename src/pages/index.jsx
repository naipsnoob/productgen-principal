import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Upload from "./Upload";

import Products from "./Products";

import Settings from "./Settings";

import BlingCallback from "./BlingCallback";

import TestImageURL from "./TestImageURL";

import AdminUsers from "./AdminUsers";

import ForgotPassword from "./ForgotPassword";

import ConfiguracaoAcesso from "./ConfiguracaoAcesso";

import Pricing from "./Pricing";

import SubscriptionSuccess from "./SubscriptionSuccess";

import MySubscription from "./MySubscription";

import Home from "./Home";

import PrimeiroAcesso from "./PrimeiroAcesso";

import CompraSucesso from "./CompraSucesso";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Upload: Upload,
    
    Products: Products,
    
    Settings: Settings,
    
    BlingCallback: BlingCallback,
    
    TestImageURL: TestImageURL,
    
    AdminUsers: AdminUsers,
    
    ForgotPassword: ForgotPassword,
    
    ConfiguracaoAcesso: ConfiguracaoAcesso,
    
    Pricing: Pricing,
    
    SubscriptionSuccess: SubscriptionSuccess,
    
    MySubscription: MySubscription,
    
    Home: Home,
    
    PrimeiroAcesso: PrimeiroAcesso,
    
    CompraSucesso: CompraSucesso,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Upload" element={<Upload />} />
                
                <Route path="/Products" element={<Products />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/BlingCallback" element={<BlingCallback />} />
                
                <Route path="/TestImageURL" element={<TestImageURL />} />
                
                <Route path="/AdminUsers" element={<AdminUsers />} />
                
                <Route path="/ForgotPassword" element={<ForgotPassword />} />
                
                <Route path="/ConfiguracaoAcesso" element={<ConfiguracaoAcesso />} />
                
                <Route path="/Pricing" element={<Pricing />} />
                
                <Route path="/SubscriptionSuccess" element={<SubscriptionSuccess />} />
                
                <Route path="/MySubscription" element={<MySubscription />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/PrimeiroAcesso" element={<PrimeiroAcesso />} />
                
                <Route path="/CompraSucesso" element={<CompraSucesso />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}