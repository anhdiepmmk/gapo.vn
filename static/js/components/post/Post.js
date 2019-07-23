import React from 'react';
import { Link } from 'react-router-dom';
import PostAttachment from './PostAttachment';
import Comment from './Comment';
import PostActions from './PostActions';
import helper from '../../services/helper';
import config from '../../services/config'
import { connect } from 'react-redux';
import PrevieMediaLink from '../../shared/PreviewMediaLink';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import services from '../../services';
import ContentDisplay from './../../shared/ContentDisplay';
import PerfectScrollbar from 'react-perfect-scrollbar';
class Post extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsePost: true,
            showComment: false,
            linkToPreview: '',
            jwt: services.helper.getJWTInfo()
        }
    }
    onBackClick() {
        window.history.back();
    }
    onChange(feed) {
        if (this.props.onChange) {
            this.props.onChange(feed);
        }
    }
    toggleMore() {
        if (!services.helper.checkActive()) {
            return services.helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        this.setState({ showMore: !this.state.showMore });
    }


    onCommentUpdated(rs) {
        let feed = Object.assign({}, this.props.feed);
        feed.comments = rs.comments;
        switch (rs.type) {
            case 'create':
                feed.counts.comment_count++;
                break;
            case 'delete':
                feed.counts.comment_count--;
                break;
        }
        this.onChange(feed);
    }
    onReact() {
        let feed = Object.assign({}, this.props.feed);
        if (feed.react_status) {
            feed.counts.react_count--;
            feed.react_status = false;
        } else {
            feed.counts.react_count++;
            feed.react_status = true;
        }
        this.onChange(feed);
    }

    async blockUserRelation() {
        try {
            await services.data.blockUserRelation(this.props.feed.user.id);
            services.helper.alert('Đã chặn người dùng này');
        } catch (error) {
            services.helper.alert(error.message);
        }

    }

    async reportPost() {
        try {
            await services.data.reportPost(this.props.feed.id);
            services.helper.alert('Đã báo cáo bài viết này');
        } catch (error) {
            services.helper.alert(error.message);
        }

    }

    handlePostAction(action) {
        switch (action) {
            case 'copyContent':
                return services.helper.copyToClipboard(this.props.feed.content);
            case 'copyLink':
                return services.helper.copyToClipboard(`${window.location.origin}/${this.props.feed.user.username || this.props.feed.user.id}/post/${this.props.feed.id}`);
            case 'reportPost': this.reportPost();
                break;
            case 'blockUser': this.blockUserRelation();
                break;
            case 'deletePost':
                helper.confirm('Bạn có chắc chắn muốn xóa bài viết?').then(async () => {
                    try {
                        await services.data.deletePost(this.props.feed.id);
                        if (this.props.onDelete) {
                            this.props.onDelete();
                        }
                    } catch (err) {
                        helper.alert('Không thể xóa bài viết');
                    }
                })
                break;
            case 'editPost':
                helper.editPost(this.props.feed).then(rs => {
                    if (rs) this.onChange(rs);
                })
                break;
            default:
                return services.helper.alert('Đang cập nhật API');
        }
    }
    replaceLink(content) {
        var exp_match = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        var element_content = content.replace(exp_match, "<a class='post-item__hashtag' href='$1'>$1</a>");
        var new_exp_match = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
        var new_content = element_content.replace(new_exp_match, '$1<a class="post-item__hashtag" target="_blank" href="http://$2">$2</a>');
        return element_content;
    }
    replaceContentTags(str) {
        if (!str) return str;
        str += ' ';
        //replace new line
        str = str.replace(/(?:\r\n|\r|\n)/g, '<br/>');
        //replace hyper link
        // str = str.replace(/((?:(?:https?|ftp):\/\/|\b(?:[a-z\d]+\.))(?:(?:[^\s()<>]+|\((?:[^\s()<>]+|(?:\([^\s()<>]+\)))?\))+(?:\((?:[^\s()<>]+|(?:\(?:[^\s()<>]+\)))?\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’])))?/g, '<a href="$1" class="post-item__hashtag">$1</a>')
        str = this.replaceLink(str);
        //replace tags
        str = str.replace(/(#.*?) |\n/g, '<a href="/" class="post-item__hashtag">$1</a> ');

        return str;
    }
    onShareClick(data) {
        if (!helper.checkLogged()) {
            return helper.loginRequired().then(rs => {
                if (rs === 'login') {
                    window.location.href = '/login';
                }
            })
        }
        if (!helper.checkActive()) {
            return helper.requestActive().then(rs => {
                if (rs === 'active') {
                    window.location.href = '/login/update-information'
                }
            })
        }
        helper.sharePost(data).then(rs => {
            console.log('on share new');
            if (this.props.onNewPost) {
                this.props.onNewPost(rs);
            }
        })
    }
    renderPreviewPost() {
        if (!this.props.feed.preview_post) return null;
        if (this.props.feed.preview_post.status !== 1) {
            return <div className='share-post-container'>
                {this.renderNotFound()}
            </div>
        }
        return <div className='share-post-container'>
            <Post feed={this.props.feed.preview_post} hideAction user={this.props.user} />
        </div>
    }
    renderNotFound() {
        return <div className='not-found-container'>
            <h3>Nội dung không hiển thị</h3>
            <p>Lỗi này thường do chủ sở hữu chỉ chia sẻ nội dung với một nhóm nhỏ, thay đổi người được xem hoặc đã xóa nội dung</p>
        </div>

    }

    render() {
        if (!this.props.feed.user) return this.renderNotFound();
        let postActions = [<DropdownItem onClick={() => { this.handlePostAction('copyContent') }} key={0}>
            {/* <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5 0.5H0.5V11.5H11.5V0.5Z" stroke="#1A1A1A" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.5 4.5H15.5V15.5H4.5V13.5" stroke="#1A1A1A" strokeLinecap="round" strokeLinejoin="round" />
            </svg> */}
            Copy chi tiết bài viết
            </DropdownItem>,
        <DropdownItem onClick={() => { this.handlePostAction('copyLink') }} key={2}>
            {/* <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.5 0.5H0.5V11.5H11.5V0.5Z" stroke="#1A1A1A" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13.5 4.5H15.5V15.5H4.5V13.5" stroke="#1A1A1A" strokeLinecap="round" strokeLinejoin="round" />
            </svg> */}
            Copy link bài viết
            </DropdownItem>];
        if (this.props.user.id) {
            if (this.props.feed.user.id !== this.props.user.id) {
                postActions.push(<DropdownItem onClick={() => { this.handlePostAction('reportPost') }} key={3}>
                    {/* <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.5 13C9.05228 13 9.5 12.5523 9.5 12C9.5 11.4477 9.05228 11 8.5 11C7.94772 11 7.5 11.4477 7.5 12C7.5 12.5523 7.94772 13 8.5 13Z" fill="#1A1A1A" />
                        <path d="M8.5 6V9.5" stroke="#1A1A1A" strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M1.5 14.5L8.5 1.5L15.5 14.5H1.5Z" stroke="#1A1A1A" strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                    </svg> */}
                    Báo cáo bài viết
                    </DropdownItem>);
                postActions.push(<DropdownItem onClick={() => { this.handlePostAction('blockUser') }} key={4}>
                    {/* <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 15.5C12.1421 15.5 15.5 12.1421 15.5 8C15.5 3.85786 12.1421 0.5 8 0.5C3.85786 0.5 0.5 3.85786 0.5 8C0.5 12.1421 3.85786 15.5 8 15.5Z" stroke="#1A1A1A" strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.69727 13.3033L13.3033 2.69727" stroke="#1A1A1A" strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    &nbsp; */}
                    Chặn người này</DropdownItem>);
            }
            if (this.props.feed.user.id === this.props.user.id || services.helper.isAdmin()) {
                postActions.push(<DropdownItem onClick={() => { this.handlePostAction('editPost') }} key={5}>

                    Sửa bài viết</DropdownItem>);
                postActions.push(<DropdownItem onClick={() => { this.handlePostAction('deletePost') }} key={6}>
                    {/* <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.5 2.5L2.5 13.5" stroke="white" strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2.5 2.5L13.5 13.5" stroke="white" strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                    </svg> */}
                    Xóa bài viết</DropdownItem>)
            }
        }
        let actor = { ...this.props.feed.user };
        actor.url = this.props.feed.user._profileUrl;
        if (this.props.feed.page) {
            actor.avatar = this.props.feed.page.avatar && this.props.feed.page.avatar != 'undefined' ? this.props.feed.page.avatar : config.defaultPageAvatar;
            actor.url = `/pagepreview/${this.props.feed.page.id}`
            actor.display_name = this.props.feed.page.title;
            actor.status_verify = this.props.feed.page.status_verify
        }
        ///*******HEAD**** */
        let privacyIcon = null;
        switch (this.props.feed.privacy) {
            case 1:
                privacyIcon = <i className="gapo-icon icon-globe-alt" data-toggle="tooltip" data-title="Công khai" />
                break;
            case 2:
                privacyIcon = <i className="gapo-icon icon-friends" data-toggle="tooltip" data-title="Bạn bè" />
                break;
            default:
                privacyIcon = <i className="gapo-icon icon-lock" data-toggle="tooltip" data-title="Chỉ mình tôi" />
                break;
        }
        let head = <div className="post-item__head" style={{ paddingLeft: this.props.hideAction ? '0' : null }}>
            <div className="post-item__info media align-items-center">
                {this.props.showBackButton ? <a href="javascript:void(0)" className="post-item__action mr-3" onClick={evt => {
                    evt.preventDefault();
                    this.onBackClick();
                }}>
                    <i className="gapo-icon icon-arrow-left"></i>
                </a> : null}
                <Link to={actor.url} className="post-item__avatar gapo-avatar gapo-avatar--40 mr-2" style={{ backgroundImage: `url(${actor.avatar})` }}>
                </Link>
                <div className="media-body">
                    <Link to={actor.url} className="post-item__author font-weight-bold mb-1">{actor.display_name}
                        {actor.status_verify == 1 ? <img src='/assets/images/svg-icons/checkmark.svg' style={{ width: 15, height: 15, marginLeft: 5, marginBottom: 3 }} /> : null}
                    </Link>
                    <div className="d-flex align-items-center font-size-small text-secondary">
                        <Link to={`/${actor.id}/post/${this.props.feed.id}`} className="text-secondary">{helper.getDuration(new Date(this.props.feed.create_time))}</Link>
                        <span className="px-1">·</span>
                        {privacyIcon}
                    </div>
                </div>
                {!this.props.hideAction
                    ? (
                        <div className="dropdown post-item__more">
                            <Dropdown isOpen={this.state.showMore} toggle={this.toggleMore.bind(this)}>
                                <DropdownToggle className='hidden' size='sm' color='link'>
                                    <i className="gapo-icon icon-more-option" />
                                </DropdownToggle>
                                <DropdownMenu right>
                                    {postActions}
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    )
                    : null
                }
            </div>
        </div>;

        ///*******HASH TAG */
        let hashtags = null;
        // if (this.props.feed.tags && this.props.feed.tags.length > 0) {
        //     hashtags = <div className="post-item__hashtag">
        //         {this.props.feed.tags.map((tag, index) => <Link to='/' key={index}>#{tag}</Link>)}
        //     </div>
        // }
        switch (this.props.layout) {
            case 'horizontal':
                return <React.Fragment>
                    <PostAttachment
                        resetActiveVideo={this.props.resetActiveVideo}
                        addVisible={this.props.addVisible}
                        removeVisible={this.props.removeVisible}
                        activeVideo={this.props.activeVideo}
                        itemIndex={this.props.itemIndex}
                        mediaData={this.props.feed.mediaData}
                        feed={this.props.feed}
                        post_id={this.props.feed.id}
                        display={this.props.display} />
                    <div className='full-height-scroll bg-white justify-content-center'>
                        <PerfectScrollbar>
                            <div className={`post-item  post-detail-content`}>
                                {head}
                                <div className="post-item__content" style={{ paddingLeft: this.props.hideAction ? '0' : null }}>
                                    {hashtags}
                                    <br />
                                    {/* {content} */}
                                    <ContentDisplay content={this.props.feed.content} />
                                    <PrevieMediaLink content={this.props.feed.preview_link} />
                                    {this.renderPreviewPost()}
                                </div>
                                {this.props.hideAction ? null : <React.Fragment>
                                    <PostActions
                                        onShareClick={() => {
                                            let post = this.props.feed.preview_post || this.props.feed;
                                            this.onShareClick(post)
                                        }}
                                        size={this.props.size}
                                        react_count={this.props.feed.counts.react_count}
                                        comment_count={this.props.feed.counts.comment_count}
                                        view_count={this.props.feed.counts.view_count}
                                        id={this.props.feed.id}
                                        react_status={this.props.feed.react_status}
                                        onReact={this.onReact.bind(this)}
                                        focusComment={() => {
                                            if (!this.state.showComment) {
                                                this.setState({ showComment: true })
                                            }
                                            if (this.commentRef) this.commentRef.focusComment();
                                        }}
                                    />
                                    {this.state.showComment || this.props.feed.comments.length > 0 ? <Comment
                                        onCommentUpdated={this.onCommentUpdated.bind(this)}
                                        comments={this.props.feed.comments}
                                        post={this.props.feed}
                                        page={this.props.feed.page}
                                        userID={this.props.feed.user.id}
                                        post_id={this.props.feed.id}
                                        ref={commentRef => {
                                            this.commentRef = commentRef;
                                        }} /> :
                                        null}
                                </React.Fragment>}
                            </div>
                        </PerfectScrollbar>

                    </div>
                </React.Fragment>
            case 'share-vertical':
                return (
                    <React.Fragment>
                        <PostAttachment
                            feed={this.props.feed}
                            resetActiveVideo={this.props.resetActiveVideo}
                            addVisible={this.props.addVisible}
                            removeVisible={this.props.removeVisible}
                            activeVideo={this.props.activeVideo}
                            itemIndex={this.props.itemIndex}
                            mediaData={this.props.feed.mediaData} post_id={this.props.feed.id} display={this.props.display} />
                        <div className="post-item__content borderline-left">
                            {head}
                            {hashtags}
                            <br />
                            {/* {content} */}
                            <ContentDisplay content={this.props.feed.content} />
                        </div>
                    </React.Fragment>
                )
            default:
                return <div className={`post-item ${this.props.size === 'big' ? 'post-item--big' : ''}`}>
                    {head}
                    <div className="post-item__content" style={{ paddingLeft: this.props.hideAction ? '0' : null }}>
                        {hashtags}
                        <br />
                        <ContentDisplay content={this.props.feed.content} />
                        <PrevieMediaLink content={this.props.feed.preview_link} />
                        {this.renderPreviewPost()}
                    </div>

                    <PostAttachment
                        feed={this.props.feed}
                        resetActiveVideo={this.props.resetActiveVideo}
                        addVisible={this.props.addVisible}
                        removeVisible={this.props.removeVisible}
                        activeVideo={this.props.activeVideo}
                        itemIndex={this.props.itemIndex}
                        mediaData={this.props.feed.mediaData} post_id={this.props.feed.id} display={this.props.display} />
                    {this.props.hideAction ? null : <React.Fragment>
                        <PostActions
                            onShareClick={() => {
                                let post = this.props.feed.preview_post || this.props.feed;
                                this.onShareClick(post)
                            }}
                            size={this.props.size}
                            react_count={this.props.feed.counts.react_count}
                            comment_count={this.props.feed.counts.comment_count}
                            view_count={this.props.feed.counts.view_count}
                            id={this.props.feed.id}
                            react_status={this.props.feed.react_status}
                            onReact={this.onReact.bind(this)}
                            focusComment={() => {
                                if (!this.state.showComment) {
                                    this.setState({ showComment: true })
                                }
                                if (this.commentRef) this.commentRef.focusComment();
                            }}
                        />
                        {this.state.showComment || this.props.feed.comments.length > 0 ? <Comment
                            userID={this.props.feed.user.id}
                            onCommentUpdated={this.onCommentUpdated.bind(this)}
                            myPage={this.props.myPage}
                            comments={this.props.feed.comments}
                            post={this.props.feed}
                            page={this.props.feed.page}
                            post_id={this.props.feed.id}
                            ref={commentRef => {
                                this.commentRef = commentRef;
                            }} /> :
                            null}
                    </React.Fragment>}

                </div>
        }

    }
}
const mapStateToProps = (state) => { return { user: state.user } }
export default connect(mapStateToProps, null, null)(Post);