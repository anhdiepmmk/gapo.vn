import React, { Component } from 'react';
import { connect } from 'react-redux';
import SearchHeader from '../SearchHeader';
import Profile from '../profile/Profile'
import services from '../../services';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import PerfectScrollbar from 'react-perfect-scrollbar';

import Relation from './Relation';


class ListFriend extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listFriendYouKnow: [],
            listReceiveUserRelation: [],
            idUser: this.props.user.id,
            countReciveFriend: 0,
        }
        this.setUserId = this.setUserId.bind(this)
    }

    componentDidMount() {

        this.listReceiveUserRelation();
        this.getUser();
        this.getCount();
    }
    async getCount() {
        let rs = await services.data.countRequestFriend(this.props.user.id);
        this.setState({ countReciveFriend: rs });
    }
    async listReceiveUserRelation() {
        let rs = await services.data.listReceiveUserRelation(null, null, null, 10);
        this.setState({ listReceiveUserRelation: rs })
    }
    async getUser() {
        let rs = await services.data.listFriendSuggest(null, 10);
        let list_count_mutual_friend = rs.map(suggestUser => suggestUser.id).map(id => {
            return services.data.countMutualFriends(id, null).catch(() => 0)
        })
        let result_list = await Promise.all(list_count_mutual_friend)
        const result = rs.map((user, index) => ({ ...user, mutual_friend_count: result_list[index] }))
        this.setState({ listFriendYouKnow: result })
    }
    async acceptUserRelation(id, index) {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        let listReceiveUserRelation = _.cloneDeep(this.state.listReceiveUserRelation);
        listReceiveUserRelation[index].relation = 'friend';
        this.setState({ listReceiveUserRelation });
        let rs = await services.data.acceptUserRelation(id);
    }
    async cancelFriend(id, index, type) {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        if (type === 'receive') {
            let listReceiveUserRelation = _.cloneDeep(this.state.listReceiveUserRelation);
            listReceiveUserRelation.splice(index, 1);
            this.setState({ listReceiveUserRelation });
        }
        if (type === 'suggest') {
            let listFriendYouKnow = _.cloneDeep(this.state.listFriendYouKnow);
            listFriendYouKnow[index].relation = '';
            this.setState({ listFriendYouKnow });
        }
        let rs = await services.data.cancelUserRelation(id);
    }
    async removeSuggest(id, index) {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        let listFriendYouKnow = _.cloneDeep(this.state.listFriendYouKnow);
        listFriendYouKnow.splice(index, 1);
        this.setState({ listFriendYouKnow });
        let rs = await services.data.cancelUserRelation(id);
    }
    async requestUserRelation(id, index) {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        let listFriendYouKnow = _.cloneDeep(this.state.listFriendYouKnow);
        listFriendYouKnow[index].relation = 'pending'
        this.setState({ listFriendYouKnow });
        let rs = await services.data.requestUserRelation(id);
    }
    setUserId = (id) => () => {
        this.setState({ idUser: id });
        window.scrollTo(0, 0)
    }
    render() {
        return (
            <div>
                <SearchHeader />
                <main className="gapo-main row">
                    <div className="col col-360">
                        <div className="aside__wrapper">
                            {this.SileBar()}
                        </div>
                    </div>
                    <div className="col">
                        <div className="row justify-content-center">
                            <div className="col col-900 py-4">
                                <Profile user_id={this.state.idUser} />
                            </div>
                        </div>

                    </div>
                </main>
            </div>

        )
    }
    SileBar = () => {
        let { listReceiveUserRelation, listFriendYouKnow, countReciveFriend } = this.state
        return (
            <PerfectScrollbar>
                <aside className="gapo-aside  d-flex align-content-between flex-wrap">

                    <div className="w-100 py-4">
                        <h3 className="gapo-title px-3">Kết bạn</h3>
                        <div className="d-flex mt-4 px-3 py-2 mb-2 align-items-center">
                            <h3 className="gapo-subtitle mb-0">
                                Lời mời kết bạn
                                    <span className="gapo-badge bg-light ml-1">{countReciveFriend}</span>
                            </h3>
                            {/* <a className="ml-auto text-primary">Xem tất cả </a> */}
                        </div>
                        {!listReceiveUserRelation.length ?
                            <div className="text-center py-4">
                                <svg width={47} height={43} viewBox="0 0 47 43" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19.5 39.172C19.5 37.964 18.971 36.815 18.024 36.064C16.578 34.916 14.07 33.5 10.5 33.5C6.93 33.5 4.422 34.916 2.976 36.064C2.029 36.815 1.5 37.964 1.5 39.172V41.5H19.5V39.172Z" fill="#EEEEEE" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M10.5 28.5C13.2614 28.5 15.5 26.2614 15.5 23.5C15.5 20.7386 13.2614 18.5 10.5 18.5C7.73858 18.5 5.5 20.7386 5.5 23.5C5.5 26.2614 7.73858 28.5 10.5 28.5Z" fill="#EEEEEE" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M45.5 39.172C45.5 37.964 44.971 36.815 44.024 36.064C42.578 34.916 40.07 33.5 36.5 33.5C32.93 33.5 30.422 34.916 28.976 36.064C28.029 36.815 27.5 37.964 27.5 39.172V41.5H45.5V39.172Z" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M36.5 28.5C39.2614 28.5 41.5 26.2614 41.5 23.5C41.5 20.7386 39.2614 18.5 36.5 18.5C33.7386 18.5 31.5 20.7386 31.5 23.5C31.5 26.2614 33.7386 28.5 36.5 28.5Z" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M23.5 1.5V13.5" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M17.5 7.5H29.5" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="font-size-large font-weight-semi-bold mt-3 text-secondary">Không có lời mời kết bạn nào</div>
                            </div>
                            :
                            <ul className="gapo-side-menu list-unstyled">
                                {listReceiveUserRelation.map((item, index) => {
                                    // hiển thị giới hạn số lời mời kết ban
                                    if (index > 10) return

                                    if (item.relation == "receive") {
                                        return (
                                            <li key={index}>
                                                <div className="side-menu__item alpha media align-items-center">
                                                    <div className="gapo-avatar gapo-avatar--48 mr-2 cursor" onClick={this.setUserId(item.id)} style={{ backgroundImage: `url(${item.avatar})` }}>
                                                        <img />
                                                    </div>
                                                    <div className="row no-gutters media-body align-items-center">
                                                        <div className="col-6 cursor" onClick={this.setUserId(item.id)}>
                                                            <Link to={item._profileUrl} className="d-block font-weight-semi-bold mb-1 text-overflow-ellipsis pr-1">{item.display_name}</Link>
                                                            <div className="text-secondary font-size-small">{item.count_mutual_friend} bạn chung</div>
                                                        </div>
                                                        <div className="col-6 text-right">
                                                            <button onClick={() => this.acceptUserRelation(item.id, index)} className="btn btn-primary-light btn-sm mr-1">Xác nhận</button>
                                                            <button onClick={() => this.cancelFriend(item.id, index, "receive")} className="btn btn-light btn-sm">Xoá</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        )
                                    }
                                    return (
                                        <li key={index}>
                                            <div className="side-menu__item active alpha media align-items-center">
                                                <div className="gapo-avatar gapo-avatar--48 mr-2 cursor" onClick={this.setUserId(item.id)} style={{ backgroundImage: `url(${item.avatar})` }}>
                                                    <img />
                                                </div>
                                                <div className="row no-gutters media-body align-items-center">
                                                    <div className="col-6 cursor" onClick={this.setUserId(item.id)}>
                                                        <a className="d-block font-weight-semi-bold mb-1 text-overflow-ellipsis pr-1">{item.display_name}</a>
                                                        <div className="text-secondary font-size-small">{item.count_mutual_friend} bạn chung</div>
                                                    </div>
                                                    <div className="col-6 text-right">
                                                        <Relation
                                                            item={item}
                                                            index={index}
                                                            cancelFriend={this.cancelFriend.bind(this)}
                                                            requestUserRelation={this.requestUserRelation.bind(this)}
                                                            removeSuggest={this.removeSuggest.bind(this)}
                                                        />
                                                        {/* <div className="dropdown">
                                                        <button className="btn btn-light btn-sm" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                            <i className="gapo-icon icon-check mr-1 font-size-small" />
                                                            Bạn bè
                                                        </button>
                                                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby>
                                                            <a className="dropdown-item d-flex align-items-center" >
                                                                Huỷ kết bạn
                                                            </a>
                                                        </div>
                                                    </div> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    )
                                })}
                            </ul>


                        }
                        <h3 className="gapo-subtitle mt-4 px-3 py-2">Gợi ý kết bạn</h3>
                        <ul className="gapo-side-menu list-unstyled">
                            {listFriendYouKnow.map((item, index) => {
                                if (item.relation == 'friend') return
                                if (item.relation == 'pending') {
                                    return (
                                        <li key={'indexFrienKnow' + index}>
                                            <div className="side-menu__item alpha media align-items-center">
                                                <div className="gapo-avatar gapo-avatar--48 mr-2 cursor" onClick={this.setUserId(item.id)} style={{ backgroundImage: `url(${item.avatar})` }}>
                                                    <img />
                                                </div>
                                                <div className="row no-gutters media-body align-items-center">
                                                    <div className="col-6 cursor" onClick={this.setUserId(item.id)}>
                                                        <a className="d-block font-weight-semi-bold mb-1 text-overflow-ellipsis pr-1">{item.display_name}</a>
                                                        <div className="text-secondary font-size-small">{item.mutual_friend_count} bạn chung</div>
                                                    </div>
                                                    <div className="col-6 text-right">
                                                        <Relation
                                                            item={item}
                                                            index={index}
                                                            cancelFriend={this.cancelFriend.bind(this)}
                                                            requestUserRelation={this.requestUserRelation.bind(this)}
                                                            removeSuggest={this.removeSuggest.bind(this)}
                                                        />
                                                        {/* <div className="dropdown">
                                                        <button

                                                            className="btn btn-light btn-sm" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                            <i className="gapo-icon icon-check mr-1 font-size-small" />
                                                            Đã gửi lời mời
                                                            </button>
                                                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby>
                                                            <a className="dropdown-item d-flex align-items-center" >
                                                                Huỷ
                                                                 </a>
                                                        </div>
                                                    </div> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>

                                    )
                                }
                                if (!item.relation) {
                                    return (
                                        <li key={'indexFrienKnow' + index}>
                                            <div className="side-menu__item alpha media align-items-center">
                                                <div className="gapo-avatar gapo-avatar--48 mr-2 cursor" onClick={this.setUserId(item.id)} style={{ backgroundImage: `url(${item.avatar})` }}>
                                                    <img />
                                                </div>
                                                <div className="row no-gutters media-body align-items-center">
                                                    <div className="col-6 cursor" onClick={this.setUserId(item.id)}>
                                                        <a className="d-block font-weight-semi-bold mb-1 text-overflow-ellipsis pr-1">{item.display_name}</a>
                                                        <div className="text-secondary font-size-small">{item.mutual_friend_count} bạn chung</div>
                                                    </div>
                                                    <div className="col-6 text-right">
                                                        <Relation
                                                            item={item}
                                                            index={index}
                                                            requestUserRelation={this.requestUserRelation.bind(this)}
                                                            cancelFriend={this.cancelFriend.bind(this)}
                                                            removeSuggest={this.removeSuggest.bind(this)}
                                                        />
                                                        {/* <button onClick={() => this.requestUserRelation(item.id, index)} className="btn btn-primary-light btn-sm mr-1">Kết bạn</button>
                                                    <button onClick={() => this.removeSuggest(item.id, index)} className="btn btn-light btn-sm">Xoá</button> */}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    )
                                }

                            })}
                        </ul>



                    </div>
                </aside >
            </PerfectScrollbar>

        )
    }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null, { forwardRef: true })(ListFriend);