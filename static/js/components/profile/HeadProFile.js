import React from 'react';
import { Link } from 'react-router-dom';
import services from '../../services';
import config from '../../services/config';
import Dropzone from 'react-dropzone';
import _ from 'lodash';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { connect } from 'react-redux';
import helper from '../../services/helper';
import amplitude from 'amplitude-js';

import Lightbox from 'react-image-lightbox';
class HeadProfile extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            showDrops: false,
            showOptionCover: false,
            relation: props.data.relation,
            dropRelation: false,
            dropEditInfor: false,
            imageToShow: '',
            showImage: false
        }
        this.toggleDropRelation = this.toggleDropRelation.bind(this);
    }
    toggleDropRelation() {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        this.setState({ dropRelation: !this.state.dropRelation });
    }
    componentWillReceiveProps(nextProps) {
        this.setState({ relation: nextProps.data.relation })
    }
    async requestUserRelation(id) {
        if (!services.helper.checkLogged()) {
            return services.helper.loginRequired();
        }
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        try {
            let rs = await services.data.requestUserRelation(id);
            this.setState({
                relation: 'pending'
            })
        } catch (error) {
            helper.alert(error.message)
        }

    }
    async cancelFriend(id) {
        if (!services.helper.checkLogged()) {
            return services.helper.loginRequired();
        }
        try {
            let rs = await services.data.cancelUserRelation(id);
            this.setState({
                relation: ''
            })
        } catch (error) {
            helper.alert(error.message)
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
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
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
            await services.data.updateUser({
                id: this.props.user_id,
                avatar: rs.src
            });
            this.props.refreshData({ avatar: rs.src });
            amplitude.getInstance().logEvent('Profile_Update Avatar')
        } catch (err) {
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
            await services.data.updateUser({
                id: this.props.user_id,
                cover: rs.src
            })
            this.props.refreshData({ cover: rs.src });
            amplitude.getInstance().logEvent('Profile_Update Cover');
        } catch (err) {
            services.helper.alert('Lỗi cập nhật ảnh bìa');
        }
    }
    async uploadBackground(acceptedFiles) {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        let type = acceptedFiles[0].type.substr(0, 5)
        if (type !== 'image') {
            return services.helper.alert('Không hỗ trợ định dạng tệp')
        }
        let fileData = await this.loadImage(acceptedFiles[0])
        let newBackground = {
            loading: true,
            progress: 1,
            src: fileData.target.result,
            cancelToken: services.request.getCancelToken()
        }
        let formData = new FormData()
        try {
            formData.append('image', acceptedFiles[0])
            let rs = await services.request.upload('/media/v1.0/images', formData, newBackground.cancelToken, p => { })
            await services.data.updateUser({
                user_settings: {
                    background: rs.src
                }
            })
            this.props.refreshData({
                user_settings: {
                    background: rs.src
                }
            })
        } catch (e) {
            services.helper.alert('Lỗi cập nhật background')
        }
    }
    async pickImage() {
        // await services.helper.loginRequired();
        let src = await services.helper.pickImage(this.props.user_id);
        let rs = await services.data.updateUser({
            id: this.props.user_id,
            cover: src
        })
        this.props.refreshData({ cover: rs.src });
        amplitude.getInstance().logEvent('Profile_Update Cover');
    }
    async createChatChannel() {
        if (!services.helper.checkLogged()) {
            return services.helper.loginRequired();
        }
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        let rs = await services.data.chat.createDirectChannel([this.props.user.id_chat, this.props.id_chat]);
        window.location.href = `/messenger/${rs.id}`
    }
    renderFriendStatus() {
        let { relation } = this.state
        if (relation === "pending" || relation === "denied") {
            return (
                <Dropdown isOpen={this.state.dropRelation} toggle={this.toggleDropRelation}>
                    <DropdownToggle className="btn btn-light btn-sm" >
                        <i className="gapo-icon icon-check mr-1 font-size-small" />
                        Đã gửi lời mời
                </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem onClick={() => this.cancelFriend(this.props.user_id)}>Huỷ lời mời</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            )
        }
        if (relation === "friend") {
            return (
                <Dropdown isOpen={this.state.dropRelation} toggle={this.toggleDropRelation}>
                    <DropdownToggle className="btn btn-block btn-sm btn-light"  >
                        <i className="gapo-icon icon-check mr-1 font-size-small" />
                        Bạn bè
                </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem >Nhận thông báo</DropdownItem>
                        <DropdownItem onClick={() => this.cancelFriend(this.props.user_id)}>Huỷ kết bạn</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            )
        }
        return (
            <div>
                <a onClick={() => this.requestUserRelation(this.props.user_id)} className="btn btn-block btn-sm btn-primary">
                    <i className="gapo-icon icon-add-friend mr-1" />
                    Kết bạn
                </a>
            </div>

        )
    }

    async onAcceptClick() {
        try {
            await services.data.acceptUserRelation(this.props.data.id);
            this.props.refreshData({ relation: '' })
        } catch (error) {
            helper.alert(error.message)
        }
    }

    async onDeclineClick() {
        try {
            await services.data.declineUserRelation(this.props.data.id);
            this.props.refreshData({ relation: 'friend' })
        } catch (error) {
            helper.alert(error.message)
        }
    }

    renderBtnRight() {
        if (this.props.isMe) {
            return null
        }
        if (this.props.data.relation == "receive") {
            return <React.Fragment>
                <a onClick={() => {
                    this.onAcceptClick()
                }} className="btn btn-sm btn-primary-light mr-2">
                    <i className="gapo-icon icon-check mr-1 font-size-small" />
                    Xác nhận
                   </a>
                <a onClick={() => {
                    this.onDeclineClick()
                }} className="btn btn-light btn-sm">
                    Xoá lời mời
                   </a>
            </React.Fragment>
        }
        else {
            return <React.Fragment>
                {this.props.data.relation === 'friend' ? <a className="btn btn-sm btn-primary-light mr-2" onClick={() => {
                    this.createChatChannel();
                }}>
                    <i className="gapo-icon icon-add-friend mr-1" />
                    Nhắn tin
                    </a> : null}
                {this.renderFriendStatus()}
            </React.Fragment>
        }
    }
    checkActive() {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
    }
    render() {
        let { showOptionCover, dropEditInfor } = this.state
        let { isMe, data } = this.props;
        let active = false;
        if (services.helper.checkActive()) active = true
        return (<div className="text-center rounded bg-white shadow mb-4 profile__head position-relative">
            <div onClick={evt => {
                evt.stopPropagation();
                this.setState({ imageToShow: data.cover, showImage: true })
            }} className="profile__head__cover rounded-top position-relative" style={{ backgroundImage: `url(${data.cover})` }}>
                <div className="profile__head__avatar rounded-circle">
                    <a onClick={evt => {
                        evt.stopPropagation();
                        this.setState({ imageToShow: data.avatar, showImage: true })
                    }} className="gapo-avatar" style={{ backgroundImage: `url(${data.avatar})` }}><img className="w-100" /></a>
                    <a onClick={evt => {
                        evt.stopPropagation();
                    }}>
                        {isMe && active &&
                            <Dropzone onDrop={this.uploadAvatar.bind(this)}>
                                {({ getRootProps, getInputProps }) => (
                                    <button onClick={evt => {
                                        evt.stopPropagation();
                                    }} {...getRootProps()} className="upload-avatar__action rounded-circle btn d-flex align-items-center justify-content-center">
                                        <input {...getInputProps()} />
                                        <i className="gapo-icon icon-camera-alt" />
                                    </button>
                                )}
                            </Dropzone>}
                        {isMe && !active && <button
                            onClick={this.checkActive.bind(this)}
                            className="upload-avatar__action rounded-circle btn d-flex align-items-center justify-content-center">
                            <i className="gapo-icon icon-camera-alt" />
                        </button>}
                    </a>
                </div>
                {this.state.showImage ? <Lightbox
                    mainSrc={this.state.imageToShow}
                    onCloseRequest={() => this.setState({ showImage: false })}
                /> : null}
                <div className="dropdown upload-cover__action">
                    {isMe &&
                        <Dropdown
                            isOpen={showOptionCover}
                            toggle={evt => {
                                evt.stopPropagation();
                                if (!services.helper.checkActive()) {
                                    return services.helper.requestActive().then(rs => {
                                        if (rs === 'active') {
                                            window.location.href = '/login/update-information'
                                        }
                                    })
                                }
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
                                <DropdownItem key={1} onClick={evt => {
                                    evt.stopPropagation();
                                    this.pickImage()
                                }}>
                                    <a className="dropdown-item" data-toggle="modal" data-target="#exampleModal">
                                        Chọn ảnh
                                </a>
                                </DropdownItem>
                                <div className='dropdown-item' >
                                    <a onClick={evt => {
                                        console.log('stop propagation');
                                        evt.stopPropagation();
                                    }}>
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
                                    </a>
                                </div>
                            </DropdownMenu>
                        </Dropdown>}
                </div>

            </div>
            <div className="profile__head__content">
                <h1 className="profile__name font-weight-semi-bold">{this.props.data.display_name}
                    {data.status_verify == 1 ? <img src='/assets/images/svg-icons/checkmark.svg' style={{ width: 20, height: 20, marginLeft: 5, marginBottom: 3 }} /> : null}
                </h1>
                {/* <div>Cuộc sống không phải màu hồng. Bằng lòng với những gì mình có
                <a ><i className="gapo-icon icon-pencil-alt-2 ml-2" /></a>
                </div>
                {isMe && <div>Mô tả ngắn về bản thân bạn. <a href="#" className="ml-1 text-primary">Thêm mô tả</a></div>} */}
            </div>
            <div className="profile__head__nav d-flex px-3">
                <ul className="nav mr-auto">
                    <li className="nav-item">
                        <div style={{ cursor: 'pointer' }} onClick={() => { this.props.changeTabIndex(1) }} className={`nav-link ${this.props.tab == 1 ? 'active' : ''} font-weight-semi-bold`} >Dòng thời gian</div>
                    </li>
                    <li className="nav-item">
                        <div style={{ cursor: 'pointer' }} onClick={() => { this.props.changeTabIndex(2) }} className={`nav-link ${this.props.tab == 2 ? 'active' : ''} font-weight-semi-bold`} >Giới thiệu</div>
                    </li>
                    <li className="nav-item">
                        <div style={{ cursor: 'pointer' }} onClick={() => { this.props.changeTabIndex(3) }} className={`nav-link ${this.props.tab == 3 ? 'active' : ''} font-weight-semi-bold`} >Bạn bè</div>
                    </li>
                    <li className="nav-item">
                        <div style={{ cursor: 'pointer' }} onClick={() => { this.props.changeTabIndex(4) }} className={`nav-link ${this.props.tab == 4 ? 'active' : ''} font-weight-semi-bold`} >Ảnh</div>
                    </li>
                </ul>

                <Dropzone onDrop={this.uploadBackground.bind(this)}>
                    {({ getRootProps, getInputProps }) => (
                        <button onClick={evt => { evt.stopPropagation() }} {...getRootProps()} className="btn d-flex align-items-center btn-alpha-dark btn-sm font-weight-normal ml-2" style={{ height: '2rem', marginTop: '10px' }}>
                            <input {...getInputProps()} />
                            <i className="gapo-icon icon-camera-alt mr-1" />
                            Thay đổi phông nền
                        </button>
                    )}
                </Dropzone>

                <div className="d-flex align-items-center align-items-start">
                    {this.renderBtnRight()}
                    {isMe &&
                        <Dropdown
                            isOpen={dropEditInfor}
                            toggle={evt => {
                                this.setState({ dropEditInfor: !dropEditInfor })
                            }}
                        >
                            <DropdownToggle className='hidden' size='sm' color='link'>
                                <button className="btn btn-secondary setting__action rounded-circle border-0 d-flex justify-content-center ml-2"
                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded='false'>
                                    <i className="gapo-icon icon-config" />
                                </button>
                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem key={0} onClick={() => {
                                    this.props.changeTabIndex(2);
                                }} >
                                    <div style={{ cursor: 'pointer' }} onClick={() => {
                                        this.props.changeTabIndex(2);
                                    }} className="dropdown-item d-flex align-items-center" href="#">
                                        Chỉnh sửa thông tin
                               </div>
                                </DropdownItem>
                                <DropdownItem key={1}>
                                    <Link to='/change-password' className="dropdown-item d-flex align-items-center">
                                        Thay đổi mật khẩu
                                    </Link>
                                </DropdownItem>
                                <DropdownItem key={2}>
                                    <Link
                                        to='/'
                                        onClick={() => { }}
                                        className="dropdown-item d-flex align-items-center" href="#">
                                        Lưu trữ
                                    </Link>
                                </DropdownItem>

                            </DropdownMenu>
                        </Dropdown>}
                </div>
            </div>
        </div>)
    }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null)(HeadProfile);
