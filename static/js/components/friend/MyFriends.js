import React, { Component } from 'react';
import services from '../../services'
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import Loading from '../Loading';
import InfiniteScroll from 'react-infinite-scroller';
class Relation extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dropdownOpen: false

        }
        this.toggle = this.toggle.bind(this);
    }
    toggle() {
        this.setState({
            dropdownOpen: !this.state.dropdownOpen
        });
    }
    render() {
        let { item, index, isMe, cancelFriend, requestUserRelation } = this.props;
        if (isMe) return (
            <div style={{ height: 28 }} />
        )
        if (item.relation === "pending") {
            return (
                <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                    <DropdownToggle className="btn btn-light btn-sm" >
                        <i className="gapo-icon icon-check mr-1 font-size-small" />
                        Đã gửi lời mời
                </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem onClick={() => cancelFriend(item.id, index)}>Huỷ lời mời</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            )
        }
        if (item.relation === "friend") {
            return (
                <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                    <DropdownToggle className="btn btn-block btn-sm btn-light" >
                        <i className="gapo-icon icon-check mr-1 font-size-small" />
                        Bạn bè
                </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem >Nhận thông báo</DropdownItem>
                        <DropdownItem onClick={() => cancelFriend(item.id, index)}>Huỷ kết bạn</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            )
        }
        return (
            <a onClick={() => requestUserRelation(item.id, index)} className="btn btn-block btn-sm btn-primary">
                <i className="gapo-icon icon-add-friend mr-1" />
                Kết bạn
                </a>
        )

    }
}
class MyFriends extends Component {
    constructor(props) {
        super(props);
        this.state = {
            countReciveFriend: 0,
            listFriend: [],
            textSearch: '',
            userId: this.props.user_id,
            hasMore: true,
            countFriend: 0,
            noFriend: false,
            page: 1,
        }
        this.search = this.search.bind(this)
    }
    componentDidMount() {
        this.countFriend();
        if (this.state.userId == this.props.user.id) this.getCountRequestFriend();
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ userId: nextProps.user_id }, () => {
            this.getListFirend();
            this.countFriend();
            if (this.state.userId == this.props.user.id) this.getCountRequestFriend();
        })
    }
    async countFriend() {
        let rs = await services.data.listFriendUserRelation(null, null, null, this.state.userId);
        this.setState({ countFriend: rs.length, noFriend: rs.length ? false : true });
    }
    async getCountRequestFriend() {
        let rs = await services.data.countRequestFriend(this.state.userId);
        this.setState({ countReciveFriend: rs });
    }
    loading = false
    async getListFirend() {
        this.loading = true;
        let res
        let { listFriend, hasMore, page } = this.state;
        let limit = 15;
        if (listFriend.length && hasMore) page += 1
        if (this.props.isMe) {
            res = await services.data.listFriendUserRelation(null, limit, null, null, page)
        } else {
            res = await services.data.listFriendUserRelation(null, limit, null, this.state.userId, page);
        }
        // let rs = await services.data.listFriendUserRelation(from_id, null, null, null);
        if (res.length < limit) hasMore = false
        let data = [...listFriend, ...res];
        this.setState({ listFriend: data, hasMore, page });
        this.loading = false
    }
    async search(event) {
        if (!event.target.value) {
            this.setState({ textSearch: '' });
        } else {
            this.setState({ textSearch: event.target.value, });
        }
        let rs = await services.data.listFriendUserRelation(null, null, event.target.value, this.state.userId);
        this.setState({ listFriend: rs });
    }
    async cancelFriend(id, index) {
        let listFriend = _.cloneDeep(this.state.listFriend);
        listFriend[index].relation = ""
        this.setState({ listFriend });
        let rs = await services.data.cancelUserRelation(id);
    }
    async requestUserRelation(id, index) {
        let listFriend = _.cloneDeep(this.state.listFriend);
        listFriend[index].relation = 'pending'
        this.setState({ listFriend });
        let rs = await services.data.requestUserRelation(id);
    }

    render() {
        let { countReciveFriend, listFriend, textSearch, countFriend, noFriend } = this.state;
        let { isMe } = this.props
        return (
            <div>
                <div className="d-flex align-items-center mb-3 pt-2">
                    <h1 className="gapo-title">Bạn bè</h1>
                    <span className="ml-2 text-secondary">{countFriend} bạn</span>
                    <Link to='/listFriend' className="btn btn-sm mr-2 d-flex align-items-center ml-auto" >
                        {isMe && 'Lời mời kết bạn'}
                        {isMe && <span className="gapo-badge danger ml-2">{countReciveFriend}</span>}
                    </Link>
                    {/* <button className="btn btn-sm mr-2 d-flex align-items-center">
                        <i className="gapo-icon icon-add-friend icon-2x mr-1" />
                        Tìm bạn bè
                    </button> */}
                    <form className="friend__search-box position-relative">
                        <div className="search-box__icon d-flex align-items-center align-items-center font-size-large">
                            <i className="gapo-icon icon-search-alt" />
                        </div>
                        <input value={this.state.textSearch} onChange={this.search} type="text" className="form-control form-control-sm" placeholder="Tìm kiếm bạn bè" aria-label="Username" aria-describedby="basic-addon1" />
                    </form>
                </div>
                <div className="rounded bg-white shadow mb-3 gapo-box">
                    <InfiniteScroll
                        threshold={50}
                        pageStart={0}
                        loadMore={() => {
                            if (this.loading || this.state.textSearch) return
                            this.getListFirend()
                        }}
                        hasMore={this.state.hasMore}
                        loader={
                            <div className="timeline-wrapper">
                                <div className="timeline-item">
                                    <div className="animated-background sm">
                                    </div>
                                </div>
                            </div>
                        }
                    >
                        <div className="friend__list row">

                            {listFriend.length ? listFriend.map((item, index) => {
                                if (item.relation === 'block' || item.relation === "blocked") return
                                return (
                                    <div className="col-2dot4 px-1" key={index + 'myfriend'}>
                                        <div className="profile-friend-item mb-2">
                                            <Link to={item._profileUrl} className="profile-friend-item__thumbnail gapo-thumbnail gapo-thumbnail--16x9 rounded-top cursor" style={{ backgroundImage: `url(${item.avatar})` }}>
                                                <img className="w-100" />
                                            </Link>
                                            <div className="text-left profile-friend-item__content">
                                                <a className="d-block text-body font-weight-semi-bold mb-1 text-overflow-ellipsis">{item.display_name}</a>
                                                <div className="text-secondary mb-2">{item.counts.friend_count} bạn</div>
                                                <Relation
                                                    item={item}
                                                    index={index}
                                                    cancelFriend={this.cancelFriend.bind(this)}
                                                    requestUserRelation={this.requestUserRelation.bind(this)}
                                                    isMe={item.id === this.props.user.id ? true : false}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            }) : null}
                            {listFriend.length == 0 && textSearch ? <p>Không có kết quả tìm kiếm cho: {textSearch}</p> : null}
                        </div>

                    </InfiniteScroll>

                    {!listFriend.length && isMe && noFriend ?
                        <div className="rounded bg-white w100 mb-3 p-3">
                            <div className="text-center profile--empty p-4">
                                <svg width="47" height="41" viewBox="0 0 47 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M19.319 28.234L18.961 25.726C23.833 26.833 26.5 25.5 26.5 25.5C24.7544 22.8023 23.7222 19.7056 23.5 16.5V14.774C23.5268 12.7095 22.7721 10.7112 21.3873 9.17985C20.0024 7.64848 18.0898 6.6973 16.033 6.51704C14.9399 6.44405 13.8434 6.59635 12.8116 6.96451C11.7798 7.33266 10.8346 7.90882 10.0346 8.65727C9.23454 9.40572 8.59677 10.3105 8.16079 11.3156C7.7248 12.3206 7.49989 13.4045 7.5 14.5V16.5C7.27783 19.7056 6.2456 22.8023 4.5 25.5C4.5 25.5 7.167 26.833 12.039 25.726L11.681 28.234C11.6275 28.6113 11.4672 28.9655 11.2192 29.2548C10.9712 29.5441 10.6457 29.7565 10.281 29.867L3.638 31.859C3.0201 32.0444 2.47841 32.424 2.09328 32.9415C1.70815 33.4591 1.50011 34.0869 1.5 34.732V39.5H29.5V34.732C29.4999 34.0869 29.2918 33.4591 28.9067 32.9415C28.5216 32.424 27.9799 32.0444 27.362 31.859L20.724 29.867C20.3584 29.7573 20.0318 29.5452 19.7829 29.2559C19.5339 28.9665 19.3729 28.6119 19.319 28.234Z"
                                        fill="#E5E5E5" stroke="#808080" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round"
                                        strokeLinejoin="round" />
                                    <path
                                        d="M35.5 39.5001H45.5V32.6001C45.4999 31.9843 45.3103 31.3835 44.957 30.8791C44.6037 30.3748 44.1037 29.9914 43.525 29.7811L35.625 26.9091C35.2835 26.7855 34.982 26.5713 34.753 26.2895C34.524 26.0076 34.376 25.6687 34.325 25.3091L33.819 21.7661C35.2136 21.131 36.3963 20.1085 37.2262 18.8202C38.0561 17.532 38.4983 16.0324 38.5 14.5001V8.57306C38.4992 7.4159 38.0392 6.30636 37.221 5.48812C36.4027 4.66988 35.2932 4.20985 34.136 4.20906L33.007 1.95006C32.9139 1.77459 32.7618 1.63763 32.5776 1.56335C32.3934 1.48907 32.1888 1.48224 32 1.54406L26.612 3.46706C25.9748 3.70309 25.3859 4.05313 24.874 4.50006"
                                        stroke="#808080" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="my-3 font-weight-semi-bold">Bạn chưa có người bạn nào</div>
                                <Link to={`/suggest`} className="btn btn-primary px-4">
                                    <i className="gapo-icon icon-add-friend mr-1"></i>
                                    Thêm bạn
                                </Link>
                            </div>
                        </div> : null}
                    {noFriend && !isMe && <p>Chưa có người bạn nào!</p>}
                </div>
            </div>
        )
    }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null)(MyFriends);