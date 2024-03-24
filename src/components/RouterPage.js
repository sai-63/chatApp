import React from "react";
import {BrowserRouter as Router,Route,Switch,Link} from "react-router-dom";
import Registration from "./Registration";
import Login from "./Login";
import Home from "./Home";
import Chat from "./Chat";

export default function RouterPage(){
    return(
        <Router>
            <Switch>
            <Route exact path="/" component={Registration}></Route>
            <Route exact path="/login" component={Login}></Route>
            <Route exact path="/home" component={Home}></Route>
            <Route exact path="/chat" component={Chat}></Route>
            </Switch>
        </Router>
    )
}