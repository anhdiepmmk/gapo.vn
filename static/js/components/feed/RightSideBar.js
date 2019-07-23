import React from 'react';
import services from '../../services';
import Loading from '../Loading';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
class RightSideBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            loading: true,
            search: ''
        }
    }
    componentDidMount() {
        this.load();
        this.chekLogin()
    }
    chekLogin() {
        let login = services.helper.checkLogged();
        if (!login) this.setState({ loading: false })
    }
    async load() {
        let rs = await services.data.listFriendUserRelation(null, 20)
        this.setState({ loading: false, data: rs });
    }
    async createChatChannel(id) {
        let rs = await services.data.chat.createDirectChannel([this.props.user.id_chat, id]);
        window.location.href = `/messenger/${rs.id}`
    }
    renderNoFriend() {
        return <div className="text-center profile--empty p-4">
            <svg width={47} height={41} viewBox="0 0 47 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.319 28.234L18.961 25.726C23.833 26.833 26.5 25.5 26.5 25.5C24.7544 22.8023 23.7222 19.7056 23.5 16.5V14.774C23.5268 12.7095 22.7721 10.7112 21.3873 9.17985C20.0024 7.64848 18.0898 6.6973 16.033 6.51704C14.9399 6.44405 13.8434 6.59635 12.8116 6.96451C11.7798 7.33266 10.8346 7.90882 10.0346 8.65727C9.23454 9.40572 8.59677 10.3105 8.16079 11.3156C7.7248 12.3206 7.49989 13.4045 7.5 14.5V16.5C7.27783 19.7056 6.2456 22.8023 4.5 25.5C4.5 25.5 7.167 26.833 12.039 25.726L11.681 28.234C11.6275 28.6113 11.4672 28.9655 11.2192 29.2548C10.9712 29.5441 10.6457 29.7565 10.281 29.867L3.638 31.859C3.0201 32.0444 2.47841 32.424 2.09328 32.9415C1.70815 33.4591 1.50011 34.0869 1.5 34.732V39.5H29.5V34.732C29.4999 34.0869 29.2918 33.4591 28.9067 32.9415C28.5216 32.424 27.9799 32.0444 27.362 31.859L20.724 29.867C20.3584 29.7573 20.0318 29.5452 19.7829 29.2559C19.5339 28.9665 19.3729 28.6119 19.319 28.234Z" fill="#E5E5E5" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                <path d="M35.5 39.5001H45.5V32.6001C45.4999 31.9843 45.3103 31.3835 44.957 30.8791C44.6037 30.3748 44.1037 29.9914 43.525 29.7811L35.625 26.9091C35.2835 26.7855 34.982 26.5713 34.753 26.2895C34.524 26.0076 34.376 25.6687 34.325 25.3091L33.819 21.7661C35.2136 21.131 36.3963 20.1085 37.2262 18.8202C38.0561 17.532 38.4983 16.0324 38.5 14.5001V8.57306C38.4992 7.4159 38.0392 6.30636 37.221 5.48812C36.4027 4.66988 35.2932 4.20985 34.136 4.20906L33.007 1.95006C32.9139 1.77459 32.7618 1.63763 32.5776 1.56335C32.3934 1.48907 32.1888 1.48224 32 1.54406L26.612 3.46706C25.9748 3.70309 25.3859 4.05313 24.874 4.50006" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="my-3 font-weight-semi-bold">Bạn chưa có người bạn nào</div>
            {services.helper.checkLogged() ? <Link to={`/suggest`} className="btn btn-primary px-4">
                <i className="gapo-icon icon-add-friend mr-1" />
                Thêm bạn
            </Link> :
                <Link to={`/login`} className="btn btn-primary px-4">
                    <i className="gapo-icon icon-add-friend mr-1" />
                    Thêm bạn
    </Link>}
        </div>
    }
    render() {
        let items = <Loading type='friend' />;
        if (!this.state.loading) {
            if (this.state.data.length > 0) {
                items = <React.Fragment>
                    <div className="d-flex align-items-center p-3">
                        <form className="aside__search-box">
                            <div className="search-box__icon d-flex align-items-center align-items-center font-size-large">
                                <i className="gapo-icon icon-search-alt" />
                            </div>
                            <input onChange={evt => {
                                this.setState({ search: evt.target.value })
                            }} id="js-search-input" type="text" className="search-box__input form-control border-0 font-size-normal shadow-none" placeholder="Tìm kiếm" />
                        </form>
                    </div>
                    <div className="chats__list">
                        {this.state.data.map((item, index) => {
                            if (this.state.search) {
                                let search = services.helper.removeAlias(this.state.search).toLowerCase();
                                let name = services.helper.removeAlias(item.display_name).toLowerCase();
                                if (name.indexOf(search) === -1) return;
                            }
                            return <div className="chat__item media" key={index} onClick={() => {
                                this.createChatChannel(item.id_chat);
                            }}>
                                <span className="gapo-avatar gapo-avatar--32 mr-2" style={{ backgroundImage: `url(${item.avatar})` }}>
                                </span>
                                <div className="media-body d-flex">
                                    <div className="chat__info">
                                        <span className="chat__author  d-inline-block">{item.display_name}</span>
                                    </div>
                                    {item.status === 'active' ? <div className="chat__time ml-auto">
                                        <span className="time__active" />
                                    </div> : null}
                                </div>
                            </div>
                        })}
                    </div>
                </React.Fragment>
            } else {
                items = <p className='text-center'>{this.renderNoFriend()}</p>
            }
        }
        return <aside className="gapo-aside gapo-aside--right d-flex align-content-between flex-wrap">
            <div className="w-100 py-3">
                <div className="d-flex align-items-center">
                    <div className="gapo-subtitle px-3">Danh bạ</div>
                    {/* <div className="dropdown aside-item__more ml-auto px-3">
                        <button className="btn btn-transparent shadow-none" type="button" id="aside-dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="gapo-icon icon-more-option float-left" />
                        </button>
                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="aside-dropdown">
                            <a className="dropdown-item" href="#">
                                <div className="media-body pl-1">
                                    <small className="d-block text-secondary">Tắt trạng thái hoạt động</small>
                                </div>
                            </a>
                            <a className="dropdown-item" href="#">
                                <div className="media-body pl-1">
                                    <small className="d-block text-secondary">Tắt tab chát</small>
                                </div>
                            </a>
                            <a className="dropdown-item" href="#">
                                <div className="media-body pl-1">
                                    <small className="d-block text-secondary">Tắt thông báo tin nhắn</small>
                                </div>
                            </a>
                        </div>
                    </div> */}
                </div>
                {items}

            </div>
        </aside>
    }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps)(RightSideBar);