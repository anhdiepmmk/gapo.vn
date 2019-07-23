import React, { useState } from 'react';
import SearchHeader from '../SearchHeader'
import Feed from '../feed/Feed';
import SideBarPage from './SidebarPage'
import PageProfileHeader from './PageProfileHeader'
import queryString from 'query-string';
import services from '../../services';
import helper from '../../services/helper'
import { connect } from 'react-redux'
import PageEdit from './pageEditInfo'
import QuickPost from '../post/QuickPost'
import config from '../../services/config';
import PhotoAlbum from '../profile/PhotoAlbum'
import { Link } from 'react-router-dom';
import Lightbox from 'react-image-lightbox';
const LENG_DESCRIPTION = 120;
function convert(value) {
    if (value >= 1000000) {
        value = (value / 1000000) + "M"
    }
    else if (value >= 1000) {
        value = (value / 1000) + "k";
    }
    return value;
}

function BtnLike(props) {
    const [isLike, setisLike] = useState(props.item.is_like)
    const toggleLike = async () => {
        try {
            if (isLike == 1) {
                await services.data.unLikePage(props.item.id);
                setisLike(0)
            } else {
                await services.data.likePage(props.item.id);
                setisLike(1)
            }
        } catch (error) {
            services.helper.alert(error.message)
        }

    }

    if (isLike == 0) {
        return <button onClick={() => {
            toggleLike()
        }} href onClick={() => {
            toggleLike()
        }} className=" ml-auto btn btn-primary-light btn-sm">Thích</button>
    } else {
        return <button onClick={() => {
            toggleLike()
        }} href onClick={() => {
            toggleLike()
        }} className=" ml-auto btn btn-primary btn-sm">Đã thích</button>
    }



}

class PagePreview extends React.Component {
    constructor(props) {
        super(props);
        let query = props.match.params;
        this.state = {
            pageId: query.id,
            pageInfo: {},
            isMe: false,
            tab: 1,
            listUserLike: [],
            listPhoto: [],
            listVideo: [],
            listPageRelate: [],
            showAlldescription: false
        }

    }

    changeTabIndex(tab) {
        this.setState({ tab })
    }

    async getListUserLike() {
        let listUserLike = await services.data.getListUserLike(this.state.pageId, null, 2)
        this.setState({
            listUserLike,
        })
    }
    async getPageRelate() {
        let listPageRelate = await services.data.listPage({ type: this.state.pageInfo.page_type.id, limit: 5 });
        this.setState({
            listPageRelate,
        })
    }

    async getListPhotoPage() {
        let listPhoto = await services.data.getPost({ target: `page:${this.state.pageId}`, post_type: 2, limit: 4 })
        this.setState({
            listPhoto,
        })
    }

    async getListVideoPage() {
        let listVideo = await services.data.getPost({ target: `page:${this.state.pageId}`, post_type: 3, limit: 5 })
        this.setState({
            listVideo,
        })
    }

    componentDidMount() {
        this.getDataPage()
    }

    loadData() {
        // this.getListVideoPage()
        this.getListPhotoPage();
        if (this.state.pageInfo && Object.keys(this.state.pageInfo.page_type).length > 0) {
            this.getPageRelate();
        }
        // this.getListUserLike()
    }

    reloadData() {
        this.getDataPage()
    }

    componentWillReceiveProps(nextProps) {
        let query = nextProps.match.params;
        this.state.pageId = query.id
        this.getDataPage()

    }

    async getDataPage() {
        try {
            let pageInfo = await services.data.getPageByid(this.state.pageId)
            let isMe = false
            if (pageInfo.admin && pageInfo.admin[0] && pageInfo.admin[0].id == this.props.user.id) {
                isMe = true
            }
            this.state.isMe = isMe;
            this.state.pageInfo = pageInfo;
            this.loadData()

        } catch (error) {
        }

    }





