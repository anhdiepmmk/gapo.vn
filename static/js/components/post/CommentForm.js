import React from 'react';
import services from '../../services';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import moment from 'moment';
import Dropzone from 'react-dropzone';
import Textarea from 'react-textarea-autosize';
import { Picker } from 'emoji-mart'
import _ from 'lodash';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import amplitude from 'amplitude-js';

class CommentForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            textRef: null,
            content: '',
            loading: false,
            mediaData: [],
            showEmoji: false,
        }
    }
    componentWillReceiveProps(next) {
        if (next.editData) {
            this.setState({
                content: next.editData.item.content,
                id: next.editData.item.id,
                mediaData: next.editData.item.mediaData
            })
        }
    }
    textRef = null;
    focusComment() {
        if (this.textRef) {
            this.textRef.focus();
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
    onUpdate(item) {
        if (this.props.onUpdateComment) this.props.onUpdateComment(item);
    }
    async createComment() {
        if (!(this.state.content && this.state.content.trim().length > 0) && this.state.mediaData.length === 0) {
            return alert('Vui lòng nhập nội dung bình luận')
        };
        if (!services.helper.checkLogged()) return services.helper.loginRequired().then(rs => {
            if (rs === 'login') {
                window.location.href = '/login'
            }
        })
        if (!services.helper.checkActive()) return services.helper.requestActive().then(rs => {
            if (rs === 'active') {
                window.location.href = '/login/update-information'
            }
        })
        if (this.props.editData) { //update
            services.data.updateComment({
                id: this.state.id,
                content: this.state.content,
                media: _.cloneDeep(this.state.mediaData)
            });
            this.onUpdate({
                content: this.state.content,
                mediaData: _.cloneDeep(this.state.mediaData)
            });
        } else {
            this.setState({ loading: true });
            if (this.props.replyInfo) {
                let rs = await services.data.replyComment(this.props.replyInfo.id, this.state.content, this.state.mediaData);
                if (this.props.onNewReply) {
                    this.props.onNewReply(
                        this.props.replyInfo.id,
                        {
                            id: rs.comment_id,
                            content: this.state.content,
                            counts: {
                                react_count: 0,
                                reply_count: 0
                            },
                            update_time: moment().format('X'),
                            user: this.props.user,
                            mediaData: _.cloneDeep(this.state.mediaData)
                        })
                }
            } else {
                let rs = await services.data.createComment(this.props.post_id, this.state.content, this.state.mediaData);
                if (this.props.onNewComment) {
                    this.props.onNewComment({
                        id: rs.comment_id,
                        content: this.state.content,
                        counts: {
                            react_count: 0,
                            reply_count: 0
                        },
                        update_time: moment().format('X'),
                        user: this.props.user,
                        mediaData: _.cloneDeep(this.state.mediaData)
                    })
                }

            }

        }
        this.setState({ loading: false, content: '', mediaData: [] })
    }
    async onImageDrop(acceptedFiles) {
        let mediaData = _.cloneDeep(this.state.mediaData);
        if (acceptedFiles.length + mediaData.length > 1) return services.helper.alert('Không được phép bình luận quá 1 ảnh');
        acceptedFiles.map(i => {
            let type = i.type.substr(0, 5);
            if (type === 'image') mediaData.push({ type: i.type });
        })
        let index = this.state.mediaData.length;
        this.setState({ mediaData }, () => {
            for (var i = 0; i < acceptedFiles.length; i++) {
                this.processFile(acceptedFiles[i], index + i);
            }
        })
    }
    async processFile(file, index) {
        let type = file.type.substr(0, 5);
        if (type !== 'image') {
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
        this.setState({ mediaData });
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
    onRemoveImageClick(index) {
        let mediaData = _.cloneDeep(this.state.mediaData);
        mediaData.splice(index, 1);
        this.setState({ mediaData });
    }
    rendermediaData() {
        if (this.state.mediaData.length === 0) return null;
        return <div className="gapo-comment media align-items-center pt-0">
            <Link to='/profile' className="gapo-avatar gapo-avatar--24 mr-2 invisible" style={{ backgroundImage: `url(${this.props.user.avatar})` }}>
            </Link>
            <div className="media-body">
                <div className="comment__form d-flex align-items-end pr-2 comment-media-container">
                    {this.state.mediaData.map((item, index) =>
                        <div className="photo-upload-item mr-2" key={index}>
                            <img src={item.src} alt='img' />
                            <a href={null} className="photo-delete__action" title="Gỡ ảnh" onClick={() => {
                                this.onRemoveImageClick(index);
                            }} ><i class="gapo-icon icon-close icon-2x" ></i></a>
                            {item.loading ?
                                <span className="progress-indicator">{item.progress}%</span>
                                : null}
                        </div>)
                    }
                </div>
            </div>
        </div>
    }
    render() {
        if (!services.helper.checkLogged()) return null;
        let replyText = null;
        if (this.props.replyInfo) {
            replyText = <div className='comment__item'>
                <span>{`Trả lời bình luận của ${this.props.replyInfo.page ? this.props.replyInfo.page.title : this.props.replyInfo.user.display_name}`}</span>
            </div>
        }
        return <React.Fragment>
            {replyText}
            {/* <div className="gapo-comment media align-items-center">
                {this.rendermediaData()}
            </div> */}
            <div className="gapo-comment media align-items-center">
                <Link to='/profile' className="gapo-avatar gapo-avatar--24 mr-2" style={{ backgroundImage: `url(${this.props.user.avatar})` }}>
                </Link>
                <div className="media-body">
                    <div className="comment__form d-flex align-items-end pr-2">
                        <Textarea
                            name='content'
                            className="form-control border-0 shadow-none bg-transparent"
                            placeholder="Viết bình luận…"
                            onBlur={evt => {
                                if (evt.target.value && !this.props.replyInfo) amplitude.getInstance().logEvent('Comment Action')
                                if (evt.target.value && this.props.replyInfo) amplitude.getInstance().logEvent('Reply Action')

                            }}
                            value={this.state.content}
                            // onKeyDown={evt => {

                            //     if (evt.keyCode === 13) {
                            //         evt.preventDefault();
                            //         this.createComment();
                            //     }
                            // }}
                            onKeyDown={evt => {

                                if (evt.keyCode === 13) {
                                    evt.preventDefault();
                                    if (evt.altKey) {
                                        let content = this.state.content;
                                        content += '\n';
                                        this.setState({ content });
                                    } else {
                                        this.createComment();
                                    }

                                }
                            }}
                            onChange={evt => {
                                this.setState({ content: evt.target.value });
                            }}
                            inputRef={textRef => {
                                this.textRef = textRef;
                            }}
                        />


                        <Dropdown direction="up" isOpen={this.state.showEmoji} toggle={() => { this.setState({ showEmoji: !this.state.showEmoji }) }}>
                            <DropdownToggle className='btn btn-transparent comment__action shadow-none' style={{ backgroundColor: 'transparent', border: 'unset', color: 'unset', padding: 2, marginBottom: 3.5, color: 'gray', marginRight: 3 }}  >
                                <i className="gapo-icon icon-emotion-alt" />
                            </DropdownToggle>
                            <DropdownMenu >
                                <Picker
                                    onSelect={(emoji) => {
                                        this.setState({ showEmoji: false, content: this.state.content + emoji.native })
                                    }}
                                    i18n={{
                                        search: 'Tìm kiếm',
                                        clear: 'Xóa', // Accessible label on "clear" button
                                        notfound: 'Không có biểu tượng nào',
                                        skintext: 'Chọn sin mặc định',
                                        categories: {
                                            search: 'Kết quả tìm kiếm',
                                            recent: 'Thường xuyên sử dụng',
                                            people: 'Mặt cười & con người',
                                            nature: 'Động vật & Thiên nhiên',
                                            foods: 'Đồ ăn & đồ uống',
                                            activity: 'Hành động',
                                            places: 'Du lịch & Địa điểm',
                                            objects: 'Đối tượng',
                                            symbols: 'Biểu tượng',
                                            flags: 'Cờ',
                                            custom: 'Tùy chỉnh',
                                        },
                                        categorieslabel: 'Danh mục biểu tượng', // Accessible title for the list of categories
                                        skintones: {
                                            1: 'Màu mặc định',
                                            2: 'Màu sáng',
                                            3: 'Màu sáng vừa',
                                            4: 'Màu trung tính',
                                            5: 'Màu tối vừa',
                                            6: 'Màu tối',
                                        }
                                    }}
                                    emojiTooltip={true}
                                    native={true}
                                    style={{ border: 'unset' }}
                                    title='Chọn biểu tượng'
                                />
                            </DropdownMenu>
                        </Dropdown>

                        {this.state.mediaData.length == 0 ? <Dropzone onDrop={this.onImageDrop.bind(this)}>
                            {({ getRootProps, getInputProps }) => (
                                <button className="btn btn-transparent comment__action shadow-none" {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <i className="gapo-icon icon-camera-alt" />
                                </button>)}
                        </Dropzone> : null}
                    </div>

                </div>

            </div>
            {this.rendermediaData()}
        </React.Fragment>
    }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null, { forwardRef: true })(CommentForm);