import AppRoutes from "@/routes/AppRoutes";
import { Toaster } from "react-hot-toast";
export default function App() {

  return <>
    <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0c0e16",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.08)"
          }
        }}
      />
    <AppRoutes />
  </>;
}