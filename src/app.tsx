import { PrimeReactProvider } from "primereact/api";
import { useTheme } from "./hooks/useTheme";
import SignIn from "./screens/SignIn";
import ForgotPassword from "./screens/ForgotPassword";
import { Routes, Route } from "react-router-dom";
import Home from "./screens/Home";
import SubsidiaryList from './screens/subsidiaries/SubsidiaryList';
import SubsidiaryForm from './screens/subsidiaries/SubsidiaryForm';
import CompanyList from './screens/companies/CompanyList';
import CompanyForm from './screens/companies/CompanyForm';
import { PrivateRoute } from './components/PrivateRoute';
import AuthLayout from "./layouts/AuthLayout";
import ServiceOrderParameters from "./screens/service_orders/ServiceOrderParameters";

export default function App() {
  const { theme, setTheme } = useTheme();
  const value = { ripple: true, unstyled: false };

  return (
    <PrimeReactProvider value={value}>
      <Routes>
        <Route path="/" element={<SignIn theme={theme} setTheme={setTheme} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={
          <PrivateRoute>
            <AuthLayout>
              <Home />
            </AuthLayout>
          </PrivateRoute>
        } />
        <Route path="/management/subsidiaries" element={
          <PrivateRoute>
            <AuthLayout>
              <SubsidiaryList />
            </AuthLayout>
          </PrivateRoute>
        } />
        <Route path="/management/subsidiaries/:id/edit" element={
          <PrivateRoute>
            <AuthLayout>
              <SubsidiaryForm />
            </AuthLayout>
          </PrivateRoute>
        } />
        <Route path="/subsidiaries/new/edit" element={
          <PrivateRoute>
            <AuthLayout>
              <SubsidiaryForm />
            </AuthLayout>
          </PrivateRoute>
        } />
        <Route path="/management/companies" element={
          <PrivateRoute>
            <AuthLayout>
              <CompanyList />
            </AuthLayout>
          </PrivateRoute>
        } />
        <Route path="/management/companies/:id/edit" element={
          <PrivateRoute>
            <AuthLayout>
              <CompanyForm />
            </AuthLayout>
          </PrivateRoute>
        } />
        <Route path="/companies/new/edit" element={
          <PrivateRoute>
            <AuthLayout>
              <CompanyForm />
            </AuthLayout>
          </PrivateRoute>
        } />

        <Route path="/service-orders/parameters" element={
          <PrivateRoute>
            <AuthLayout>
              <ServiceOrderParameters />
            </AuthLayout>
          </PrivateRoute>
        } />        
      </Routes>
    </PrimeReactProvider>
  );
}