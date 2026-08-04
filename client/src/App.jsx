import { Route, Routes } from "react-router-dom";
import { AuthLayout, GuestLayout } from "./pages/Layout";
import Authpages from "./pages/AuthPages.jsx";
import BuilderPage from "./pages/BuilderPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import PreviewPage from "./pages/PreviewPage.jsx";

const App = () => {
  return (
    <Routes>
      {/* Login Routes */}
      <Route element={<GuestLayout />}>
        <Route path="/login" element={<Authpages mode="login" />} />
        <Route path="/register" element={<Authpages mode="register" />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/builder/:id" element={<BuilderPage />} />
        <Route path="/preview/:id" element={<PreviewPage />} />
      </Route>
    </Routes>
  );
};

export default App;
