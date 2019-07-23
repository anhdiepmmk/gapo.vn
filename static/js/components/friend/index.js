import React from 'react';
import configStore from '../../configStore';
import Friend from './Friend';
import FriendRequest from './FriendRequest';
import FriendSent from './FriendSent';
import { connect } from 'react-redux';
class FriendPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tab: 0
        }
    }
    componentDidMount() {
        configStore().dispatch({ type: 'UPDATE_BODY_CLASSES', data: '' })
    }
    onBackClick(evt) {
        evt.preventDefault();
        window.history.back();
    }
    changeTab(tab) {
        this.setState({ tab });
    }
    render() {
        let tabContent = [<Friend />, <FriendRequest />, <FriendSent />];
        return <div>
            <nav className="gapo-navbar gapo-navbar--default d-flex align-items-center">
                <a href="/" onClick={this.onBackClick} title="Trờ lại" className="navbar__action">
                    <i className="gapo-icon icon-arrow-left" />
                </a>
                <div className="navbar__content pr-5">Bạn bè của {this.props.user.display_name}</div>
            </nav>
            <div className="gapo-page">
                <div className="gapo-nav-tab border-top-0">
                    <a href="/" onClick={evt => { evt.preventDefault(); this.changeTab(0) }} className={['nav-tab__item', 'py-2', this.state.tab === 0 ? 'active' : ''].join(' ')}>
                        <i className="gapo-icon icon-friends nav-tab__icon" />
                        <small className="d-block mt-1">Bạn bè</small>
                    </a>
                    <a href="/" onClick={evt => { evt.preventDefault(); this.changeTab(1) }} className={['nav-tab__item', 'py-2', this.state.tab === 1 ? 'active' : ''].join(' ')}>
                        <i className="gapo-icon icon-friend-request nav-tab__icon" />
                        <small className="d-block mt-1">Yêu cầu</small>
                    </a>
                    <a href="/" onClick={evt => { evt.preventDefault(); this.changeTab(2) }} className={['nav-tab__item', 'py-2', this.state.tab === 2 ? 'active' : ''].join(' ')}>
                        <i className="gapo-icon icon-friend-sent nav-tab__icon" />
                        <small className="d-block mt-1">Đã gửi</small>
                    </a>
                </div>
                {tabContent[this.state.tab]}
            </div>
        </div >
    }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null, { forwardRef: true })(FriendPage);