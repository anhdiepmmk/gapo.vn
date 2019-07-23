import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import services from '../services';
import Loading from './Loading';
import config from '../services/config';
import { withRouter } from "react-router";
import amplitude from 'amplitude-js';

class SearchHeader extends React.Component {
    constructor(props) {
        super(props);
        let indicator = this.calcIndicator(window.location.pathname);
        this.state = {
            ...indicator,
            openSearch: false,
            searchUsers: [],
            searchPosts: [],
            keyword: '',
            typingTimeout: 0,
            userLoading: true,
            postLoading: true,
            showConfig: false,
            myPages: []
        }
    }
    componentWillReceiveProps(next) {
        let indicator = this.calcIndicator(window.location.pathname);
        this.setState({ ...indicator });
    }
    calcIndicator(hash) {
        return {
            feed: hash === '/' ? 'active' : '',
            video: hash === '/video' ? 'active' : '',
            messenger: hash === '/messenger' ? 'active' : '',
            notification: hash === '/notification' ? 'active' : '',
            listFriend: hash === '/listFriend' ? 'active' : '',
            profile: hash.substr(0, 8) === '/profile' ? 'active' : '',
            page: hash.substr(0, 5) === '/page' ? 'active' : '',
        }
    }
    componentDidMount() {
        services.helper.getNotification();
        this.loadMyPage()
    }
    typingTimeout = 0;
    async search(query) {
        if (query.length < 3) return;
        this.setState({ userLoading: true, postLoading: true, openSearch: true });
        let searchUsers = await services.data.searchUser(query);
        this.setState({ openSearch: true, searchUsers, userLoading: false });
        let searchPosts = await services.data.searchPost(query);
        this.setState({ openSearch: true, searchPosts, postLoading: false });
    }
    handleSearchChange(event) {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
        this.setState({ keyword: event.target.value });
        this.typingTimeout = setTimeout(() => {
            this.search(this.state.keyword);
        }, 1000)
    }

    async loadMyPage() {
        let rs = await services.data.listPage({ limit: null, own: this.props.user.id });
        this.setState({ myPages: rs });
    }
    async logout() {
        services.local.clear();
        this.unregisterNotification()
        window.location.href = '/';
    }

    async unregisterNotification() {
        try {
            let fcm_token = await window.requestNotificationPermission()
            await services.data.unregisterNotification({ fcm_token })
        } catch (error) {
            console.log('Cannot unregister notification');
            // services.helper.alert(error.message);
        }
    }