    renderIntroPage() {
        let { info, cover, page_type, counts, description } = this.state.pageInfo;
        let shortDescription = '';
        if (description) {
            description += " "
            shortDescription = description.substr(0, 120);
            shortDescription = shortDescription.substr(0, Math.min(shortDescription.length, shortDescription.lastIndexOf(" ")))
        }
        if (cover == 'undefined') { cover = '' }
        return (
            <div className="bg-white shadow rounded mb-3">
                <div className="gapo-thumbnail gapo-thumbnail--16x9 rounded-top" style={{ height: '11.25rem', backgroundImage: `url(${cover ? cover : config.getDefaultCover()})` }}>
                </div>
                <div className="p-3">
                    {description && !this.state.showAlldescription ? <div className="mb-3">{shortDescription}
                        {description.length > LENG_DESCRIPTION ? <a href onClick={() => this.setState({ showAlldescription: true })} className="text-primary"> Xem thêm</a> : null}
                    </div> : null}
                    {this.state.showAlldescription && <div className="mb-3">{description}</div>}
                    <div className="d-flex align-items-center border-top border-bottom py-3 mb-3">
                        <i className="gapo-icon icon-briefcase mr-2" />
                        <div className="text-uppercase font-weight-semi-bold">{page_type ? page_type.title : null}</div>
                    </div>
                    <ul className="list-unstyled">
                        {info && info.phone ? <li className="mb-3 media align-items-center"><i className="gapo-icon icon-heart mr-2" />{info.phone}</li> : null}
                        {info && info.website ? <li className="mb-3 media align-items-center"><i className="gapo-icon icon-globe-alt mr-2" /><a href>{info.website}</a></li> : null}
                        {info && info.address ? <li className="mb-3 media"><i className="gapo-icon icon-location mr-2" />{info.address}
                        </li> : null}
                        <li className="mb-3 media align-items-center"><i className="gapo-icon icon-like mr-2" />{convert(counts ? counts.user_count : 0)} người thích
                          trang này
                        </li>
                    </ul>
                </div>
            </div>
        )
    }


