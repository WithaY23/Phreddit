// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import MainContent from './components/main_content.js';
import axios from 'axios';
axios.defaults.withCredentials = true;
axios.defaults.baseURL = '/api';

function App() {
  return (
    <section className="phreddit">
      <MainContent />
    </section>
  );
}

export default App;
