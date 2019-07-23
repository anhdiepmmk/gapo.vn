import React, { useState } from 'react';
import services from '../../services';
import helper from '../../services/helper'
import FileSaver, { saveAs } from 'file-saver';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import Create from '../Create';
import Loading from '../Loading'
import InfiniteScroll from 'react-infinite-scroller';
const ITEM_PERPAGE = 10;



function ItemPhoto(props) {
    const [showMariDrops, setShowMariDrops] = useState(false);
    const setCover = async (cover) => {
        await services.data.updateUser({
            id: props.user_id,
            cover
        });
        setTimeout(() => props.refreshData({ cover }), 700)
    }

    const saveImageAs = (imgOrURL) => {
        FileSaver.saveAs(imgOrURL, "image-save.jpg")
    }

    const removePhotos = async (id) => {
        helper.confirm('Bạn có chắc chắn muốn xóa bài viết?').then(async () => {
            try {
                await services.data.deletePost(id);
                setTimeout(() => props.loadPhotos(), 700)
            } catch (err) {
                helper.alert('Không thể xóa bài viết');
            }
        })
    }

    const setAvatar = async (avatar) => {
        let rs = await services.data.updateUser({
            id: props.user_id,
            avatar
        })
        setTimeout(() => props.refreshData({ avatar }), 700)
    }
    return (
        <div key={props.index} className="col-3" style={{ marginTop: 8 }} onClick={() => {
            services.helper.showPostWithContent(props.item.id, props.item.index || 0, props.item);
        }}>
            <div className="profile-photo-item position-relative">
                <a href className="gapo-thumbnail gapo-thumbnail--1x1" style={{ backgroundImage: `url(${props.item.mediaData[0].src})` }}>
                    <img className="w-100" src alt />
                </a>
                {props.isMe && !props.page ? <div className="dropdown profile-photo__actions">

                    <Dropdown isOpen={showMariDrops} toggle={evt => {
                        evt.stopPropagation();
                        setShowMariDrops(!showMariDrops)
                    }}>
                        <DropdownToggle className='hidden' size='sm' color='link'>
                            <a className="btn btn-sm btn-light " data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <i className="gapo-icon icon-pencil-alt" />
                            </a>
                        </DropdownToggle>

                        <DropdownMenu right>
                            <DropdownItem onClick={() => { setCover(props.item.mediaData[0].src) }} key={0}>Đặt làm ảnh bìa</DropdownItem>
                            <DropdownItem
                                onClick={() => { setAvatar(props.item.mediaData[0].src) }}
                                key={1}>Đặt làm ảnh đại diện</DropdownItem>
                            <DropdownItem
                                onClick={() => { saveImageAs(props.item.mediaData[0].src) }}
                                key={1}>Tải ảnh</DropdownItem>
                            <DropdownItem
                                onClick={() => { removePhotos(props.item.id) }}
                                key={1}>Xoá ảnh này</DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div> : null}
            </div>
        </div>
    )
}

