import { BrowserRouter, Route, Routes } from "react-router-dom"
import MainLayout from "./MainLayout"
import Pending from "./pages/Pending"
import Finished from "./pages/Finished"
import TotoPending from "./pages/TotoPending"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Home from "./pages/Home"
import HomeMsg from "./components/HomeMsg"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* Public route */}
        <Route path="/home" element={<Home />}>
          <Route index element={<HomeMsg />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>


        {/* Protected route */}

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Pending />} />
            <Route path="/todo-finished" element={<Finished />} />
            <Route path="/todo-pending" element={<TotoPending />} />
          </Route>  
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
