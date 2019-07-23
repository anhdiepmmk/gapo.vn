import React from 'react';
import { HashRouter, Route, Switch, BrowserRouter } from 'react-router-dom';
import Loading from './components/Loading';
// import MobileContainer from './containers/MobileContainer';
import PCContainer from './containers/PCContainer';
import helper from './services/helper';
import noti from './services/notification'
export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    }
  }
  componentDidMount() {
    this.init();
  }
  async init() {
    this.setState({ loading: false });
    let user = helper.getLocalStorageUserInfo();
    if (user && !user.registerFCM) {
      noti.register()
    }
  }
  render() {
    if (this.state.loading) return <Loading />;
    return (
      <BrowserRouter basename='/'>
        <Switch>
          <Route path="/" component={PCContainer} />
        </Switch>
      </BrowserRouter >
    )
  }
}