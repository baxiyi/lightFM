import React from 'react';
import Login from '../pages/Login';
import Guide from '../pages/Guide';
import Index from '../pages/Index';
import Search from '../pages/Search';
import Dislike from '../pages/Dislike';
import {BrowserRouter, Route, Switch, Redirect} from 'react-router-dom';
import Snackbar from '../components/Snackbar';
import Audio from '../components/Audio';
import MenuDrawer from '../components/MenuDrawer';
import Services from '../services/index';

const PrimaryLayout = () => {
  const isLogin = Services.userServices.checkIsLogin();
  return (
    <div>
      <MenuDrawer/>
      <Snackbar/>
      <Audio/>
      <Switch>
        <Route
          path='/'
          exact
          render={props => {
            return isLogin ? <Redirect to="/index/quality" /> : <Login/>;
          }}
        />
        <Route
          path="/index"
          exact
          render={props => {
            return isLogin ? <Redirect to="/index/quality" /> : <Login/>
          }}
        />
        <Route
          path="/login"
          component={Login}
        />
        <Route
          path="/guide"
          render={props => {
            return isLogin ? <Guide/> : <Login/>
          }}
        />
        <Route
          path="/dislike"
          render={props => {
            return isLogin ? <Dislike/> : <Login/>
          }}
        />
        <Route
          path="/search"
          render={props => {
            return isLogin ? <Search/> : <Login/>;
          }}
        />
        <Route
          path="/index/:fmType"
          render={props => {
            return isLogin ? <Index/> : <Login/>
          }}
        />
        <Route render={props => {
            return isLogin ? <Redirect to="/index/quality"/> : <Login/>;
          }}/>
      </Switch>
    </div>
  )
}

const App = () => (
  <BrowserRouter>
    <PrimaryLayout></PrimaryLayout>
  </BrowserRouter>
);

export default App;