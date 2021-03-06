import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { BrowserRouter, Route, Switch, useHistory } from 'react-router-dom';
import Register from './Screens/Register';
import Activate from './Screens/Activate';
import Login from './Screens/Login';
import Forget from './Screens/Forget';
import Reset from './Screens/Reset';
import Upload from './Screens/Upload';
import Private from './Screens/Private';
import Play from './Screens/Play';
import VideoReg from './Components/VideoReg';
import 'react-toastify/dist/ReactToastify.css';
import AuthRoute from './Routes/AuthRoute';

ReactDOM.render(
  <BrowserRouter>
    <Switch>

      <Route path="/" exact render={(props) => <App {...props} />} />

      <Route
        path="/register"
        exact
        render={(props) => <Register {...props} />}
      />

      <Route
        path="/users/activate/:token"
        exact
        render={(props) => <Activate {...props} />}
      />

      <Route path="/login" exact render={(props) => <Login {...props} /> } />

      <Route
        path="/user/password/forget"
        exact
        render={(props) => <Forget {...props} />}
      />

      <Route
        path="/user/password/reset/:token"
        exact
        render={(props) => <Reset {...props} />}
      />

      <AuthRoute path="/private" exact component={Private} />
      <AuthRoute path="/playground" exact component={Play} />

    </Switch>
  </BrowserRouter>,
  document.getElementById('root')
);
