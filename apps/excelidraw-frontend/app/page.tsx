import { UserProvider } from "./ContextApi";
import { LandingPage } from "./landing";
 

function App() {
  return (
    <UserProvider>
      <LandingPage />
      </UserProvider>
  );
}

export default App;
