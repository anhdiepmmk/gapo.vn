import React, { useState } from 'react';
import SearchHeader from './SearchHeader';
import Footer from '../components/Footer';
import configStore from '../configStore';
import { Link } from 'react-router-dom';
import LeftSideBar from './feed/LeftSideBar';
import RightSideBar from './feed/RightSideBar';
import _ from 'lodash';
import services from '../services';
import helper from '../services/helper';
import { connect } from 'react-redux';
import queryString from 'query-string';
import ContentDisplay from './../shared/ContentDisplay';
const searchOptions = [
    {
        id: 0,
        title: 'Tất cả'
    },
    {
        id: 1,
        title: 'Người'
    },
    {
        id: 2,
        title: 'Trang'
    },
    {
        id: 3,
        title: 'Bài viết'
    },
    // {
    //     id: 4,
    //     title: 'Video'
    // },

]

function convert(value) {
    if (value >= 1000000) {
        value = (value / 1000000) + "M"
    }
    else if (value >= 1000) {
        value = (value / 1000) + "k";
    }
    return value;
}

let query = null

function BtnAddFriend(props) {
    const [relation, setRelation] = useState(props.data.relation)


    const requestUserRelation = async (id) => {
        try {
            await services.data.requestUserRelation(id)
            setRelation('pending')
        } catch (error) {
            helper.alert(error.message)
        }
    }

    const cancelUserRelation = async (id) => {
        try {
            await services.data.cancelUserRelation(id)
            setRelation('')
        } catch (error) {
            helper.alert(error.message)
        }
    }

    if (props.user.id == props.data.id) return null;
    if (relation == 'pending') return (<a onClick={() => { cancelUserRelation(props.data.id) }} href className="btn btn-sm btn-light ml-3 px-3">
        Đã gửi lời mời
    </a>)
    if (relation == 'friend') return (<a href className="btn btn-sm btn-light ml-3 px-2">
        <i className="gapo-icon icon-check mr-1" />
        Bạn bè
    </a>)
    return (<a onClick={() => { requestUserRelation(props.data.id) }} href className="btn btn-sm btn-primary-light ml-3 px-4">
        <i className="gapo-icon icon-add-friend mr-1" />
        Kết bạn
        </a>)

}

class Search extends React.Component {
    constructor(props) {
        super(props);
        query = props.match.params;
        this.state = {
            listUser: [],
            listPost: [],
            listPage: [],
            listVideo: [],
            optionSearchSelect: 0,
            loading: false
        }
    }
    componentDidMount() {
        this.loadData()
    }

    async loadData() {
        this.setState({ loading: true })
        await Promise.all([
            this.loadListUser(),
            this.loadListPost(),
            // this.loadlistPage()
        ])
        this.setState({ loading: false })

    }


    async loadListUser() {
        try {
            let result = await services.data.searchUser(query.q, 10)
            this.setState({ listUser: result })
        } catch (error) {
            console.log(error)
        }
    }

    // async loadlistPage() {
    //     try {
    //         let rs = await services.data.listPage({ limit: 5, title: query.q });
    //         this.setState({ listPage: rs });
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    componentWillReceiveProps(nextProps) {
        query = nextProps.match.params;
        this.loadData()
    }

    async loadListPost() {
        try {
            let result = await services.data.searchPost(query.q, 10)
            this.setState({ listPost: result })
        } catch (error) {
        }
    }

    renderUserResult() {
        return (
            <div className="gapo-box">
                <ul className="search-group__list list-unstyled">
                    {this.state.listUser.map((item, index) => {
                        console.log('link to ', item._profileUrl)
                        return (<li key={index} className="search-group__item media align-items-center">
                            <Link to={`${item._profileUrl}`} className="gapo-avatar gapo-avatar--80 mr-2" style={{ backgroundImage: `url(${item.avatar})` }}>
                            </Link>
                            <div className="media-body pl-1">
                                <Link to={`${item._profileUrl}`} className="text-body font-weight-semi-bold">{item.display_name}</Link>
                                <div className="font-size-small text-secondary mt-1">{item.work}</div>
                            </div>
                            <BtnAddFriend user={this.props.user} data={item} />
                        </li>)
                    })}

                </ul>
                {this.state.listUser > 4 ? <a href className="search-group__action text-primary">
                    Xem thêm
                    </a> : null}
            </div>
        )
    }


