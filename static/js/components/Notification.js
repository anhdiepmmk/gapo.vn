import React from 'react';
import SearchHeader from './SearchHeader';
// import Footer from '../components/Footer';
import configStore from '../configStore';
// import { Link } from 'react-router-dom';
import Feed from './feed/Feed'
import { connect } from 'react-redux';
import services from '../services';
import InfiniteScroll from 'react-infinite-scroller';
import Loading from './Loading';
import _ from 'lodash';
import PostDetail from './post/PostDetail'
import PerfectScrollbar from 'react-perfect-scrollbar'
const LIMIT = 10;
const PubSub = require('pubsub-js');

class Notification extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasMore: true,
      notifications: [],
      activeId: '',
      postId: '',
      inProcess: false
    }
  }
  subscribeNoti(props) {
    PubSub.subscribe("notification", (data) => {
      console.log('data notification', data);

    });
  }
  componentDidMount() {
    configStore().dispatch({ type: 'UPDATE_BODY_CLASSES', data: 'has-bottom-nav fixed-top-nav page-notification' });
    this.subscribeNoti();
  }
  componentWillUnmount() {
    PubSub.unsubscribe("notification");
  }
  loading = false
  async loadMoreNotifications() {
    if (this.loading) return;
    this.setState({
      inProcess: true
    })
    this.loading = true
    let hasMore = true;
    let rs = await services.data.getAllNotifications(this.state.notifications.length, LIMIT);
    if (rs.data.length < LIMIT) hasMore = false;
    let notifications = this.state.notifications.concat(rs.data);
    this.setState({ notifications, hasMore, inProcess: false });
    this.loading = false
  }

  renderContentRight() {
    if (this.state.inProcess && this.state.notifications.length == 0) {
      return <div style={{ textAlign: 'center', marginTop: 10 }}>Đang xử lý...</div>
    }
    if (!this.state.inProcess && this.state.notifications.length == 0) {
      return (<div style={{ marginTop: '3rem' }} className="text-center mt-10">
        <svg width={41} height={47} viewBox="0 0 41 47" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M39.5 36.5C39.5 36.5 34.5 29.5 34.5 23.5V15.5C34.5 11.787 33.025 8.22601 30.3995 5.6005C27.774 2.975 24.213 1.5 20.5 1.5C16.787 1.5 13.226 2.975 10.6005 5.6005C7.975 8.22601 6.5 11.787 6.5 15.5V23.5C6.5 29.5 1.5 36.5 1.5 36.5H39.5Z" fill="#E5E5E5" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M25.5 40.5C25.5 41.8261 24.9732 43.0979 24.0355 44.0355C23.0979 44.9732 21.8261 45.5 20.5 45.5C19.1739 45.5 17.9021 44.9732 16.9645 44.0355C16.0268 43.0979 15.5 41.8261 15.5 40.5" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="font-size-large font-weight-semi-bold text-secondary secondary mt-3">
          Bạn chưa có thông báo nào
      </div>
      </div>)
    }
    return this.state.postId ? <PostDetail layout='vertical' display='collapse' id={this.state.postId} /> : null
  }
  render() {
    return <div>
      <SearchHeader />
      <main className="gapo-main row">
        <div className="col col-360">
          <div className="aside__wrapper">
            <PerfectScrollbar>
              {this.Silebar()}
            </PerfectScrollbar>

          </div>
        </div>
        <div className="col">
          <div className="row justify-content-center p-2">
            <div className='col col-500'>
              {this.renderContentRight()}
            </div>

          </div>
        </div>
      </main>
    </div>
  }
  handleNotificationClick(index) {
    let item = this.state.notifications[index];
    if (item.status !== 'seen_and_read') {
      let notifications = _.cloneDeep(this.state.notifications);
      notifications[index].status = 'seen_and_read';
      this.setState({ notifications });
    }
    this.setState({ activeId: item.id });
    services.data.markNotificationAsRead(item.id);
    switch (item.type) {
      case 'accept_friend_request':
        let userId = item.url.replace('gapo://user/', '');
        window.location.href = `/${userId}`
        break;
      case 'request_friend':
        window.location.href = `/listFriend`
        break;
      case 'video_processing_complete':
        let arr = item.url.split('/');
        let id = arr[arr.length - 1];
        this.setState({ postId: id });
        break;
      case 'react_on_post':
      case 'comment_on_own_post':
      case 'react_on_comment':
      case 'reply_on_subscripted_comment_owned_post':
      case 'reply_on_own_comment':
      case 'comment_on_subscripted_post':
      case 'reply_on_subscripted_comment':

      default:
        this.setState({ postId: item.subscription.targetId });
        break;

    }
  }
  convertHighlights = (str, hightlights) => {
    if (!hightlights) return str;
    if (hightlights.length === 0) return str;
    let arr = [];
    arr.push({
      bold: false,
      text: str.substr(0, hightlights[0].offset)
    });
    for (var i = 0; i < hightlights.length; i++) {
      let h = hightlights[i], next = hightlights[i + 1];
      arr.push({
        bold: true,
        text: str.substr(h.offset, h.length)
      });
      if (next) {
        arr.push({
          bold: false,
          text: str.substr(h.offset + h.length, next.offset - h.offset - h.length)
        })
      } else {
        arr.push({
          bold: false,
          text: str.substr(h.offset + h.length, str.length - h.offset - h.length)
        })
      }
    }
    let rs = '';
    arr.map(i => {
      if (i.bold) {
        rs += ` <span class="font-weight-semi-bold">${i.text}</span>`
      } else {
        rs += i.text;
      }
    })
    return rs;
  }
  renderIcon(item) {
    let name = 'gapo-icon icon-2x icon-';
    switch (item.type) {
      case 'accept_friend_request': return name += 'friends'
      case 'react_on_post': return name += 'like'
      case 'comment_on_own_post':
      case 'react_on_comment':
      case 'reply_on_subscripted_comment_owned_post':
      case 'reply_on_own_comment':
      case 'comment_on_subscripted_post':
      case 'reply_on_subscripted_comment':
      default: return name += 'comment-alt'
    }
  }
  renderItems() {
    return <ul className="gapo-side-menu list-unstyled mt-4">
      {this.state.notifications.map((item, index) => {
        let className = '';
        let read = 'side-menu__item alpha media align-items-center'
        let unread = 'side-menu__item alpha notification--unread media align-items-center'
        let active = 'side-menu__item alpha active media align-items-center'
        if (item.status === 'seen_and_read') className = read;
        if (item.status === 'unseen_and_unread') className = unread;
        if (item.id == this.state.activeId) className = active;
        return (
          <li
            key={'notification' + index}
            onClick={() => {
              this.handleNotificationClick(index);
            }}>
            <a className={className}>
              <div className="gapo-avatar gapo-avatar--64 mr-2" style={{ backgroundImage: `url(${item.image})` }}>
                {/* <img src alt /> */}
              </div>
              <div className="notification__icon d-flex align-items-center justify-content-center bg-blue">
                <i className={this.renderIcon(item)} />
              </div>
              <div className="media-body pl-1">
                <div className="mb-1 text-overflow-tow-lines" dangerouslySetInnerHTML={{ __html: this.convertHighlights(item.message.text, item.message.highlights) }}>
                </div>
                <div className="text-secondary font-size-small">{services.helper.getDuration(item.updatedAt)}</div>
              </div>
            </a>
          </li>
        )
      })}
    </ul>
  }
  Silebar = () => {
    return (
      <InfiniteScroll
        threshold={100}
        pageStart={0}
        loadMore={() => {
          this.loadMoreNotifications()
        }}
        hasMore={this.state.hasMore}
        loader={<Loading full key={0} type='post' />}
        useWindow={false}
      >
        <aside className="d-flex align-content-between flex-wrap">
          <div className="w-100 py-4">
            <h3 className="gapo-title px-3">Thông báo</h3>
            {this.renderItems()}
          </div>
        </aside>

      </InfiniteScroll>


    )
  }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null, { forwardRef: true })(Notification);