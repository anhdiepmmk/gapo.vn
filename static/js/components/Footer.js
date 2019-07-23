import React from 'react';
import { Link } from 'react-router-dom';
export default class Footer extends React.Component {
    constructor(props) {
        super(props);
        let hash = window.location.hash;
        this.state = {
            feed: hash === '#/' ? 'active' : '',
            video: hash === '#/video' ? 'active' : '',
            messenger: hash === '/messenger' ? 'active' : '',
            notification: hash === '#/notification' ? 'active' : '',
            profile: hash === '/profile' ? 'active' : '',
        }
    }
    render() {
        return <div className="gapo-bottom-nav gapo-group">
            <Link to={'/'} className={`bottom-nav__item d-block ${this.state.feed}`}>
                <i className=" bottom-nav__icon gapo-icon icon-feed" />
                <small className="bottom-nav__text">
                    Bảng tin
          </small>
            </Link>
            <Link to={'/video'} className={`bottom-nav__item d-block ${this.state.video}`}>
                <i className=" bottom-nav__icon gapo-icon icon-video" />
                <small className="bottom-nav__text">
                    Video
          </small>
            </Link>
            <Link to={'/messenger'} className={`bottom-nav__item d-block ${this.state.messenger}`}>
                <i className=" bottom-nav__icon gapo-icon icon-chat" />
                <small className="bottom-nav__text">
                    Tin nhắn
          </small>
                {/* <small className="bottom-nav__counter rounded-circle"> 1</small> */}
            </Link>
            <Link to={'/notification'} className={['bottom-nav__item', 'd-block', this.state.notification].join(' ')}>
                <i className=" bottom-nav__icon gapo-icon icon-bell" />
                <small className="bottom-nav__text">
                    Thông báo
          </small>
                {/* <small className="bottom-nav__counter rounded-circle">3</small> */}
            </Link>
            <Link to={'/profile'} className={`bottom-nav__item d-block ${this.state.profile}`}>
                <i className=" bottom-nav__icon gapo-icon icon-user" />
                <small className="bottom-nav__text">
                    Tài khoản
          </small>
            </Link>
        </div>

    }
}