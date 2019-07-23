import React from 'react';
import services from '../../services';
import { Link } from 'react-router-dom'
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, } from 'reactstrap'
import helper from '../../services/helper';
import Dropzone from 'react-dropzone';
import _ from 'lodash';
import config from '../../services/config';

export default class PageProfileHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showModalMenu: false,
            showOptionCover: false,
        }
    }
    loadImage(file) {
        return new Promise((resolve, reject) => {
            var reader = new FileReader();
            reader.onload = function (e) {
                resolve(e);
            }
            reader.readAsDataURL(file);
        })
    }
    async uploadAvatar(acceptedFiles) {
        let type = acceptedFiles[0].type.substr(0, 5);
        if (type !== 'image') {
            return services.helper.alert('Không hỗ trợ định dạng tệp');
        }
        let fileData = await this.loadImage(acceptedFiles[0]);
        let newAvatar = {
            loading: true,
            progress: 1,
            src: fileData.target.result,
            cancelToken: services.request.getCancelToken()
        }
        let formData = new FormData();
        try {
            formData.append('image', acceptedFiles[0]);
            let rs = await services.request.upload('/media/v1.0/images', formData, newAvatar.cancelToken, p => { });
            await services.data.updatePage({
                id: this.props.pageInfo.id,
                avatar: rs.src
            })
            this.props.reloadData()
        } catch (err) {
            this.setState({ avatar: null });
            services.helper.alert('Lỗi cập nhật avatar');
        }

    }
    async uploadCover(acceptedFiles) {
        let type = acceptedFiles[0].type.substr(0, 5);
        if (type !== 'image') {
            return services.helper.alert('Không hỗ trợ định dạng tệp');
        }
        let fileData = await this.loadImage(acceptedFiles[0]);
        let newCover = {
            loading: true,
            progress: 1,
            src: fileData.target.result,
            cancelToken: services.request.getCancelToken()
        }
        let formData = new FormData();
        try {
            formData.append('image', acceptedFiles[0]);
            let rs = await services.request.upload('/media/v1.0/images', formData, newCover.cancelToken, p => { });
            await services.data.updatePage({
                id: this.props.pageInfo.id,
                cover: rs.src
            });
            this.props.reloadData()
        } catch (err) {
            this.setState({ avatar: null });
            services.helper.alert('Lỗi không thể cập nhật ảnh bìa');
        }
    }
    async pickImage() {
        let src = await services.helper.pickImage(null, this.props.pageInfo.id);
        let rs = await services.data.updatePage({
            id: this.props.pageInfo.id,
            cover: src
        })
        this.props.reloadData()
    }
    async removePage(id) {
        helper.confirm('Bạn có chắc chắn muốn xóa trang này?').then(async () => {
            try {
                await services.data.deletePage(id);
                window.location.replace('#/page')
            } catch (err) {
                helper.alert('Xóa trang không thành công');
            }
        })
    }
    async toggleLike(is_like) {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        let rs = null;
        if (is_like) {
            try {
                rs = await services.data.unLikePage(this.props.pageInfo.id);
                setTimeout(() => { this.props.reloadData() }, 500);
            } catch (err) {
                services.helper.alert(err.message)
            }
        } else {
            try {
                rs = await services.data.likePage(this.props.pageInfo.id);
                setTimeout(() => { this.props.reloadData() }, 500)
            } catch (err) {
                services.helper.alert(err.message)
            }
        }

    }
    render() {
        let { title, description, id, avatar, cover, is_like, status_verify } = this.props.pageInfo;
        console.log(this.props.pageInfo, 'pppp')
        if (avatar == 'undefined') { avatar = '' }
        if (cover == 'undefined') { cover = '' }
        let { showOptionCover } = this.state;
        let { isMe } = this.props
        return (
            <div class="text-center bg-white shadow mb-4 profile__head position-relative gapo-page">
                <div>
                    <div className="profile__head__cover position-relative" style={{ height: '20.25rem', backgroundImage: `url(${cover ? cover : config.getDefaultCover()})` }}>
                        <div className="profile__head__avatar rounded-circle">
                            <a href className="gapo-avatar" style={{ backgroundImage: `url(${avatar ? avatar : config.defaultPageAvatar})` }}>
                                <img className="w-100" src alt />
                            </a>
                            {isMe &&
                                <Dropzone onDrop={this.uploadAvatar.bind(this)}>
                                    {({ getRootProps, getInputProps }) => (
                                        <button {...getRootProps()} className="upload-avatar__action rounded-circle btn d-flex align-items-center justify-content-center">
                                            <input {...getInputProps()} />
                                            <i className="gapo-icon icon-camera-alt" />
                                        </button>
                                    )}
                                </Dropzone>}
                        </div>
                        {isMe &&
                            <div className="dropdown upload-cover__action">
                                <Dropdown
                                    isOpen={showOptionCover}
                                    toggle={evt => {
                                        this.setState({ showOptionCover: !showOptionCover })
                                    }}
                                >
                                    <DropdownToggle className='hidden' size='sm' color='link'>
                                        <div className="btn d-flex align-items-center btn-alpha-dark btn-sm font-weight-normal"   >
                                            <i className="gapo-icon icon-camera-alt mr-1" />
                                            Cập nhật ảnh bìa
                                    </div>
                                    </DropdownToggle>
                                    <DropdownMenu right>
                                        <DropdownItem key={1} onClick={() => this.pickImage()}>
                                            <a className="dropdown-item" data-toggle="modal" data-target="#exampleModal">
                                                Chọn ảnh
                                        </a>
                                        </DropdownItem>
                                        <div className='dropdown-item' >
                                            <Dropzone
                                                // ref='drop'
                                                // noClick={true}
                                                onDrop={this.uploadCover.bind(this)}
                                                onDropAccepted={() => this.setState({ showOptionCover: !showOptionCover })}
                                                onDropRejected={() => this.setState({ showOptionCover: !showOptionCover })}
                                                onFileDialogCancel={() => this.setState({ showOptionCover: !showOptionCover })}
                                            >
                                                {({ getRootProps, getInputProps }) => (
                                                    <div {...getRootProps()} >
                                                        <input {...getInputProps()} />
                                                        <a className="dropdown-item" data-toggle="modal" data-target="#exampleModal">
                                                            Tải ảnh lên
                                            </a>
                                                    </div>
                                                )}
                                            </Dropzone>
                                        </div>
                                    </DropdownMenu>
                                </Dropdown>
                                <div className="dropdown-menu dropdown-menu-right" aria-labelledby="create-post-dropdown">
                                    <a className="dropdown-item" href="#" data-toggle="modal" data-target="#exampleModal">
                                        Chọn ảnh
                                </a>
                                    <a className="dropdown-item" href="#">
                                        Tải ảnh lên
                                </a>
                                </div>
                            </div>}
                    </div>
                    <div className="profile__head__content">
                        <h1 className="profile__name font-weight-semi-bold">{title}
                            {/* <i style={{ background: 'url(/assets/images/svg-icons/checkmark.svg)' }} className="gapo-icon icon-verify text-blue font-size-large ml-1" data-toggle="tooltip" data-title="Đã xác minh" data-original-title title /> */}
                            {status_verify == 1 ? <img src='/assets/images/svg-icons/checkmark.svg' style={{ width: 20, height: 20, marginLeft: 5, marginBottom: 3 }} /> : null}
                        </h1>
                        <div>{description}</div>
                    </div>
                    <div className="profile__head__nav">
                        <div className="row justify-content-center">
                            <div className="col col-500">
                                <ul className="nav mr-auto">
                                    <li className="nav-item">
                                        <div style={{ cursor: 'pointer' }} onClick={() => { this.props.changeTabIndex(1) }} className={`nav-link ${this.props.tab == 1 ? 'active' : ''} font-weight-semi-bold`} >Dòng thời gian</div>
                                    </li>
                                    <li className="nav-item">
                                        <div style={{ cursor: 'pointer' }} onClick={() => { this.props.changeTabIndex(2) }} className={`nav-link ${this.props.tab == 2 ? 'active' : ''} font-weight-semi-bold`} >Giới thiệu</div>
                                    </li>
                                    <li className="nav-item">
                                        <div style={{ cursor: 'pointer' }} onClick={() => { this.props.changeTabIndex(4) }} className={`nav-link ${this.props.tab == 4 ? 'active' : ''} font-weight-semi-bold`} >Ảnh</div>
                                    </li>
                                </ul>
                            </div>
                            <div className="col col-360">
                                <div className="d-flex h-100 align-items-center justify-content-end">
                                    {!isMe ? <>
                                        {!is_like ?
                                            <a onClick={() => this.toggleLike(is_like)} href className="btn btn-sm btn-light">
                                                <i className="gapo-icon icon-like mr-1" />
                                                Thích trang
                                        </a> :
                                            <a onClick={() => this.toggleLike(is_like)} href className="btn btn-sm btn-light">
                                                <i className="gapo-icon icon-check mr-1 font-size-small" />
                                                Đã thích
                                    </a>}
                                    </> : null}
                                    {isMe &&
                                        <div className="dropdown">

                                            <Dropdown
                                                isOpen={this.state.showModalMenu}
                                                toggle={evt => {
                                                    this.setState({ showModalMenu: !this.state.showModalMenu })
                                                }}
                                            >
                                                <DropdownToggle className='hidden' size='sm' color='link'>
                                                    <button href className="btn btn-secondary bg-white setting__action d-flex justify-content-center ml-2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                                        <i className="gapo-icon icon-more-option" />
                                                    </button>
                                                </DropdownToggle>
                                                <DropdownMenu right>
                                                    <DropdownItem key={1} onClick={() => {

                                                    }} >
                                                        <div style={{ cursor: 'pointer' }} onClick={() => {
                                                            this.props.changeTabIndex(2);
                                                        }} className="dropdown-item d-flex align-items-center" href="#">
                                                            <i className="gapo-icon icon-pencil-alt mr-2" />
                                                            Chỉnh sửa thông tin trang
                                                     </div>
                                                    </DropdownItem>
                                                    <DropdownItem key={1} >
                                                        <div
                                                            onClick={() => {
                                                                this.removePage(id)
                                                            }}
                                                            className="dropdown-item d-flex align-items-center" href="#">
                                                            <i className="gapo-icon icon-bookmark-alt mr-2" />
                                                            Xóa trang
                                                    </div>
                                                    </DropdownItem>

                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}