    renderPageResult() {
        return (
            <div className="gapo-box">
                <ul className="search-group__list list-unstyled">
                    {this.state.listPage.map((item, index) => {
                        return (<li className="search-group__item media align-items-center">
                            <a className="gapo-avatar gapo-avatar--80 mr-2" style={{ backgroundImage: 'url(https://namgioi.vn/wp-content/uploads/2018/07/thien-than-noi-y-han-quoc-tung-loat-anh-goi-cam-den-kho-tin-namgioi-02.jpg)' }}>
                            </a>
                            <div className="media-body pl-1">
                                <a href className="text-body font-weight-semi-bold">Trắng TV</a>
                                <div className="font-size-small text-secondary mt-1">2 triệu thích · Thể thao</div>
                            </div>
                            <a href className="btn btn-sm btn-primary-light ml-3 px-2">
                                <i className="gapo-icon icon-like-2 mr-1" />
                                Thích
                            </a>
                        </li>)
                    })}
                </ul>
                {this.state.listPage > 4 ? <a href className="search-group__action text-primary">
                    Xem thêm
                    </a> : null}
            </div>
        )
    }


    renderPostResult() {
        let a = 10000
        return (
            this.state.listPost.map((item, index) => {
                return (<div className="post-item">
                    <div className="post-item__head">
                        <div className="post-item__info media align-items-center">
                            <a onClick={() => { this.props.history.push(`/profile/${item.user.id}`) }} href className="post-item__avatar gapo-avatar gapo-avatar--40 mr-2">
                                <img src={item.user ? item.user.avatar : ''} alt />
                            </a>
                            <div className="media-body">
                                <a onClick={() => { this.props.history.push(`/profile/${item.user.id}`) }} className="post-item__author d-flex align-items-center font-weight-semi-bold mb-1 text-body">
                                    {item.user ? item.user.display_name : ''}
                                    {(!item.page && item.user.status_verify == 1) || (item.page && item.page.status_verify == 1) ? <img src='/assets/images/svg-icons/checkmark.svg' style={{ width: 20, height: 20, marginLeft: 5, marginBottom: 3 }} /> : null}

                                </a>
                                <div className="d-flex align-items-center font-size-small text-secondary">
                                    <a className="text-secondary">{helper.getDuration(new Date(item.update_time))}</a>
                                    <span className="px-1">·</span>
                                    <i className="gapo-icon icon-globe-alt" data-toggle="tooltip" data-title="Công khai" data-original-title title />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ cursor: 'pointer' }} className="post-item__content media">
                        <div onClick={() => {
                            helper.showPost(item.id)
                        }} className="media-body pr-1">
                            {/* {item.content} */}
                            <ContentDisplay content={item.content} />
                        </div>
                        {/* <div style={{ backgroundImage: `url(${item.mediaData[0] ? item.mediaData[0].src : ''})` }} className="gapo-thumbnail gapo-thumbnail--1x1 gapo-thumbnail--96 rounded pl-2" /> */}
                    </div>
                    <div style={{ cursor: 'pointer' }} onClick={() => {
                        helper.showPost(item.id)
                    }} className="post-item__stats d-flex">
                        <a className="post-item__stats__item d-flex align-items-center mr-auto text-dark" >
                            <i className="svg-icon icon-like-circle mr-1" />
                            {convert(item.counts.react_count)} thích</a>
                        <a className="post-item__stats__item text-dark" href>{convert(item.counts.comment_count)} bình luận</a>
                        <a className="post-item__stats__item text-dark" href>{convert(item.counts.share_count)} chia sẻ</a>
                    </div>
                </div>)
            })
        )
    }


    renderVideoResult() {
        return (<div className="gapo-box">
            <ul className="list-unstyled">
                <li className="media mb-2">
                    <a href="/" className="gapo-thumbnail gapo-thumbnail--16x9 gapo-thumbnail--video rounded mr-2 mb-1" style={{ backgroundImage: 'url(https://znews-photo.zadn.vn/w480/Uploaded/oqivovbt/2019_03_11/captain_3.jpg)' }}>
                        <img src alt />
                        <span className="duration">12:00</span>
                    </a>
                    <div className="media-body pl-1 mb-1">
                        <a href className="d-block text-body font-weight-semi-bold my-2">Kỹ thuật Karate kinh dị đả bại phái mạnh</a>
                        <a href="./video-watch.html" className="media align-items-center text-secondary py-1">
                            <div className="gapo-avatar gapo-avatar--24 mr-2" style={{ backgroundImage: 'url(https://znews-photo.zadn.vn/w480/Uploaded/oqivovbt/2019_03_11/captain_3.jpg)' }}>
                                <img src alt />
                            </div>
                            <div className="media-body">
                                Hội hâm mộ Marvel
                                </div>
                        </a>
                    </div>
                </li>
                <li className="media mb-2">
                    <a href="/" className="gapo-thumbnail gapo-thumbnail--16x9 gapo-thumbnail--video rounded mr-2 mb-1" style={{ backgroundImage: 'url(https://znews-photo.zadn.vn/w480/Uploaded/oqivovbt/2019_03_11/captain_3.jpg)' }}>
                        <img src alt />
                        <span className="duration">12:00</span>
                    </a>
                    <div className="media-body pl-1 mb-1">
                        <a href className="d-block text-body font-weight-semi-bold my-2">Kỹ thuật Karate kinh dị đả bại phái mạnh</a>
                        <a href="./video-watch.html" className="media align-items-center text-secondary py-1">
                            <div className="gapo-avatar gapo-avatar--24 mr-2" style={{ backgroundImage: 'url(https://znews-photo.zadn.vn/w480/Uploaded/oqivovbt/2019_03_11/captain_3.jpg)' }}>
                                <img src alt />
                            </div>
                            <div className="media-body">
                                Hội hâm mộ Marvel
                                </div>
                        </a>
                    </div>
                </li>
                <li className="media mb-2">
                    <a href="/" className="gapo-thumbnail gapo-thumbnail--16x9 gapo-thumbnail--video rounded mr-2 mb-1" style={{ backgroundImage: 'url(https://znews-photo.zadn.vn/w480/Uploaded/oqivovbt/2019_03_11/captain_3.jpg)' }}>
                        <img src alt />
                        <span className="duration">12:00</span>
                    </a>
                    <div className="media-body pl-1 mb-1">
                        <a href className="d-block text-body font-weight-semi-bold my-2">Kỹ thuật Karate kinh dị đả bại phái mạnh</a>
                        <a href="./video-watch.html" className="media align-items-center text-secondary py-1">
                            <div className="gapo-avatar gapo-avatar--24 mr-2" style={{ backgroundImage: 'url(https://znews-photo.zadn.vn/w480/Uploaded/oqivovbt/2019_03_11/captain_3.jpg)' }}>
                                <img src alt />
                            </div>
                            <div className="media-body">
                                Hội hâm mộ Marvel
                                </div>
                        </a>
                    </div>
                </li>
                <li className="media mb-2">
                    <a href="/" className="gapo-thumbnail gapo-thumbnail--16x9 gapo-thumbnail--video rounded mr-2 mb-1" style={{ backgroundImage: 'url(https://znews-photo.zadn.vn/w480/Uploaded/oqivovbt/2019_03_11/captain_3.jpg)' }}>
                        <img src alt />
                        <span className="duration">12:00</span>
                    </a>
                    <div className="media-body pl-1 mb-1">
                        <a href className="d-block text-body font-weight-semi-bold my-2">Kỹ thuật Karate kinh dị đả bại phái mạnh</a>
                        <a href="./video-watch.html" className="media align-items-center text-secondary py-1">
                            <div className="gapo-avatar gapo-avatar--24 mr-2" style={{ backgroundImage: 'url(https://znews-photo.zadn.vn/w480/Uploaded/oqivovbt/2019_03_11/captain_3.jpg)' }}>
                                <img src alt />
                            </div>
                            <div className="media-body">
                                Hội hâm mộ Marvel
                                </div>
                        </a>
                    </div>
                </li>
                <li className="media mb-2">
                    <a href="/" className="gapo-thumbnail gapo-thumbnail--16x9 gapo-thumbnail--video rounded mr-2 mb-1" style={{ backgroundImage: 'url(https://znews-photo.zadn.vn/w480/Uploaded/oqivovbt/2019_03_11/captain_3.jpg)' }}>
                        <img src alt />
                        <span className="duration">12:00</span>
                    </a>
                    <div className="media-body pl-1 mb-1">
                        <a href className="d-block text-body font-weight-semi-bold my-2">Kỹ thuật Karate kinh dị đả bại phái mạnh</a>
                        <a href="./video-watch.html" className="media align-items-center text-secondary py-1">
                            <div className="gapo-avatar gapo-avatar--24 mr-2" style={{ backgroundImage: 'url(https://znews-photo.zadn.vn/w480/Uploaded/oqivovbt/2019_03_11/captain_3.jpg)' }}>
                                <img src alt />
                            </div>
                            <div className="media-body">
                                Hội hâm mộ Marvel
                            </div>
                        </a>
                    </div>
                </li>
            </ul>
            <a href className="search-group__action text-primary px-0">
                Xem thêm
                </a>
        </div>)
    }


    renderEmptyPage() {
        return (

            !this.state.loading ? <div className="col col-500 py-4">
                <div className="py-5 text-center">
                    <svg width={48} height={48} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M37.7501 19.624C37.7505 23.2092 36.6877 26.7139 34.6961 29.695C32.7045 32.6761 29.8737 34.9997 26.5615 36.3719C23.2493 37.744 19.6046 38.1031 16.0883 37.4038C12.5721 36.7045 9.34212 34.9781 6.80704 32.443C4.27195 29.9079 2.54558 26.678 1.84624 23.1617C1.14691 19.6454 1.50604 16.0007 2.8782 12.6886C4.25036 9.37638 6.57393 6.54551 9.55504 4.55395C12.5361 2.56239 16.0409 1.4996 19.6261 1.5C22.0061 1.5 24.3629 1.96879 26.5618 2.87961C28.7607 3.79042 30.7587 5.12543 32.4417 6.8084C34.1246 8.49137 35.4596 10.4893 36.3704 12.6882C37.2813 14.8872 37.7501 17.2439 37.7501 19.624Z" fill="white" stroke="#808080" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.1367 13.1357L25.8647 25.8637" stroke="#808080" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M13.1367 25.8637L25.8647 13.1357" stroke="#808080" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M32.4414 32.4404L46.4994 46.5004" stroke="#808080" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="text-secondary font-size-large font-weight-semi-bold mt-4">
                        Không tìm thấy kết quả tìm kiếm cho từ khoá <br />{query.q}
                    </div>
                </div>
            </div> : <div style={{ textAlign: 'center', marginTop: 10 }}>Đang tải dữ liệu...</div>
        )
    }

    renderContent() {
        switch (this.state.optionSearchSelect) {
            case 0: return (
                <React.Fragment>
                    {this.state.listUser.length == 0 && this.state.listPage.length == 0 && this.state.listPost.length == 0 ? this.renderEmptyPage() : null}
                    {this.state.listUser.length > 0 ? this.renderUserResult() : null}
                    {this.state.listPage.length > 0 ? this.renderPageResult() : null}
                    {this.state.listPost.length > 0 ? this.renderPostResult() : null}
                    {/* {this.renderVideoResult()} */}
                </React.Fragment>
            )
            case 1: return this.state.listUser.length > 0 ? this.renderUserResult() : this.renderEmptyPage();
            case 2: return this.state.listPage.length > 0 ? this.renderPageResult() : this.renderEmptyPage();
            case 3: return this.state.listPost.length > 0 ? this.renderPostResult() : this.renderEmptyPage();
            case 4: return this.state.listVideo.length > 0 ? this.renderVideoResult() : this.renderEmptyPage();
        }
    }

    render() {
        return <React.Fragment>
            <SearchHeader />
            <main className="gapo-main row">
                <div className="col col-aside">
                    <div className="aside__wrapper">
                        <LeftSideBar />
                    </div>
                </div>
                <div className="col">
                    <div class="row justify-content-center">
                        <div class="col col-500 py-4">
                            {this.state.listUser.length == 0 && this.state.listPage.length == 0 && this.state.listPost.length == 0
                                ? null
                                : (
                                    <div className="search-filter d-flex align-items-center" style={{ display: (this.state.listUser.length == 0 && this.state.listPage.length == 0 && this.state.listPost.length == 0) ? 'none !important' : 'flex' }}>
                                        {searchOptions.map((item, index) => {
                                            return <a onClick={() => {
                                                this.setState({
                                                    optionSearchSelect: item.id
                                                })
                                            }} key={index} href className={`search-filter__item btn btn-sm ${item.id == this.state.optionSearchSelect ? 'btn-secondary' : 'btn-light'}`}>{item.title}</a>
                                        })}
                                    </div>
                                )
                            }
                            {this.renderContent()}
                        </div>
                    </div>
                </div>
                <div className="col col-aside">
                    <div className="aside__wrapper">
                        <RightSideBar />
                    </div>
                </div>
            </main>
        </React.Fragment>
        // return <div>
        //     <main className="gapo-main row">
        //         <div className="col col-aside">
        //             <SearchHeader />
        //             <LeftSideBar />
        //         </div>
        //         <div className="col">
        //             <div className="row justify-content-center">
        //                 <div className="col col-500 py-4">

        //                 </div>
        //             </div>
        //         </div>
        //         <div className="col col-aside">
        //             <div className="aside__wrapper">
        //                 <RightSideBar />
        //             </div>
        //         </div>
        //     </main>
        // </div>
    }
}

const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null)(Search);