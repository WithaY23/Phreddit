// ************** THIS IS YOUR APP'S ENTRY POINT. CHANGE THIS FILE AS NEEDED. **************
// ************** DEFINE YOUR REACT COMPONENTS in ./components directory **************
import './stylesheets/App.css';
import Phreddit from './components/phreddit.js'
import WelcomePage from './components/WelcomePage.js';
import Main_Content from './components/main_content.js';
import axios from 'axios';
axios.defaults.withCredentials = true;

function App() {
  return (
    <section className="phreddit">
      <Main_Content />
    </section>
  );
}

export default App;