    renderUsers() {
        if (this.state.userLoading) return <Loading type='friend' />;
        if (this.state.searchUsers.length === 0) return <p className='p-3 m-0'>Không có kết quả</p>
        return this.state.searchUsers.map((item, index) => <DropdownItem key={index} className='search-user-item' onClick={() => {
            window.location.href = item._profileUrl;
        }}>
            <div className="gapo-avatar gapo-avatar--48 mr-2 cursor" style={{ backgroundImage: `url(${item.avatar})` }}>
                {/* <img src={item.avatar} alt="avatar" className='img-fluid' /> */}
            </div>
            <a>{item.display_name}</a>
            <div className="text-secondary font-size-small">{item.email}</div>
        </DropdownItem >)
    }
    renderPosts() {
        if (this.state.postLoading) return <Loading type='friend' />;
        if (this.state.searchPosts.length === 0) return <p className='p-3 m-0'>Không có kết quả</p>
        return this.state.searchPosts.map((item, index) => <DropdownItem key={index} className='search-post-item'
            onClick={evt => {
                this.setState({ openSearch: false });
                services.helper.showPost(item.id);
            }}>
            {item.content}
        </DropdownItem>)
    }
    renderSearhForm() {
        return <div className="header__search-box" id="js-search-box">
            <form className="header__search-form">
                <div className="search-box__icon d-flex align-items-center align-items-center font-size-large">
                    <i className="gapo-icon icon-search-alt" />
                </div>
                <Dropdown isOpen={this.state.openSearch && this.state.keyword !== ''} toggle={() => {
                    this.setState({ openSearch: !this.state.openSearch })
                }}>
                    <DropdownToggle className='hidden' size='sm' color='link'>
                        <div onClick={() => {
                            if (!services.helper.checkLogged()) {
                                services.helper.loginRequired()
                            }
                        }}>
                            <input
                                disabled={!services.helper.checkLogged()}
                                onKeyDown={evt => {

                                    if (evt.keyCode === 13) {
                                        evt.preventDefault();
                                        window.location.href = `/search/${this.state.keyword}`
                                    }
                                }}
                                id="js-search-input" type="text" onChange={this.handleSearchChange.bind(this)} className="search-box__input form-control border-0 font-size-normal shadow-none" placeholder="Tìm kiếm" />
                        </div>
                    </DropdownToggle>
                    <DropdownMenu left="true">
                        <DropdownItem header>NGƯỜI DÙNG</DropdownItem>
                        {this.renderUsers()}
                        <DropdownItem header>BÀI VIẾT</DropdownItem>
                        {this.renderPosts()}
                    </DropdownMenu>
                </Dropdown>

            </form>
        </div>
    }
    toggleConfig() {
        this.setState({ showConfig: !this.state.showConfig })
    }
    render() {
        return <header className="gapo-header">
            <div className="d-flex align-items-center">
                <a href="/" className="header__brand mr-3">
                    <img src="/assets/images/logo.svg" height={30} alt="GAPO" className="header__logo" />
                </a>
                {this.renderSearhForm()}
                <ul className="header__nav header__nav--main d-flex align-items-center list-unstyled ml-auto">
                    <li>
                        <Link to='/' onClick={() => amplitude.getInstance().logEvent('Tab_ Newsfeed')} className={this.state.feed}>
                            <i className="svg-icon icon-home-alt inactive" />
                            <i className="svg-icon icon-home-active active" />
                        </Link>
                    </li>
                    <li>
                        <Link to='/page' onClick={() => amplitude.getInstance().logEvent('Tab_ Page')} className={this.state.page}>
                            <i className="svg-icon icon-flag-alt  inactive" />
                            <i className="svg-icon icon-flag-active active" />
                        </Link>
                    </li>
                    <li>
                        <Link to='/video' onClick={() => amplitude.getInstance().logEvent('Tab_ Video')} className={this.state.video}>
                            <i className="svg-icon icon-video-alt inactive" />
                            <i className="svg-icon icon-video-active active" />
                        </Link>
                    </li>
                    <li>
                        <Link to='/profile' onClick={() => amplitude.getInstance().logEvent('Tab_ Profile')} className={`avatar ${this.state.profile}`}>
                            <div className="gapo-avatar gapo-avatar--32" style={{ backgroundImage: `url(${this.props.user.avatar})` }}>
                                {/* <img src={this.props.user.avatar} alt='avatar' /> */}
                            </div>
                        </Link>
                    </li>
                    <li>
                        <a className={this.state.notification}
                            onClick={() => {
                                if (!services.helper.checkActive()) {
                                    return services.helper.requestActive().then(rs => {
                                        if (rs === 'active') {
                                            window.location.href = '/login/update-information'
                                        }
                                    })
                                }
                                services.helper.refreshNotificationStats();
                                this.props.history.push('/notification')
                                amplitude.getInstance().logEvent('Tab_ Notification');
                            }}>
                            <i className="svg-icon icon-bell-alt inactive" />
                            <i className="svg-icon icon-bell-active active" />
                            {this.props.notification.count > 0 ? <span className='notification-badge'>{this.props.notification.count}</span> : null}
                        </a>
                    </li>
                    <li>
                        <Link to='/listFriend' onClick={() => amplitude.getInstance().logEvent('Tab_ Friend')} className={this.state.listFriend}>
                            <i className="svg-icon icon-friends-alt inactive" />
                            <i className="svg-icon icon-friends-active active" />
                        </Link>
                    </li>
                    <li>
                        <Link to='/messenger' onClick={() => amplitude.getInstance().logEvent('Tab_ Chat')} className={this.state.messenger}>
                            <i className="svg-icon icon-chat-alt inactive" />
                            <i className="svg-icon icon-chat-active active" />
                        </Link>
                    </li>
                </ul>

                <ul className="header__nav header__nav--right d-flex align-items-center list-unstyled ml-auto">
                    {this.props.user.id ?
                        <li className="dropdown header__nav__item--menu">
                            <Dropdown isOpen={this.state.showConfig} toggle={this.toggleConfig.bind(this)}>
                                <DropdownToggle style={{ paddingTop: 0, paddingBottom: 0 }} className='hidden' size='md' color='link'>
                                    <i style={{ fontSize: 30 }} className="gapo-icon icon-menu"></i>
                                </DropdownToggle>
                                <DropdownMenu left="true">
                                    {this.state.myPages.length > 0 ? this.state.myPages.map((item, index) => {
                                        return <DropdownItem
                                            key={index}>
                                            <Link className="dropdown-item media align-items-center py-1" to={`/pagepreview/${item.id}`}>
                                                <div className="gapo-avatar gapo-avatar--32 mr-2" style={{ backgroundImage: `url(${item.avatar && item.avatar != "undefined" ? item.avatar : config.defaultPageAvatar})` }}></div>
                                                {item.title}
                                            </Link>
                                        </DropdownItem>
                                    }) : null}

                                    {/* <DropdownItem>Cài đặt</DropdownItem>
                                    <DropdownItem>Hỗ trợ</DropdownItem> */}
                                    <DropdownItem onClick={() => {
                                        this.logout();
                                    }}>Đăng xuất</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </li>
                        : <li className="header__nav__item--button">
                            <Link to='/login' className="btn btn-primary btn-sm">
                                Đăng nhập
                            </Link>
                        </li>}
                </ul>
            </div>
        </header>
    }
}
const mapStateToProps = (state) => { return { user: state.user, notification: state.notification } }
export default connect(mapStateToProps)(withRouter(SearchHeader));