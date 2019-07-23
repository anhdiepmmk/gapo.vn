import React from 'react';
import { Link } from 'react-router-dom';
import helper from './../../services/helper';
import services from './../../services';
import config from './../../services/config';
import ImageViewer from './../../shared/ImageView';
import { connect } from 'react-redux';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { Comments } from 'react-facebook';
import LinkPreview from './../../shared/LinkPreview';
import ContentDisplay from './../../shared/ContentDisplay';
import amplitude from 'amplitude-js';

class CommentItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showMore: false,
            showMoreInReply: 0,
            showAllComment: false,
            commentShow: {}
        }
    }
    toggleMore() {
        this.setState({ showMore: !this.state.showMore });
    }
    toggleMoreInReply(id) {
        if (this.state.showMoreInReply === id) {
            this.setState({ showMoreInReply: 0 });
        } else {
            this.setState({ showMoreInReply: id });
        }
    }
    reactComment() {
        if (!services.helper.checkLogged()) {
            return services.helper.loginRequired();
        }
        if (this.props.onReactComment) {
            this.props.onReactComment(this.props.comment.id);
        }
        services.data.reactComment(this.props.comment.id);
    }
    reactReply(id) {
        if (!services.helper.checkLogged()) {
            return services.helper.loginRequired();
        }
        if (this.props.onReactReply) {
            this.props.onReactReply(id, this.props.comment.id);
        }
        services.data.reactComment(id);
    }
    onReplyClick() {
        amplitude.getInstance().logEvent('Reply Action')
        if (!services.helper.checkLogged()) {
            return services.helper.loginRequired();
        }
        if (!(this.props.comment.reply && this.props.comment.reply.length > 0) && this.props.comment.counts.reply_count > 0) {
            this.props.loadMoreReply();
        }
        if (this.props.onReplyClick) this.props.onReplyClick();
    }
    renderReplies() {
        let comment = this.props.comment;
        if (comment.counts.reply_count === 0) return null;
        let loadMorePanel = null;
        if (!comment.reply) comment.reply = [];
        if (comment.reply.length < comment.counts.reply_count) {
            loadMorePanel = <a className="text-primary d-flex align-items-center" href='#/' onClick={evt => {
                evt.preventDefault();
                this.props.loadMoreReply();
            }}>
                <i className="gapo-icon icon-reply mr-2" />
                Xem {comment.counts.reply_count - comment.reply.length} bình luận trước
              </a>
        }
        return <div className="comment__replies mt-2">
            {loadMorePanel}
            {comment.reply.map((item, index) => <div className="comment__item comment__item--parent media" key={index}>
                <Link to={this.props.page ? `/pagepreview/${this.props.page.id}` : `${item._profileUrl}`} className="gapo-avatar gapo-avatar--32 mr-2" style={{
                    backgroundImage: `url(${this.props.page && this.props.userID == item.user.id
                        ? this.props.page.avatar && this.props.page.avatar != 'undefined' ?
                            this.props.page.avatar :
                            config.defaultPageAvatar :
                        item.user.avatar})`
                }}>
                </Link>
                <div className="media-body">
                    <div className="comment__body">
                        <div className="d-inline-block comment__info mb-1">
                            <Link to={this.props.page ? `/pagepreview/${this.props.page.id}` : item.user._profileUrl} className="comment__author font-weight-bold d-inline-block">{this.props.page && this.props.userID == item.user.id ? this.props.page.title : item.user.display_name}&nbsp;
                            {!this.props.page && item.user.status_verify == 1 || (this.props.page && this.props.page.status_verify == 1) ? <img src='/assets/images/svg-icons/checkmark.svg' style={{ width: 15, height: 15, marginLeft: 1, marginBottom: 3, marginRight: 5 }} /> : null}
                            </Link>
                            {this.renderCommentContent(item)}
                        </div>
                        {item.mediaData && item.mediaData.length > 0 ? <div className='row'>
                            {item.mediaData.map((img, index) => <div className='col-3' key={index}><ImageViewer images={[img.src]} /></div>)}
                        </div> : null}
                        <div className="d-flex align-items-center font-size-small">
                            <div className="comment__actions">
                                <a
                                    href='javascript:void(0)'
                                    className={`font-weight-semi-bold ${item.react_status ? 'text-active' : 'text-dark '}`}
                                    onClick={() => { this.reactReply(item.id) }}>{item.counts.react_count > 0 ? `Thích(${item.counts.react_count})` : 'Thích'}</a>
                                <span className="text-dark">{helper.getDuration(item.create_time)}</span>
                            </div>
                            {this.props.user.id === item.user.id ? <Dropdown isOpen={this.state.showMoreInReply === item.id} toggle={evt => {
                                this.toggleMoreInReply(item.id);
                            }} className='post-item__more mt-0 ml-auto'>
                                <DropdownToggle className='hidden' size='sm' color='link'>
                                    <i className="gapo-icon icon-more-option float-left" data-toggle="tooltip" data-title="Chỉnh sửa hoặc xoá bình luận" />
                                </DropdownToggle>
                                <DropdownMenu right>
                                    <DropdownItem key={0} onClick={() => { this.handleCommentAction(item, comment, 'edit') }}>Chỉnh sửa</DropdownItem>
                                    <DropdownItem key={1} onClick={() => { this.handleCommentAction(item, comment, 'delete') }}>Xóa</DropdownItem>
                                </DropdownMenu>
                            </Dropdown> : null}
                        </div>
                    </div>
                </div>
            </div>)}
        </div>;
    }
    onDelete(item, parent) {
        if (this.props.onDelete) {
            this.props.onDelete(item, parent);
        }
    }
    handleCommentAction(item, parent, action) {
        switch (action) {
            case 'edit':
                if (this.props.onEdit) {
                    this.props.onEdit(item, parent);
                }
                break;
            case 'delete':
                services.data.deleteComment(item.id);
                this.onDelete(item, parent);
                break;
        }
    }
    showAllComment = () => {
        this.setState({ showAllComment: true })
    }
    replaceLink(content) {
        var exp_match = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        var element_content = content.replace(exp_match, "<a class='post-item__hashtag' href='$1'>$1</a>")
        return element_content;
    }
    renderCommentContent(comment) {
        return <ContentDisplay content={comment.content} />
    }
    render() {
        let comment = this.props.comment;
        let post = this.props.post;
        let creator = comment.user;
        if (this.props.page) {
            if (this.props.userID === comment.user.id) {
                creator = {
                    avatar: this.props.page.avatar,
                    display_name: this.props.page.title
                }
            }
        }
        return <div className="comment__item comment__item--parent media">
            <Link to={this.props.page && this.props.user.id == comment.user.id ? `/pagepreview/${this.props.page.id}` : comment.user._profileUrl} className="gapo-avatar gapo-avatar--32 mr-2" style={{
                backgroundImage: `url(${creator.avatar})`
            }}>
            </Link>
            <div className="media-body">
                <div className="comment__body">
                    <div className="d-inline-block comment__info mb-1">
                        <Link to={this.props.page && this.props.user.id == comment.user.id ? `/pagepreview/${this.props.page.id}` : comment.user._profileUrl} className="comment__author font-weight-bold d-inline-block">{this.props.page && this.props.userID == comment.user.id ? this.props.page.title : comment.user.display_name}&nbsp;
                        {(!this.props.page && comment.user.status_verify == 1) || (this.props.page && this.props.page.status_verify == 1) ? <img src='/assets/images/svg-icons/checkmark.svg' style={{ width: 15, height: 15, marginLeft: 1, marginBottom: 3, marginRight: 5 }} /> : null}
                        </Link>
                        {this.renderCommentContent(comment)}
                    </div>
                    {comment.mediaData && comment.mediaData.length > 0 ? <div className='row'>
                        {comment.mediaData.map((item, index) => <div className='col-3' key={index}><ImageViewer images={[item.src]} /></div>)}
                    </div> : null}
                    <div className="d-flex align-items-center font-size-small">
                        <div className="comment__actions">
                            <a
                                className={`font-weight-semi-bold ${comment.react_status ? 'text-active' : 'text-dark '}`}
                                onClick={this.reactComment.bind(this)}>{comment.counts.react_count > 0 ? `Thích(${comment.counts.react_count})` : 'Thích'} </a>
                            <a className="text-dark font-weight-semi-bold" onClick={this.onReplyClick.bind(this)}>Trả lời</a>
                            <span className="text-dark">{helper.getDuration(comment.create_time)}</span>
                        </div>
                        {this.props.user.id === post.user.id || this.props.user.id === comment.user.id || this.props.myPage ? <Dropdown isOpen={this.state.showMore} toggle={this.toggleMore.bind(this)} className='post-item__more mt-0 ml-auto'>
                            <DropdownToggle className='hidden' size='sm' color='link'>
                                <i className="gapo-icon icon-more-option float-left" data-toggle="tooltip" data-title="Chỉnh sửa hoặc xoá bình luận" />
                            </DropdownToggle>
                            <DropdownMenu right>
                                {this.props.user.id === comment.user.id ? <DropdownItem key={0} onClick={() => { this.handleCommentAction(comment, null, 'edit') }}>Chỉnh sửa</DropdownItem> : null}
                                <DropdownItem key={1} onClick={() => { this.handleCommentAction(comment, null, 'delete') }}>Xóa</DropdownItem>
                            </DropdownMenu>
                        </Dropdown> : null}
                    </div>
                </div>
                {this.renderReplies()}
            </div>
        </div>
    }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null, { forwardRef: true })(CommentItem);