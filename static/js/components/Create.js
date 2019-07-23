import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Dropzone from 'react-dropzone';
import services from '../services';
import _ from 'lodash';
import PreviewMediaLink from '../shared/PreviewMediaLink';
import configStore from '../configStore';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import Textarea from 'react-textarea-autosize';
import LinkPreview from '../shared/LinkPreview';
import Post from './post/Post';
import amplitude from 'amplitude-js';

const PRIVACY = {
    1: {
        name: 'Công khai',
        icon: 'icon-globe-alt'
    },
    2: {
        name: 'Bạn bè',
        icon: 'icon-friends'
    },
    3: {
        name: 'Chỉ mình tôi',
        icon: 'icon-lock'
    },

}
class Create extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content: '',
            mediaData: [],
            extra: [],
            loading: false,
            colors: ['#FFFFFF', '#596E79', '#757575', '#684D43', '#F4B53F', '#88B053', '#DABC53', '#4BAABE', '#429ADF', '#3F88DE', '#573CAA', '#8232A4', '#D4483E'],
            showBgColors: false,
            colorIndex: 0,
            editMode: 1, //1: white, 2: background
            showTags: false,
            mode: this.props.mode || 'create',
            showMode: false,
            privacy: 1,
            preview_link: null,
            preview_post: this.props.preview_post,
            loadPreview: false
        }
    }
    async checkMedia() {
        if (this.state.preview_link || this.state.mediaData.length > 0) return;
        let url = services.helper.extractUrl(this.state.content);
        if (!url) return;
        this.setState({ loadPreview: true });
        let content = await services.data.getPreviewData(url);
        this.setState({ loadPreview: false });
        let input = {
            type: 'link',
            title: content.title,
            src: content.url,
            description: content.description,
            thumb: {
                type: "image",
                src: content.image
            }
        }
        this.setState({ preview_link: input });
    }
    onClose(rs) {
        if (this.props.onClose) {
            this.props.onClose(rs);
        }
    }
    componentDidMount() {
        this.loadData();
    }
    async loadData() {
        if (!this.props.post) return;
        let mode = 'edit';
        // let feed = await services.data.viewPost(this.props.id);
        // feed.mediaData = feed.mediaData;
        this.setState({ ...this.props.post, mode });
    }
    async canPost() {
        if (!(this.state.mediaData.length > 0 || this.state.content)) {
            return services.helper.alert('Vui lòng nhập nội dung bài viết');
        }
        for (var i = 0; i < this.state.mediaData.length; i++) {
            if (this.state.mediaData[i].loading) {
                await services.helper.alert('Đang có nội dung chưa tải lên xong. Vui lòng đợi...');
                return false;
            }
        }
        return true;
    }
    getTags(content) {
        let tmp = content + ' ';
        let re = /#(.*?) /g;
        let m = null;
        let rs = [];
        do {
            m = re.exec(tmp);
            if (m) rs.push(m[1]);
        } while (m);
        return rs;
    }
    async onBackClick() {
        try {
            if (this.state.content) {
                await services.helper.confirm('Bạn có chắc muốn hủy bài đăng?');
            }
            window.history.back();
        } catch (err) {
            console.log('err', err)
        }
    }
    hasVideo() {
        for (var i = 0; i < this.state.mediaData.length; i++) {
            if (this.state.mediaData[i].type === 'video') {
                return true;
            }
        }
    }

    async createPost() {
        let options = this.props;
        if (!options) {
            amplitude.getInstance().logEvent('Post Confirm')
        }
        if (!await this.canPost()) return;
        if (this.state.content.length > 5000) return services.helper.alert('Nội dung dài quá 5000 ký tự!');
        if (this.hasVideo()) {
            services.helper.alert('Video trong bài viết đang được xử lý. Chúng tôi sẽ gửi cho bạn thông báo khi hoàn tất và bài viết của bạn sẵn sàng để xem');
        }
        this.setState({ loading: true });
        let media = _.cloneDeep(this.state.mediaData);
        if (this.state.preview_link) {
            media.push(this.state.preview_link);
        }
        let rs = await services.data.createPost({
            content: this.state.content,
            media,
            privacy: this.state.privacy,
            target: this.props.target,
        });
        this.setState({ loading: false });
        if (this.hasVideo()) {
            return this.onClose();
        }
        let newPost = {
            id: rs.post_id,
            content: this.state.content,
            mediaData: _.cloneDeep(this.state.mediaData),
            tags: [],
            user: this.props.user,
            counts: {
                comment_count: 0,
                react_count: 0,
                view_count: 0
            },
            comments: [],
            create_time: new Date().getTime() / 1000,
            privacy: this.state.privacy,
            preview_link: this.state.preview_link,
            page: this.props.page
        }
        this.onClose(newPost);
    }
    async updatePost() {
        try {
            this.setState({ loading: true });
            let updatedPost = {
                id: this.state.id,
                content: this.state.content,
                mediaData: _.cloneDeep(this.state.mediaData),
                media: _.cloneDeep(this.state.mediaData),
                tags: [],
                user: this.state.user,
                counts: this.state.counts,
                comments: this.state.comments,
                create_time: this.state.create_time,
                privacy: this.state.privacy,
                preview_post: this.state.preview_post,
                preview_link: this.state.preview_link,
                page: this.props.page
            }
            await services.data.updatePost(updatedPost);
            this.setState({ loading: false });
            this.onClose(updatedPost);
        } catch (err) {
            services.helper.alert('Không thể xóa bài viết');
        }
    }
    async sharePost() {
        amplitude.getInstance().logEvent('Post Share To Wall')
        if (!await this.canPost()) return;
        this.setState({ loading: true })
        let res = await services.data.createPost({
            content: this.state.content,
            media: [{ type: 'gapoURI', src: `gapo://post/${this.props.preview_post.id}` }],
            privacy: this.state.privacy,
            target: this.props.target,
        });
        this.setState({ loading: false });
        let newSharePost = {
            id: res.post_id,
            content: this.state.content,
            mediaData: _.cloneDeep(this.state.mediaData),
            tags: [],
            user: this.props.user,
            counts: {
                comment_count: 0,
                react_count: 0,
                view_count: 0
            },
            comments: [],
            create_time: new Date().getTime() / 1000,
            privacy: this.state.privacy,
            preview_post: this.state.preview_post,
            preview_link: this.state.preview_link
        }
        this.onClose(newSharePost)
    }
    handleInput(evt) {
        let { name, value } = evt.target;
        if (name === 'content' && value.length > 5000) {
            return services.helper.alert('Nội dung dài quá 5000 ký tự!')
        }
        this.setState({ [name]: value }, () => {
            console.log('set ok');
            if (this.isPaste) {
                this.isPaste = false;
                this.checkMedia();
            }
        });
    }
    onRemoveImageClick(index) {
        let mediaData = _.cloneDeep(this.state.mediaData);
        if (mediaData[index].loading) {
            //cancel request
            services.request.cancelUpload(mediaData[index].cancelToken);
        }
        mediaData.splice(index, 1);
        this.setState({ mediaData });
    }
    canUploadNewVideo(files) {
        let videoCount = 0;
        for (var i = 0; i < this.state.mediaData.length; i++) {
            if (this.state.mediaData[i].type === 'video') videoCount++;
        }
        files.map(i => {
            if (i.type.substr(0, 5) === 'video') videoCount++;
        })
        return videoCount <= 1;
    }
    async processFile(file, index) {
        let type = file.type.substr(0, 5);
        if (type !== 'image' && type !== 'video') {
            return services.helper.alert('Không hỗ trợ định dạng tệp');
        }
        let fileData = await this.loadImage(file);
        let newmediaData = {
            _id: _.uniqueId(),
            type,
            loading: true,
            progress: 1,
            src: fileData.target.result,
            cancelToken: services.request.getCancelToken()
        }
        let mediaData = _.cloneDeep(this.state.mediaData);
        // mediaData.push(newmediaData);
        mediaData[index] = newmediaData;
        this.setState({ mediaData, preview_link: null });
        let formData = new FormData();
        switch (type) {
            case 'image':
                try {
                    formData.append('image', file);
                    let rs = await services.request.upload('/media/v1.0/images', formData, newmediaData.cancelToken, p => {
                        let mediaData = _.cloneDeep(this.state.mediaData);
                        if (!mediaData[index] || mediaData[index]._id !== newmediaData._id) return;
                        mediaData[index].progress = Math.round((p.loaded / p.total) * 100);
                        this.setState({ mediaData });
                    });
                    mediaData = _.cloneDeep(this.state.mediaData);
                    mediaData[index] = rs;
                    this.setState({ mediaData });
                } catch (err) {
                    services.helper.alert('Không thể upload');
                    mediaData = _.cloneDeep(this.state.mediaData);
                    mediaData.splice(index, 1);
                    this.setState({ mediaData });
                }
                break;
            default:
                try {
                    newmediaData.thumb = `/assets/images/video-icon.jpg`;
                    formData.append('video', file);
                    let rs = await services.request.upload('/media/v1.0/videos', formData, newmediaData.cancelToken, p => {
                        let mediaData = _.cloneDeep(this.state.mediaData);
                        if (!mediaData[index] || mediaData[index]._id !== newmediaData._id) return;
                        mediaData[index].progress = Math.round((p.loaded / p.total) * 100);
                        this.setState({ mediaData });
                    });
                    mediaData = _.cloneDeep(this.state.mediaData);
                    mediaData[index] = {
                        type: 'video',
                        video_id: rs.id,
                        thumb: `/assets/images/video-icon.jpg`
                    }
                    this.setState({ mediaData });
                } catch (err) {
                    services.helper.alert('Không thể upload');
                    mediaData = _.cloneDeep(this.state.mediaData);
                    mediaData.splice(index, 1);
                    this.setState({ mediaData });
                }
                break;
        }
    }
    async onImageDrop(acceptedFiles) {
        if (!this.canUploadNewVideo(acceptedFiles)) {
            return services.helper.alert('Mỗi bài đăng chỉ được phép đăng tối đa 1 video');
        }
        let mediaData = _.cloneDeep(this.state.mediaData);
        if (acceptedFiles.length + this.state.mediaData.length > 20) return services.helper.alert('Không thể up quá 20 ảnh!');
        acceptedFiles.map(i => {
            mediaData.push({ type: i.type });
        })
        let index = this.state.mediaData.length;
        this.setState({ mediaData }, () => {
            for (var i = 0; i < acceptedFiles.length; i++) {
                this.processFile(acceptedFiles[i], index + i);
            }
        })
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
    renderSharePost() {
        if (!this.state.preview_post) return null;
        return <div className='share-post-container'>
            <Post feed={this.state.preview_post} hideAction />
        </div>
    }
    rendermediaData() {
        console.log('render meida', this.state.mediaData)
        if (this.state.mediaData.length === 0) return null;
        return <div className="create-post__photos">
            {this.state.mediaData.map((item, index) => {
                if (item.type === 'link') return;
                return <div className="photo-upload-item mr-2" key={index}>
                    {item.type === 'image' ? <img src={item.src} alt='img' /> :
                        item.thumb ? <img src={item.thumb} alt='img' /> : ''}
                    <a className="photo-delete__action" title="Gỡ ảnh" onClick={() => {
                        this.onRemoveImageClick(index);
                    }} ><i className="gapo-icon icon-close icon-2x" ></i></a>
                    {item.loading ?
                        <span className="progress-indicator">{item.progress}%</span>
                        : null}
                </div>
            })
            }
            <Dropzone onDrop={this.onImageDrop.bind(this)} accept='image/*, video/*'>
                {({ getRootProps, getInputProps }) => (
                    <div className="photo-upload-item mr-2 item__upload text-center p-0" {...getRootProps()}>
                        <input {...getInputProps()} />
                        <i className="gapo-icon icon-plus photo-upload__action" />
                    </div>)}
            </Dropzone>
        </div>
    }
    renderFeeling() {
        return null;
        return <div className="text-left create-post__feeling d-flex align-items-center">
            <div>đang cảm thấy <b>hạnh phúc</b></div>
            <i className="svg-icon icon-feeling-1 ml-1" />
            <div className="ml-1">với <b>Tô Hương Liên</b> và <b>4 người khác</b></div>
        </div>
    }
    isPaste = false;
    renderEditor() {
        let actor = this.props.user;
        if (this.props.page) {
            actor = this.props.page;
        }
        let { options } = this.props;
        if (this.state.editMode === 1) {
            return <React.Fragment>
                <div className="d-flex align-items-start">
                    {this.props.isSharePost ? null : (
                        <Link to='/profile' className="gapo-avatar gapo-avatar--40 mr-2" style={{ backgroundImage: `url(${actor.avatar || actor.avatar})` }}>
                        </Link>
                    )}
                    <div className="create-post__box__input">
                        <Textarea
                            onKeyDown={evt => {
                                if (evt.keyCode === 32) {
                                    this.checkMedia();
                                }
                            }}
                            onPaste={evt => {
                                this.isPaste = true;
                            }}
                            name='content'
                            className="create-post__input w-100 border-0"
                            minRows={3}
                            placeholder={options ? options.placeholder : "Bạn muốn chia sẻ điều gì?"}
                            value={this.state.content}
                            onChange={this.handleInput.bind(this)}
                            maxRows={7}
                        />
                        {this.props.isSharePost ? null : (
                            <a href="#/" className="icon__close" onClick={evt => {
                                evt.preventDefault();
                                this.onClose();
                            }}><i className="gapo-icon icon-close icon-2x" /></a>
                        )}

                    </div>

                </div>
                <PreviewMediaLink loading={this.state.loadPreview} content={this.state.preview_link} showClose onClose={() => {
                    this.setState({ preview_link: null })
                }} />
                {this.renderFeeling()}
            </React.Fragment>
        }
        return <div className="p-3 create-post__box__color" style={{ background: this.state.colors[this.state.colorIndex] }}>
            <div className="create-post__box__input">
                <textarea
                    name='content'
                    className="create-post__input w-100 border-0"
                    rows={6}
                    placeholder={options ? options.placeholder : "Bạn muốn chia sẻ điều gì?"}
                    value={this.state.content}
                    onChange={this.handleInput.bind(this)} />
                <a href="#/" className="icon__close" onClick={evt => {
                    evt.preventDefault();
                    this.onClose();
                }}><i className="gapo-icon icon-close icon-2x" />
                </a>
                {this.renderFeeling()}
            </div>

        </div>
    }
    renderCreateActions() {
        let tags = null;
        let { options } = this.props;
        if (this.state.showTags) {
            tags = <div className="create-post__tag">
                <div className="create-post-tag-result text-left p-2">
                    <span className="d-inline-flex align-items-center mr-2">Tô Hương Liên <a href="#/" className="icon__delete ml-1"><i className="gapo-icon icon-close" /></a></span>
                    <span className="d-inline-flex align-items-center mr-2">Trang Nguyễn <a href="#/" className="icon__delete ml-1"><i className="gapo-icon icon-close" /></a></span>
                    <span className="d-inline-flex align-items-center mr-2">Linh Trần <a href="#/" className="icon__delete ml-1"><i className="gapo-icon icon-close" /></a></span>
                    <span className="d-inline-flex align-items-center mr-2">Đinh Thu Hương Giang<a href="#/" className="icon__delete ml-1"><i className="gapo-icon icon-close" /></a></span>
                    <span className="d-inline-flex align-items-center mr-2">Đỗ Lan Anh <a href="#/" className="icon__delete ml-1"><i className="gapo-icon icon-close" /></a></span>
                </div>
                <div className="create-post__tag__input">
                    <div className="dropdown show">
                        <div className="dropdown-toggle" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <label>với</label>
                            <input type="text" placeholder="Cùng với ai?" />
                        </div>
                        <div className="dropdown-menu" aria-labelledby="dropdownMenuLink">
                            <a className="dropdown-item d-flex align-items-center" href="#/">
                                <div className="friend__avatar mr-3">
                                    <img src="https://kenh14cdn.com/2019/3/22/503303783758588765283886517969469929684992n-1553273205434457806164.jpg" alt='avatar' />
                                </div>
                                Tô Hương Liên
                  </a>
                            <a className="dropdown-item d-flex align-items-center" href="#/">
                                <div className="friend__avatar mr-3">
                                    <img src="https://danongonline.com.vn/wp-content/uploads/2018/02/anh-girl-xinh-9-1.jpg" alt='avatar' />
                                </div>
                                Hương Lương
                  </a>
                            <a className="dropdown-item d-flex align-items-center" href="#/">
                                <div className="friend__avatar mr-3">
                                    <img src="http://www.hetronic.com/hetronic/Users/105/81/5481/khong-thua-gi-han-quoc-thai-lan-lao-cung-co-day-hot-girl-xinh-dep-va-sang-chanh_20160608111042675%20(1).jpg?ver=2018-08-05-200007-670" alt='avatar' />
                                </div>
                                Linh Hương
                  </a>
                            <a className="dropdown-item d-flex align-items-center" href="#/">
                                <div className="friend__avatar mr-3">
                                    <img src="https://2sao.vietnamnetjsc.vn/images/2019/03/26/22/43/u23-viet-nam-06.jpg" alt='avatar' />
                                </div>
                                Trang Nguyễn
                  </a>
                            <a className="dropdown-item d-flex align-items-center" href="#/">
                                <div className="friend__avatar mr-3">
                                    <img src="https://soikeom88.com/wp-content/uploads/2019/03/gai-xinh-tap-gym-tu-suong.jpg" alt='avatar' />
                                </div>
                                Linh Nguyễn
                  </a>
                        </div>
                    </div>
                </div>
            </div>
        }
        return <React.Fragment>
            <div className="create-post__actions d-flex px-3 mt-1">
                <Dropzone onDrop={this.onImageDrop.bind(this)}>
                    {({ getRootProps, getInputProps }) => (
                        <a className="create-post__actions__item p-2 d-flex align-items-center justify-content-center" {...getRootProps()}>
                            <input {...getInputProps()} />
                            <i className="gapo-icon icon-picture-landscape-2 mr-2 create-post__icon" />
                            {options ? options.type : 'Ảnh/Video'} </a>)}
                </Dropzone>
                {/* <a className="create-post__actions__item p-2 d-flex align-items-center justify-content-center" onClick={evt => {
                    evt.preventDefault();
                    this.setState({ showTags: !this.state.showTags });
                }}>
                    <i className="gapo-icon icon-tag-friends mr-2 create-post__icon" />
                    Gắn thẻ bạn bè
      </a> */}
                {/* <div className="dropdown create-post__actions__item">
                    <a className="d-flex align-items-center justify-content-center" id="create-post-dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i className="gapo-icon icon-emotion mr-2 create-post__icon"></i>
                        Cảm xúc</a>
                </div> */}
            </div>
            {tags}
        </React.Fragment>
    }
    renderColors() {
        return <div className="d-flex justify-content-end py-2">
            {this.state.showBgColors ?
                <React.Fragment>
                    {this.state.colors.map((item, index) =>
                        <button
                            onClick={() => {
                                let editMode = index > 0 ? 2 : 1
                                this.setState({ colorIndex: index, editMode })
                            }}
                            style={{ background: item }} className={`item__color mr-2 ${this.state.colorIndex === index ? 'active' : ''}`}
                            key={index}></button>)}
                    <button style={{ background: '#E5E5E5' }} className="item__color mr-3" onClick={evt => {
                        this.setState({ showBgColors: false })
                    }}>
                        <svg width={7} height={10} viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1.07129 1.07153L5.357 5.00011L1.07129 8.92868" stroke="#4D4D4D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </React.Fragment> :
                <a href="#/" className="mr-2" onClick={evt => {
                    evt.preventDefault();
                    this.setState({ showBgColors: true })
                }}><i className="svg-icon icon-color-create-post"></i></a>}

            <a href="#/"><i className="svg-icon icon-smile" /></a>
        </div>
    }
    render() {
        let { options } = this.props;
        return (
            <React.Fragment>
                <div className={`p-3 bg-white shadow mb-3 create-post ${this.state.editMode === 1 ? 'p-3' : ''} ${this.props.isSharePost ? 'border-bottom-radius' : 'rounded'}`}>
                    {this.renderEditor()}
                    {/* <LinkPreview content={this.state.content} /> */}
                    {/* {this.renderColors()} */}
                    {this.rendermediaData()}
                    {this.renderSharePost()}
                    {this.renderCreateActions()}
                    <div className="create-post__share align-items-center d-flex" style={{ border: this.props.isSharePost ? 'none' : '', marginTop: this.props.isSharePost ? '12px' : '0' }}>
                        <span style={{ display: 'flex' }}>Chia sẻ:
                        {this.props.page ? <p> <i style={{ marginTop: 3, marginLeft: 3 }} className={`gapo-icon ${PRIVACY[1].icon} float-left mr-1`} />{PRIVACY[1].name}</p> : null}
                        </span>
                        {!this.props.page ? <Dropdown isOpen={this.state.showMode} toggle={() => {
                            this.setState({ showMode: !this.state.showMode });
                        }}>
                            <DropdownToggle className='btn btn-transparent shadow-none align-items-center d-flex' size='sm' color='link'>
                                <i className={`gapo-icon ${PRIVACY[this.state.privacy].icon} float-left mr-1`} />{PRIVACY[this.state.privacy].name}

                            </DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem onClick={() => { this.setState({ privacy: 1 }) }}>
                                    <div className="custom-control custom-radio">
                                        <input type="radio" id="public" name="privacy"
                                            checked={this.state.privacy === 1} className="custom-control-input"
                                            value={this.state.mode}
                                            onChange={() => { }}
                                        />
                                        <label className="custom-control-label d-flex align-items-center" htmlFor="public">
                                            <i className="gapo-icon icon-globe-alt mr-2 ml-1" /> Công khai
                                                </label>
                                    </div>
                                </DropdownItem>
                                <DropdownItem onClick={() => {
                                    this.setState({ privacy: 2 })
                                }}>
                                    <div className="custom-control custom-radio" >
                                        <input type="radio" id="friends"
                                            checked={this.state.privacy === 2}
                                            name="privacy" className="custom-control-input"
                                            value={this.state.mode}
                                            onChange={() => { }}
                                        />
                                        <label className="custom-control-label d-flex align-items-center" htmlFor="friends">
                                            <i className="gapo-icon icon-friends mr-2 ml-1" /> Bạn bè
                                                </label>
                                    </div>
                                </DropdownItem>
                                <DropdownItem onClick={() => { this.setState({ privacy: 3 }) }} >
                                    <div className="custom-control custom-radio">
                                        <input type="radio" id="only_me"
                                            checked={this.state.privacy === 3}
                                            name="privacy"
                                            className="custom-control-input"
                                            value={this.state.mode}
                                        />
                                        <label className="custom-control-label d-flex align-items-center" htmlFor="only_me">
                                            <i className="gapo-icon icon-lock mr-2 ml-1" /> Chỉ mình tôi
                                                </label>
                                    </div>
                                </DropdownItem>
                                {/* <div className="dropdown share__dropdown">
                                            <div className="dropdown-menu dropdown-menu-right" aria-labelledby="create-post-dropdown">
                                                <a className="dropdown-item" href="#/">

                                                </a>
                                                <a className="dropdown-item" href="#/">

                                                </a>
                                                <a className="dropdown-item" href="#/">

                                                </a>
                                            </div>
                                        </div> */}
                            </DropdownMenu>
                        </Dropdown> : null}
                        {this.state.mode === 'share' ? (
                            <div className="ml-auto">
                                <button onClick={() => this.onClose(this.state.preview_post)} type="button" className="btn btn-light btn-sm" data-dismiss="modal" style={{ marginRight: '8px' }}>Huỷ</button>
                                <button onClick={this.sharePost.bind(this)} type="button" className="btn btn-primary btn-sm">Chia sẻ</button>
                            </div>
                        ) : null}
                    </div>
                    <div className="mt-3">
                        {this.state.mode === 'create' ? <button className="btn btn-primary btn-block" onClick={this.createPost.bind(this)}>{options ? options.titleButton : 'Chia sẻ'}</button> : null}
                        {this.state.mode === 'edit' ? <button className="btn btn-primary btn-block" onClick={this.updatePost.bind(this)}>Cập nhật</button> : null}
                    </div>
                </div>
            </React.Fragment>
        )
    }
}

const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps)(Create);