import React from 'react';
import { connect } from 'react-redux';
import services from '../../services';
import _ from 'lodash'
import { Link } from 'react-router-dom';
import amplitude from 'amplitude-js';
import ListUserLike from './ListUserLike';
class PostActions extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showShareDropdown: false,
      showUserLike: false
    }
  }
  showRequireLogin() {
    services.helper.loginRequired().then(rs => {
      if (rs === 'login') {
        window.location.href = '/login';
      }
    })
  }
  showRequireActive() {
    services.helper.requestActive().then(rs => {
      if (rs === 'active') {
        window.location.href = '/login/update-information'
      }
    })
  }
  async onReactClick(evt) {
    evt.preventDefault();
    if (!services.helper.checkLogged()) {
      return this.showRequireLogin();
    }
    if (!services.helper.checkActive()) {
      return this.showRequireActive()
    }
    if (this.props.onReact) {
      this.props.onReact();
    }
    services.data.reactPost(this.props.id);
    console.log(services.local.get('userInfo'))
  }
  onCommentClick(evt) {
    amplitude.getInstance().logEvent('Comment Action')
    evt.preventDefault();
    if (!services.helper.checkLogged()) {
      return this.showRequireLogin();
    }
    if (!services.helper.checkActive()) {
      return this.showRequireActive()
    }
    if (this.props.focusComment) {
      this.props.focusComment();
    }
  }
  onShareClick(e) {
    e.preventDefault()
    this.setState(currentState => ({
      showShareDropdown: !currentState.showShareDropdown
    }))
  }
  renderBig() {
    return <div className="d-flex align-items-center w-100 border-bottom">
      <div className="post-item__actions gapo-group">
        <a className={`post-item__action ${this.props.react_status ? 'active' : ''}`} onClick={this.onReactClick.bind(this)}>
          <i className="gapo-icon icon-like mr-2" />
          Thích
          </a>
        <a className="post-item__action" onClick={this.onCommentClick.bind(this)}>
          <i className="gapo-icon icon-comment-alt mr-2" />
          Bình luận
          </a>
        <a className="post-item__action w-100 d-flex align-items-center justify-content-center" onClick={() => {
          if (this.props.onShareClick) {
            this.props.onShareClick();
          }
        }} id="post-share" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i className="gapo-icon icon-share-alt mr-2" />
          Chia sẻ
          </a>
      </div>
      <div className="post-item__stats d-flex">
        <a className="post-item__stats__item d-flex align-items-center mr-auto text-dark">
          <i className="svg-icon icon-like-circle mr-1" />
          {services.helper.formatNumber(this.props.react_count)} thích</a>
        <a className="post-item__stats__item text-dark">{services.helper.formatNumber(this.props.comment_count)} bình luận</a>
        <a className="post-item__stats__item text-dark" >0 chia sẻ</a>
      </div>
    </div>
  }
  showUserLike() {
    services.helper.showUserLikePost(this.props.id)
  }
  renderMedium() {
    return <React.Fragment>
      <div className="post-item__stats d-flex">
        <a className="post-item__stats__item d-flex align-items-center mr-auto text-dark" onClick={this.showUserLike.bind(this)}>
          <i className="svg-icon icon-like-circle mr-1" /> {services.helper.formatNumber(this.props.react_count)} thích</a>
        <a className="post-item__stats__item text-dark" >{services.helper.formatNumber(this.props.comment_count)}  bình luận</a>
        {/* <a className="post-item__stats__item text-dark">{services.helper.formatNumber(this.props.view_count)} chia sẻ</a> */}
      </div>
      <div className="post-item__actions gapo-group">
        <a onClick={this.onReactClick.bind(this)} className={`post-item__action ${this.props.react_status ? 'active' : ''}`} style={{ position: 'relative' }}>
          {/* for future update
          <div className="reaction-box">
            <div className="reaction-icon" style={{ marginLeft: 0 }}>
              <label>Thích</label>
            </div>
            <div className="reaction-icon">
              <label>Mê</label>
            </div>
            <div className="reaction-icon">
              <label>Haha</label>
            </div>
            <div className="reaction-icon">
              <label>Wow</label>
            </div>
            <div className="reaction-icon">
              <label>Buồn</label>
            </div>
            <div className="reaction-icon">
              <label>Hờn</label>
            </div>
          </div> */}
          <i className="gapo-icon icon-like mr-2" />
          Thích
        </a>
        <a onClick={this.onCommentClick.bind(this)} className='post-item__action'>
          <i className="gapo-icon icon-comment-alt mr-2" />
          Bình luận
        </a>
        <a className="post-item__action w-100 d-flex align-items-center justify-content-center" onClick={() => {
          if (this.props.onShareClick) {
            this.props.onShareClick();
          }
        }} id="post-share" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <i className="gapo-icon icon-share-alt mr-2" />
          Chia sẻ
          </a>
      </div>
    </React.Fragment>
  }
  render() {
    switch (this.props.size) {
      case 'big':
        return this.renderBig();
      default:
        return this.renderMedium();
    }
  }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps)(PostActions);