    renderPageRelate() {
        if (this.state.listPageRelate.length > 0) {
            return (
                <div className="bg-white shadow mb-3 rounded p-3">
                    <div className="media align-items-center">
                        <div className="gapo-title text-size-18">Trang liên quan</div>
                    </div>
                    <ul className="list-unstyled mt-3">
                        {this.state.listPageRelate.map((item, index) => {
                            return (
                                <li key={index} className="d-flex align-items-center mb-3">
                                    <Link to={`/pagepreview/${item.id}`} href className=" gapo-avatar gapo-avatar--56 mr-2" style={{ backgroundImage: `url(${item.avatar && item.avatar != 'undefined' ? item.avatar : config.defaultPageAvatar})` }}>
                                        <img src alt />
                                    </Link>
                                    <a href className="ml-1">
                                        <Link to={`/pagepreview/${item.id}`} className="font-weight-semi-bold mb-1">{item.title ? item.title : ''}</Link>
                                        <div className="text-secondary font-size-small">{item.description ? item.description.substr(0, 50) : ''}</div>
                                    </a>
                                    <BtnLike item={item} />
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )
        }
        return null;
    }


    renderVideoPage() {
        if (this.state.listVideo.length > 0) {
            return (<div className="bg-white shadow mb-3 rounded p-3 gapo-page-video">
                <div className="media align-items-center">
                    <div className="gapo-title text-size-18">Video</div>
                    <a href className="ml-auto text-primary">Xem tất cả </a>
                </div>
                <div className="page-video__list">
                    {this.state.listVideo.map((item, index) => {
                        return (<div key={index} className="media mt-3">
                            <div className="video-thumbnail mr-2">
                                <a onClick={() => {
                                    helper.showPost(item.id)
                                }} href className="gapo-thumbnail gapo-thumbnail--16x9 mb-2 rounded" style={{ backgroundImage: `url(${item.mediaData[0] && item.mediaData[0].thumb ? item.mediaData[0].thumb.src : ''})` }}>
                                </a>
                            </div>
                            <div>
                                <a onClick={() => {
                                    helper.showPost(item.id)
                                }} href className="font-weight-semi-bold">{item.content}</a>
                                <div className="text-secondary pt-1 font-size-small">{helper.getDuration(new Date(item.update_time))}</div>
                            </div>
                        </div>)
                    })}
                </div>
            </div>)
        }
        return null;
    }


    renderPhotoPage() {
        let listPhoto = [...this.state.listPhoto];
        listPhoto.length = 4;
        if (this.state.listPhoto.length > 0) {
            return (
                <div className="bg-white shadow mb-3 rounded p-3">
                    <div className="media align-items-center">
                        <div className="gapo-title text-size-18">Ảnh</div>
                        <a href onClick={() => { this.setState({ tab: 4 }) }} className="ml-auto text-primary">Xem tất cả </a>
                    </div>
                    <div className="page-photo__list row mt-3">
                        {listPhoto.map((item, index) => {
                            return <div key={index} className="col-6">
                                <div className="mb-2">
                                    <a onClick={() => {
                                        helper.showPost(item.id)
                                    }} className="gapo-thumbnail gapo-thumbnail--1x1" style={{ backgroundImage: `url(${item.mediaData[0].src})` }}>
                                    </a>
                                </div>
                            </div>
                        })}


                    </div>
                </div>
            )
        }
        return null
    }

    onNewPost(post) {
        if (this.refs.feedRef) {
            this.refs.feedRef.onPostCreated(post);
        }
    }
    renderContent() {
        switch (this.state.tab) {
            case 1: return (<div className="row justify-content-center">
                <div className="col col-500">
                    {this.state.isMe && <QuickPost
                        page={this.state.pageInfo}
                        onNewPost={post => { this.onNewPost(post) }}
                        target={`page:${this.state.pageId}`}
                    />
                    }
                    <Feed
                        myPage={this.state.isMe}
                        ref={'feedRef'}
                        target={`page:${this.state.pageId}`}
                        emptyView={this.renderEmptyView()}
                    />
                </div>
                <div className="col col-360">
                    {this.renderIntroPage()}
                    {/* {this.renderVideoPage()} */}
                    {this.renderPhotoPage()}
                    {this.renderPageRelate()}
                </div>
            </div>)
            case 2: return (<PageEdit reloadData={this.reloadData.bind(this)} pageInfo={this.state.pageInfo} isMe={this.state.isMe} />)
            case 4:
                let options = {
                    placeholder: 'Chọn những bức ảnh và hãy nói gì về nó',
                    titleButton: 'Đăng ảnh',
                    type: 'Ảnh',
                }
                return (<PhotoAlbum
                    target={`page:${this.state.pageId}`}
                    page={true}
                    isMe={this.state.isMe}
                    options={options}
                    changeTabIndex={this.changeTabIndex.bind(this)}
                />
                )
        }
    }
    renderEmptyView() {
        return <div>
            <div className="p-5">
                <div className="text-center profile--empty p-4">
                    <svg
                        width={38}
                        height={46}
                        viewBox="0 0 38 46"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M26.1716 2.17157C25.4214 1.42143 24.404 1 23.3431 1H5C2.79086 1 1 2.79086 1 5V41C1 43.2091 2.79086 45 5 45H33C35.2091 45 37 43.2091 37 41V14.6569C37 13.596 36.5786 12.5786 35.8284 11.8284L26.1716 2.17157Z"
                            fill="white"
                            stroke="#808080"
                            strokeWidth={2}
                            strokeMiterlimit={10}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M9 35H29"
                            stroke="#808080"
                            strokeWidth={2}
                            strokeMiterlimit={10}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M9 25H29"
                            stroke="#808080"
                            strokeWidth={2}
                            strokeMiterlimit={10}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M9 15H17"
                            stroke="#808080"
                            strokeWidth={2}
                            strokeMiterlimit={10}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M24 1.5V10C24 12.2091 25.7909 14 28 14H36.5"
                            fill="#E5E5E5"
                        />
                        <path
                            d="M24 1.5V10C24 12.2091 25.7909 14 28 14H36.5"
                            stroke="#808080"
                            strokeWidth={2}
                            strokeMiterlimit={10}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <div className="my-3 font-weight-semi-bold">
                        Trang chưa có bài viết nào
                    </div>
                </div>
            </div>
        </div>
    }
    render() {
        return (
            <React.Fragment>
                <SearchHeader />
                <main className="gapo-main row no-gutters">
                    <SideBarPage />
                    <div className="col">
                        <PageProfileHeader
                            tab={this.state.tab}
                            changeTabIndex={this.changeTabIndex.bind(this)}
                            isMe={this.state.isMe}
                            pageInfo={this.state.pageInfo}
                            reloadData={this.reloadData.bind(this)}
                        />

                        {this.renderContent()}
                    </div>
                </main>
            </React.Fragment>

        )
    }
}

const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null)(PagePreview);