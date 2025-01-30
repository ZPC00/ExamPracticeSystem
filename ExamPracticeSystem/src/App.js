import './App.css';
import Paperbase from './components/Paperbase.js';
import { AppProvider } from './components/AppContext.js';

function App() {
  return (
    <div className="App">
      <AppProvider>
        <Paperbase />
      </AppProvider>
    </div>
  );
}

export default App;
