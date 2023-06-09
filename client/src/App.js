import 'bootstrap/dist/css/bootstrap.min.css';    
import Login from './Login';
import Dashboard from './Dashboard';

import React from 'react';

const code = new URLSearchParams(window.location.search).get('code')

//Render the Login component at first. Render Dashboard with received access token.
function App() {

    return code ? 
        <Dashboard code={code}/>
    : (<Login/>)
}

export default App