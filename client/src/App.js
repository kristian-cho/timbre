import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
// Components
import NavBar from './components/NavBar';
import PrimarySearchAppBar from './components/PrimarySearchAppBar';

// Pages
import home from './pages/home';
import login from './pages/login';
import signup from './pages/signup';

const theme = createMuiTheme({
    palette: {
        primary: {
            light: '#616161',
            main: '#424242',
            dark: '212121',
            contrastText: '#fff'
        },
        secondary: {
            light: '#ef5350',
            main: '#f44336',
            dark: '#e53935',
            contrastText: '#fff'
        }
    }
})

const App = () => {
    return (
        <MuiThemeProvider theme={theme}>
            <div className="App">
                <BrowserRouter>
                    <PrimarySearchAppBar>
                        <div className="container">
                            <Switch>
                                <Route exact path="/" component={home}/>
                                <Route exact path="/login" component={login}/>
                                <Route exact path="/signup" component={signup}/>
                            </Switch>
                        </div>
                    </PrimarySearchAppBar>
                </BrowserRouter>
            </div>
        </MuiThemeProvider>
    );
}

export default App;