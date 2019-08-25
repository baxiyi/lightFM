import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import store from './store/index';
import App from './router/index';
import {MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import * as serviceWorker from './serviceWorker';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#ffc1c1',
      main: '#ed8281',
      dark: '#9c1b18',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#8b81ed',
      dark: '#ba000d',
      contrastText: '#fff',
    },
  },
});

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider theme={theme}>
      <App/>
    </MuiThemeProvider>
  </Provider>
  , document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
