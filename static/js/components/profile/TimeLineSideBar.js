import React from 'react';
import services from '../../services';
import { Link } from 'react-router-dom';

export default class TimeLineSideBar extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  renderPhotos() {
    if (this.props.photos.length === 0) return null;
    let data = [...this.props.photos];
    data.length = 9;
    return (
      data.map((item, index) => {
        if (item.mediaData.length == 0) return null;
        return <div className="col-4" key={'indexTime' + index} onClick={() => {
          services.helper.showPostWithContent(item.id, 0, item);
        }}>
          <div className="gapo-thumbnail gapo-thumbnail--1x1 mb-2" key={index} style={{ backgroundImage: `url(${item.mediaData[0].src})`, cursor: 'pointer' }} >
          </div>
        </div>
      }

      )
    )
  }

  renderFriends() {
    if (this.props.listFrends.length == 0) return null;
    let sortListFriend = [...this.props.listFrends];
    sortListFriend.length = 9;
    return (
      sortListFriend.map((item, index) => {
        return <div key={index} className="col-4 p-1">
          <div className="position-relative">
            <Link to={`${item._profileUrl}`} className="gapo-avatar rounded-0" style={{ backgroundImage: `url(${item.avatar})` }}>
              {/* <img className="w-100" src={item.avatar} /> */}
            </Link>
            <Link to={`${item._profileUrl}`} className="timeline-friend-item__name text-center p-1 text-white font-weight-semi-bold text-overflow-ellipsis">
              {item.display_name}
            </Link>
          </div>
        </div>
      })
    )
  }

  render() {
    let { listFrends, setTabIndex, user } = this.props;
    let { user_info } = user;
    return <div>
      {user_info ? <div className="rounded bg-white shadow mb-3 p-3">
        <div className="gapo-title timeline__title">Giới thiệu</div>
        <ul className="list-unstyled mt-2">
          {user_info.job && user_info.companyname ? <li className="flex align-items-center mb-2 "><i className="gapo-icon icon-briefcase-alt mr-2" />{user_info.job} tại <span className="font-weight-semi-bold">{user_info.companyname}</span></li> : null}
          {user_info.education ? <li className="flex align-items-center mb-2"><i className="gapo-icon icon-graduation-cap-alt mr-2" />Học tập tại <span className="font-weight-semi-bold">{user_info.education}</span></li> : null}
          {user_info.province ? <li className="flex align-items-center mb-2"><i className="gapo-icon icon-home-alt mr-2" />Sống tại <span className="font-weight-semi-bold">{user_info.province}</span></li> : null}
          {user_info.address ? <li className="flex align-items-center mb-2"><i className="gapo-icon icon-location-alt mr-2" />Đến từ <span className="font-weight-semi-bold">{user_info.address}</span></li> : null}
          {user_info.relationship ? <li className="flex align-items-center mb-2"><i className="gapo-icon icon-heart mr-2" />{user_info.relationship}</li> : null}
        </ul>
      </div> : null}
      <div className="rounded bg-white shadow mb-3 p-3">
        <div className="d-flex align-items-center">
          <div className="gapo-title timeline__title">Ảnh</div>
          <a onClick={() => { setTabIndex(4) }} className="ml-auto text-primary">Xem tất cả </a>
        </div>
        <div className="row mt-2">
          {this.renderPhotos()}
        </div>
      </div>
      <div className="rounded bg-white shadow mb-3 p-3">
        <div className="d-flex align-items-center">
          <div className="gapo-title timeline__title">Bạn bè</div>
          <span className="ml-2 text-secondary">{listFrends.length}</span>
          <a onClick={() => { setTabIndex(3) }} className="ml-auto text-primary">Tất cả bạn bè </a>
        </div>
        <div className="row mt-2">
          {this.renderFriends()}
        </div>
      </div>
    </div>

  }
}