export default class PhotoAlbum extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            photos: [],
            showPost: false,
            hasMore: true
        }
    }


    componentDidMount() {
        // this.loadPhotos()
    }

    componentWillReceiveProps() {
        // this.loadPhotos()
    }
    loading = false
    async loadPhotos() {
        if (this.loading) return
        this.loading = true;
        let from_id = null;
        let hasMore = true;
        if (this.state.photos.length > 0) {
            from_id = this.state.photos[this.state.photos.length - 1].id;
        }
        let input = {
            post_type: 2,
            user_id: this.props.user_id,
            from_id,
            limit: ITEM_PERPAGE,
        }
        if (this.props.target) {
            input.target = this.props.target
        }
        let rs = await services.data.getPost(input);
        if (rs.length < ITEM_PERPAGE) hasMore = false
        let photos = [...this.state.photos, ...rs];
        this.loading = false;
        this.setState({ photos, hasMore });



        // this.setState({ inProcess: true })
        // let params = {
        //     post_type: 2,
        //     user_id: this.props.user_id,
        //     limit
        // }
        // if (this.props.target) {
        //     params.target = this.props.target
        // }
        // let images = await services.data.getPost(params);
        // this.setState({ photos: images });
        // // let ablum = await services.data.getPost({
        // //     // limit: 20,
        // //     post_type: 4,
        // //     user_id: this.props.user_id,
        // //     target: this.props.target
        // // });
        // let flatAblum = []
        // // ablum.map((item, index) => {
        // //     for (var i = 0, leng = item.mediaData.length; i < leng; i++) {
        // //         let newItem = Object.assign({}, item, { mediaData: [item.mediaData[i]] });
        // //         flatAblum.push(newItem);
        // //     }
        // // })
        // let data = [...images, ...flatAblum];
        // this.setState({ photos: data })
        // this.setState({ inProcess: false })
    }

    async setCover(cover) {
        await services.data.updateUser({
            id: this.props.user_id,
            cover
        })
        this.props.refreshData({ cover })
    }

    saveImageAs(imgOrURL) {
        FileSaver.saveAs(imgOrURL, "image-save.jpg")
    }

    async removePhotos(id) {
        helper.confirm('Bạn có chắc chắn muốn xóa bài viết?').then(async () => {
            try {
                await services.data.deletePost(id);
                this.loadPhotos()
            } catch (err) {
                helper.alert('Không thể xóa bài viết');
            }
        })
    }

    async setAvatar(avatar) {
        let rs = await services.data.updateUser({
            id: this.props.user_id,
            avatar
        })
        this.props.refreshData({ avatar })
    }
    addImage() {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        this.setState({ showPost: true })
    }
    render() {
        return (<div>
            <div className="d-flex align-items-center mb-3 pt-2">
                <h1 className="gapo-title" style={{ paddingRight: 160 }}>Ảnh</h1>
                {this.state.showPost &&
                    <React.Fragment>
                        <div className='gapo-overlay show' onClick={() => { this.setState({ showPost: false }) }}></div>
                        <Create
                            options={this.props.options}
                            onClose={rs => {
                                if (rs) {
                                    this.props.changeTabIndex(1)
                                }
                                this.setState({ showPost: false });
                            }}
                            target={this.props.target}
                        />
                    </React.Fragment>
                }
                {this.props.isMe ? <React.Fragment>
                    <button onClick={this.addImage.bind(this)} className="btn btn-sm mr-2 d-flex align-items-center ml-auto btn-white border">
                        <i className="gapo-icon icon-plus mr-1" />
                        Thêm ảnh
                    </button>

                </React.Fragment> : null}
            </div>
            {this.state.photos.length == 0 && !this.state.hasMore ? <div className="rounded bg-white shadow mb-3 p-5">
                <div className="text-center profile--empty p-4">
                    <svg width={48} height={48} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.5 33.5L3.5 37.5L3 40L6 41.5L43 42.5L46 40C46.3333 38.8333 47 36.3 47 35.5C47 34.7 46.3333 32.8333 46 32L35 31L26 31.5L21.5 33.5Z" fill="#E5E5E5" />
                        <path d="M42.5 6.5H6.5C4.29086 6.5 2.5 8.29086 2.5 10.5V38.5C2.5 40.7091 4.29086 42.5 6.5 42.5H42.5C44.7091 42.5 46.5 40.7091 46.5 38.5V10.5C46.5 8.29086 44.7091 6.5 42.5 6.5Z" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.5 20.5C20.7091 20.5 22.5 18.7091 22.5 16.5C22.5 14.2909 20.7091 12.5 18.5 12.5C16.2909 12.5 14.5 14.2909 14.5 16.5C14.5 18.7091 16.2909 20.5 18.5 20.5Z" fill="#E5E5E5" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M21.3491 33.664L30.6763 23.5592C32.2173 21.8898 34.8375 21.8374 36.444 23.4439L46.5001 33.5" fill="#E5E5E5" />
                        <path d="M21.3491 33.664L30.6763 23.5592C32.2173 21.8898 34.8375 21.8374 36.444 23.4439L46.5001 33.5" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.5 38.5L11.8218 29.955C13.3407 28.5627 15.6689 28.552 17.2005 29.9305L24.5 36.5" fill="#E5E5E5" />
                        <path d="M2.5 38.5L11.8218 29.955C13.3407 28.5627 15.6689 28.552 17.2005 29.9305L24.5 36.5" stroke="#808080" strokeWidth={2} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="my-3 font-weight-semi-bold">{this.props.isMe ? 'Bạn chưa có ảnh nào' : 'Không có ảnh nào'}</div>
                    {this.props.isMe ? <a onClick={this.addImage.bind(this)} href className="btn btn-primary px-4">
                        <i className="gapo-icon icon-add-friend mr-1" />
                        Thêm ảnh
                     </a> : null}
                </div>
            </div> : <div className="rounded bg-white shadow mb-3 p-3">
                    {/* <div className="font-size-normal gapo-subtitle mb-2">Tháng 6/2019</div> */}
                    <InfiniteScroll
                        threshold={100}
                        pageStart={0}
                        loadMore={() => { this.loadPhotos() }}
                        hasMore={this.state.hasMore}
                        loader={<Loading full key={0} />}
                    // useWindow={true}
                    >
                        <div className="row">
                            {this.state.photos.map((item, index) => {
                                if (item.mediaData.length === 0) return null;
                                return <ItemPhoto
                                    key={'itemPhoto' + index}
                                    isMe={this.props.isMe}
                                    user_id={this.props.user_id}
                                    page={this.props.page}
                                    item={item} index={index}
                                    loadPhotos={this.loadPhotos.bind(this)}
                                    refreshData={this.props.refreshData}
                                />
                            })}
                        </div>
                    </InfiniteScroll>


                </div>}
        </div>)
    }
}