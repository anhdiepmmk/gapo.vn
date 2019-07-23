import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import helper from '../../services/helper'
import Create from '../Create';
class QuickPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false
    }
  }
  showRequireActive() {
    helper.requestActive().then(rs => {
      if (rs === 'active') {
        window.location.href = '/login/update-information'
      }
    })
  }
  async  onCreateClick() {
    let login = helper.checkLogged();
    if (!login) return helper.loginRequired().then(rs => {
      if (rs === 'login') {
        window.location.href = '/login';
      }
    })
    if (!helper.checkActive()) {
      return this.showRequireActive()
    }
    this.setState({ expand: true });
    // services.helper.showCreateModal();
  }
  renderExpand() {
    return <Create
      page={this.props.page}
      onClose={rs => {
        if (rs && this.props.onNewPost) {
          this.props.onNewPost(rs);
        }
        this.setState({ expand: false });
      }}
      target={this.props.target}
    />
  }
  renderQuick() {
    let actor = this.props.user;
    if (this.props.page) {
      actor = this.props.page;
    }
    return <div className="gapo-box pb-2 create-post position-static ">
      <div className="d-flex align-items-center mb-2">
        <a className="post-item__avatar gapo-avatar gapo-avatar--48 mr-2" style={{ backgroundImage: `url(${actor.avatar})` }}>
          {/* <img src alt /> */}
        </a>
        <button className="btn btn-block btn-primary-light font-size-large line-height ml-1" onClick={() => {
          this.onCreateClick();
        }}>Đăng bài viết</button>
      </div>
      <div className="create-post__actions d-flex border-0">
        <a className="create-post__actions__item p-2 d-flex align-items-center justify-content-center" onClick={() => {
          this.onCreateClick();
        }}>
          <i className="gapo-icon icon-picture-landscape-2 create-post__icon text-dark mr-2" />
          Ảnh/Video
      </a>
        <a className="create-post__actions__item p-2 d-flex align-items-center justify-content-center" onClick={() => {
          this.onCreateClick();
        }}>
          <i className="gapo-icon icon-tag-friends create-post__icon text-dark mr-2" />
          Gắn thẻ bạn bè
      </a>
        {/* <a className="create-post__actions__item p-2 d-flex align-items-center justify-content-center" onClick={() => {
          this.onCreateClick();
        }}>
          <i className="gapo-icon icon-emotion create-post__icon mr-2" />
          Cảm xúc
      </a> */}
      </div>
    </div>
  }
  render() {
    return <React.Fragment>
      <div className={`gapo-overlay ${this.state.expand ? 'show' : ''}`} onClick={() => { this.setState({ expand: false }) }}></div>
      {this.state.expand ? this.renderExpand() : this.renderQuick()}
    </React.Fragment>
  }
}

const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null, { forwardRef: true })(QuickPost);