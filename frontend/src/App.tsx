import { useEffect } from "react";
import AppRoutes from "./routes/AppRoutes"
import { useAppDispatch } from "./store/hooks"
import { loadUser } from "./store/slices/authSlice";

const App = () => {
  const dispatch = useAppDispatch();
  useEffect(() => {
    void dispatch(loadUser());
  }, [dispatch]);
  return (
      <AppRoutes />
  )
}

export default App
