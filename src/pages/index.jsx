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

import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

function PagesContent() {
    return (
        <Layout>
            <Routes>
                {/* Rotas Públicas */}
                <Route path="/" element={<Home />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
                <Route path="/bling-callback" element={<BlingCallback />} />
                <Route path="/subscription-success" element={<SubscriptionSuccess />} />
                <Route path="/compra-sucesso" element={<CompraSucesso />} />
                <Route path="/test-image-url" element={<TestImageURL />} />

                {/* Rotas Protegidas */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/my-subscription" element={<MySubscription />} />
                    <Route path="/configuracao-acesso" element={<ConfiguracaoAcesso />} />
                    <Route path="/admin-users" element={<AdminUsers />} />
                </Route>
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <AuthProvider>
                <PagesContent />
            </AuthProvider>
        </Router>
    );
}
