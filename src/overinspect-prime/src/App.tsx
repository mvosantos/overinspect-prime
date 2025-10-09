Here is the content for the file `src/App.tsx`:

import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import TopMenu from './components/TopMenu';
import Home from './pages/Home';

const App = () => {
  return (
    <Router>
      <TopMenu />
      <Switch>
        <Route path="/home" component={Home} />
        {/* Add more routes here as needed */}
      </Switch>
    </Router>
  );
};

export default App;