import React from 'react';
import configStore from '../../configStore';
import { Link } from 'react-router-dom';
import services from '../../services';
import queryString from 'query-string';
import Loading from '../Loading';
import { connect } from 'react-redux';
import SearchHeader from '../SearchHeader';
import Profile from './Profile';
import RequireLoginPage from './../../shared/RequireLoginPage';
export default class ProfileContainer extends React.Component {
  constructor(props) {
    super(props);
    let paramsState = this.checkInputParams(props);
    this.state = {
      ...paramsState,
      userInfo: null
    }
  }
  componentWillReceiveProps(next) {
    let state = this.checkInputParams(next);
    this.setState({ ...state });
  }

  checkInputParams(props) {
    let query = props.match.params;
    if (query.id === 'profile') query.id = null;
    return { query }
  }

  render() {
    let requireLogin = !this.state.query.id && !services.helper.checkLogged();
    let style = {};
    if (this.state.userInfo && this.state.userInfo.user_settings) {
      style = {
        backgroundImage: `url(${this.state.userInfo.user_settings.background})`,
        backgroundSize: `cover`,
        backgroundRepeat: `no-repeat`,
        backgroundAttachment: `fixed`
      }
    }
    return <React.Fragment>
      <SearchHeader />
      <main className="gapo-main row">
        <div className="col">
          <div className="row justify-content-center" style={style}>
            <div className="col col-900 py-4">
              {requireLogin ? <RequireLoginPage /> : <Profile history={this.props.history} user_id={this.state.query.id} onDataUpdated={userInfo => {
                console.log('on data updated', userInfo);
                this.setState({ userInfo });
              }} />}
            </div>
          </div>
        </div>
      </main>
    </React.Fragment >
  }
}