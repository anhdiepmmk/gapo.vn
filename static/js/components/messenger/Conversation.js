import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import services from '../../services';
import _ from 'lodash';
import InfiniteScroll from 'react-infinite-scroller';
import Loading from '../Loading';
import Dropzone from 'react-dropzone';
import moment from 'moment'
import chatSocket from '../../services/chat';
import ContentDisplay from './../../shared/ContentDisplay';
import PerfectScrollbar from 'react-perfect-scrollbar'
import ImageViewer from './../../shared/ImageView';
import ChatImage from './ChatImage';
import { Dropdown, DropdownToggle, DropdownMenu } from 'reactstrap';
import { Picker } from 'emoji-mart'
const PubSub = require('pubsub-js');

const ITEM_PER_PAGE = 20;
const BOX_ID = `chatbox_${_.uniqueId()}`;
var Scroll = require('react-scroll');
let timeTyping = 500;//milliseconds
class Conversation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      hasMore: true,
      data: [],
      typings: '',
      channel: null,
      mediaData: [],
      files: [],
      showEmoji: false
    }

  }
  typingUsers = [];
  token = null;
  query = {};
  page = 0;
  loading = false;
  checkIntervalTyping() {
    if (this.typingUsers.length === 0) return;
    let updated = false;
    let now = new Date().getTime();
    let newUsers = [];
    this.typingUsers.map(t => {
      if (now - t.time <= timeTyping) {
        newUsers.push(t);
      } else {
        updated = true;
      }
      return null;
    })
    if (!updated) return;
    this.typingUsers = newUsers;
    if (newUsers.length === 0) {
      return this.setState({ typings: '' })
    }
    let typings = newUsers[0].display_name;
    for (let i = 1; i < newUsers.length; i++) {
      typings = ',' + newUsers[i].display_name
    }
    typings += ' đang soạn tin...';
    this.setState({ typings });
  }
  getGapoUserFromIdChat(id) {
    if (!this.props.channel) return null;
    for (var i = 0; i < this.props.channel.member.length; i++) {
      if (this.props.channel.member[i].chat_id === id) return this.props.channel.member[i];
    }
  }
  subscribeSocket(props) {
    this.token = PubSub.subscribe(`chat`, (msg, data) => {
      console.log('chat', data.broadcast.channel_id, this.props.channel_id, data)
      if (data.broadcast.channel_id !== this.props.channel_id) return;
      switch (data.event) {
        case 'posted':
          let item = JSON.parse(data.data.post);
          if (item.user_id !== props.user.id_chat) {
            this.addNewMessage(item);
          }
          break;
        case 'typing':
          let newUser = true;

          for (let i = 0; i < this.typingUsers.length; i++) {
            if (this.typingUsers[i].chat_id === data.data.user_id) {
              newUser = false;
              this.typingUsers[i].time = new Date().getTime();
            }
          }
          let userInfo = this.getGapoUserFromIdChat(data.data.user_id);
          if (!userInfo) return;
          if (newUser) {
            this.typingUsers.push({
              user_id: userInfo.id,
              chat_id: data.data.user_id,
              display_name: userInfo.display_name,
              time: new Date().getTime()
            });
            let typings = this.typingUsers[0].display_name;
            for (let i = 1; i < this.typingUsers.length; i++) {
              typings = ',' + this.typingUsers[i].display_name
            }
            typings += ' đang soạn tin...';
            this.setState({ typings });
          }
          break;
        default:
          break;
      }
    });
  }
  onRemoveImageClick(index) {
    let mediaData = _.cloneDeep(this.state.mediaData);
    mediaData.splice(index, 1);
    this.setState({ mediaData });
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
    this.setState({ mediaData });
    let formData = new FormData();
    formData.append('channel_id', this.props.channel_id);
    switch (type) {
      case 'image':
        try {
          formData.append('files', file);
          let rs = await services.chatRequest.upload('/api/v4/files', formData, newmediaData.cancelToken, p => {
            let mediaData = _.cloneDeep(this.state.mediaData);
            if (!mediaData[index] || mediaData[index]._id !== newmediaData._id) return;
            mediaData[index].progress = Math.round((p.loaded / p.total) * 100);
            this.setState({ mediaData });
          });
          mediaData = _.cloneDeep(this.state.mediaData);
          mediaData[index].loading = false;
          this.setState({ mediaData, files: [rs.file_infos[0]], file_ids: [rs.file_infos[0].id] });
        } catch (err) {
          console.log('err', err);
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
          services.helper.alert('Video trong bài viết đang được xử lý. Chúng tôi sẽ gửi cho bạn thông báo khi hoàn tất và bài viết của bạn sẵn sàng để xem');
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
  canUploadNewVideo() {
    return true;
  }
  async onImageDrop(acceptedFiles) {
    if (!this.canUploadNewVideo(acceptedFiles)) {
      return services.helper.alert('Mỗi bài đăng chỉ được phép đăng tối đa 1 video');
    }
    let mediaData = _.cloneDeep(this.state.mediaData);
    if (acceptedFiles.length > 20) return services.helper.alert('Không thể up quá 20 ảnh!');
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
  unsubscribeSocket() {
    PubSub.unsubscribe(this.token);
  }
  componentDidMount() {
    this.init(this.props);
    setInterval(() => {
      this.checkIntervalTyping();
    }, 100);
  }
  componentWillUnmount() {
    this.unsubscribeSocket();
  }
  componentWillReceiveProps(next) {
    if (!next.channel_id) return;
    this.init(next);
    this.unsubscribeSocket();
  }
  async init(props) {
    if (!props.channel_id) return;
    this.setState({ data: [], hasMore: false });
    this.subscribeSocket(props);
    let rs = await services.data.chat.getPostsInChannel(props.channel_id, 0, ITEM_PER_PAGE);
    let data = [];
    rs.order.map(o => {
      this.unshiftMessage(data, rs.posts[o]);
      return null;
    });
    this.loading = false;
    let hasMore = true;
    if (rs.order.length < ITEM_PER_PAGE) {
      hasMore = false;
    }
    await this.setState({ data, hasMore, message: '' });
    this.scrollToLast();
  }

  async loadMore() {
    if (this.loading || !this.props.channel_id || !this.state.hasMore) {
      return;
    }
    let el = this.getBoxElement();
    let startPos = el.scrollHeight;
    this.loading = true;
    let length = 0;
    if (this.state.data) {
      this.state.data.map(item => {
        length += item.length;
      })
    }
    let rs = await services.data.chat.getPostsInChannel(this.props.channel_id, Math.floor(length / ITEM_PER_PAGE), ITEM_PER_PAGE);
    let data = _.clone(this.state.data) || [];
    rs.order.map(o => {
      this.unshiftMessage(data, rs.posts[o]);
      return null;
    })
    let hasMore = true;
    if (rs.order.length < ITEM_PER_PAGE) {
      hasMore = false;
    }
    this.loading = false;
    await this.setState({ data, hasMore });
    let endPos = el.scrollHeight;
    this.scrollTo(endPos - startPos);
    // scrollToLast();
  }
  async onSendMessageClick() {
    if (!this.state.message.trim().length && !this.state.file_ids.length) return
    let rs = await services.data.chat.sendPostToChannel({
      channel_id: this.props.channel_id, message: this.state.message, file_ids: this.state.file_ids
    });
    this.addNewMessage(rs)
  }
  unshiftMessage(data, newItem) {
    let info = this.convertItemInfo(newItem);
    if (data.length === 0) {
      data.push([info]);
      return data;
    }

    if (data[0][0].user_id === info.user_id) {
      data[0].unshift(info);
    } else {
      data.unshift([info]);
    }
  }
  pushMessage(data, newItem) {
    let info = this.convertItemInfo(newItem);
    if (data.length === 0) {
      data.push([info]);
      return data;
    }

    if (data[data.length - 1][0].user_id === info.user_id) {
      data[data.length - 1].push(info);
    } else {
      data.push([info]);
    }
    return data;
  }
  async addNewMessage(item) {
    let data = _.cloneDeep(this.state.data);
    data = this.pushMessage(data, item);
    this.setState({ message: '', data, file_ids: [], mediaData: [] });
    if (this.props.setLastMessage) {
      this.props.setLastMessage(this.props.channel_id, item);
    }
    this.scrollToLast();
  }
  convertItemInfo(item) {
    let isMine = item.user_id === this.props.user.id_chat;
    let userInfo = {
      isMine,
      avatar: "https://avatarfiles.alphacoders.com/103/103092.jpg",
      display_name: "Beat mem name",
      id: this.props.user.id,
      username: null,
      message: item.message,
      user_id: item.user_id,
      metadata: item.metadata
    };
    if (!isMine) {
      for (let i = 0; i < this.props.channel.member.length; i++) {
        let m = this.props.channel.member[i];
        if (m.chat_id === item.user_id) {
          userInfo.avatar = m.avatar;
          userInfo.display_name = m.display_name;
          userInfo.id = m.id;
          userInfo._profileUrl = m._profileUrl;
        }
      }
    }
    return userInfo;
  }
  rendermediaData() {
    if (this.state.mediaData.length === 0) return null;
    return <div className="gapo-comment media align-items-center pt-0 chat-media">
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
  renderMeta(meta) {
    if (!meta.files) return;
    return meta.files.map((item, index) => <div className='chat-item-img'>
      <ChatImage file={item} key={index} />
    </div>)
  }
  renderMessages() {
    if (!this.state.data) return null;
    let content = [], tmp = [];
    this.state.data.map((item, index) => {
      tmp = [];
      if (item[0].isMine) {
        content.push(<div className="history__item history__item--right" key={index}>
          <div className="history__item--avatar media">
            <div className="history__item--content message__many media-body d-flex pl-1 pt-2 pb-2">
              <div className='w-100 mr-3'>
                <div className="ml-auto mr-3 message-list">
                  {item.map((msg, index) => <div key={index} className="message__details mb-1 message__details-right ml-auto" data-toggle="tooltip" data-placement="left" title={moment(item.create_at).format('H:mm A')}>
                    {/* <pre className='m-0'>{msg.message}</pre> */}
                    <ContentDisplay content={msg.message} />
                    {this.renderMeta(msg.metadata)}
                    <div className="history__action">
                      <button className="btn btn-transparent shadow-none">
                        <i className="gapo-icon icon-share-alt" />
                      </button>
                    </div>
                  </div>)}
                </div>
              </div>
            </div>
          </div>
        </div>)
      } else {
        content.push(<div className='history__item history__item--left' key={index}>
          <div className="history__item--avatar media">
            <Link to={item[0]._profileUrl} className="item__avatar" data-toggle="tooltip" data-placement="top" title="Bảo Anh">
              <span className="gapo-avatar gapo-avatar--30 mr-2" style={{ backgroundImage: `url(${item[0].avatar})` }}>
              </span>
            </Link>
            <div className="history__item--content media-body pl-1 pt-1 ml-5 message-list">
              {item.map((msg, index) => <div key={index} className="message__details message__details-left mb-1" data-toggle="tooltip" data-placement="left" title={moment(item.create_at).format('H:mm A')}>
                {/* <span>{msg.message}</span> */}
                {/* <pre>{msg.message}</pre> */}
                <ContentDisplay content={msg.message} />
                {this.renderMeta(msg.metadata)}
                <div className="history__action">
                  <button className="btn btn-transparent shadow-none">
                    <i className="gapo-icon icon-share-alt" />
                  </button>
                </div>
              </div>)}

            </div>
          </div>

        </div>)
      }
    });
    return content;
  }
  getBoxElement() {
    if (this.scrollRef) return this.scrollRef;
    return {};
  }
  scrollToLast() {
    if (this.scrollRef) {
      this.scrollRef.scrollTop = 10000000;
    }
  }
  scrollTo(pos) {
    if (this.scrollRef) {
      this.scrollRef.scrollTop = pos;
    }
  }
  render() {
    return <React.Fragment>
      <div id={BOX_ID} className="w-100 message-history border-bottom pb-4">
        <PerfectScrollbar containerRef={ref => {
          this.scrollRef = ref;
        }}>
          <InfiniteScroll
            initialLoad={false}
            isReverse
            useWindow={false}
            threshold={100}
            pageStart={0}
            loadMore={this.loadMore.bind(this)}
            hasMore={this.state.hasMore}
            loader={<Loading full key={0} type='friend' />}
          >
            {this.renderMessages()}
          </InfiniteScroll>
        </PerfectScrollbar>

      </div>
      <div className="w-100 ">
        <div className="message-form">
          {this.state.typings.length > 0 ? <p className='typing-message'>{this.state.typings}</p> : null}
          <div className="media-body">
            {this.rendermediaData()}
            <div className="message-form--editor d-flex align-items-end pr-2 pt-3">


              <textarea value={this.state.message} className="form-control border-0 shadow-none bg-transparent" placeholder="Nhập tin nhắn…"
                onChange={evt => {
                  chatSocket.setTyping(this.props.channel_id);
                  this.setState({ message: evt.target.value });
                }}
                onKeyDown={evt => {

                  if (evt.keyCode === 13) {
                    evt.preventDefault();
                    if (evt.altKey) {
                      let message = this.state.message;
                      message += '\n';
                      this.setState({ message });
                    } else {
                      this.onSendMessageClick();
                    }

                  }
                }}
              />
              <Dropzone onDrop={this.onImageDrop.bind(this)} accept='image/*, video/*'>
                {({ getRootProps, getInputProps }) => (

                  <button className="btn btn-transparent message__action shadow-none" {...getRootProps()}>
                    <input {...getInputProps()} />
                    <i className="gapo-icon icon-picture-landscape" />
                  </button>
                )}
              </Dropzone>

              {/* <button className="btn btn-transparent message__action shadow-none">
                <i className="gapo-icon icon-attachment-alt" />
              </button> */}
              {/* <button className="btn btn-transparent message__action shadow-none">
                <i className="gapo-icon icon-emotion-alt" />
              </button> */}
              <Dropdown direction="up" isOpen={this.state.showEmoji} toggle={() => { this.setState({ showEmoji: !this.state.showEmoji }) }}>
                <DropdownToggle className='btn btn-transparent message__action shadow-none' style={{ backgroundColor: 'transparent', border: 'unset', color: 'unset', padding: 2, marginBottom: 3.5, color: 'gray', marginRight: 3 }}  >
                  <i style={{ fontSize: 26 }} className="gapo-icon icon-emotion-alt" />
                </DropdownToggle>
                <DropdownMenu >
                  <Picker
                    onSelect={(emoji) => {
                      this.setState({ showEmoji: false, message: this.state.message + emoji.native })
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
              <button className="btn btn-transparent message__submit shadow-none" onClick={() => {
                this.onSendMessageClick();
              }}>
                Gửi
                </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps)(Conversation);
