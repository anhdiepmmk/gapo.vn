import React from 'react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import services from '../../services';
import _ from 'lodash';
export default class Comment extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            replyInfo: null,
            loadedItemCount: this.calculateLoadedItemCount(props.comments)
        }
    }
    componentWillReceiveProps(next) {
        let loadedItemCount = this.props.post.counts.comment_count < 20 ? this.calculateLoadedItemCount(next.comments) : 20;
        this.setState({ loadedItemCount });
    }
    commentFormRef = null;
    focusComment() {
        this.setState({ replyInfo: null })
        if (this.commentFormRef) this.commentFormRef.focusComment();
    }
    onReplyClick(comment) {
        comment.page = this.props.page;
        this.setState({ replyInfo: comment });
        if (this.commentFormRef) this.commentFormRef.focusComment();
    }
    onReactComment(id) {
        let comments = _.cloneDeep(this.props.comments);
        for (var i = 0; i < comments.length; i++) {
            if (comments[i].id === id) {
                comments[i].react_status = !comments[i].react_status;
                if (comments[i].react_status)
                    comments[i].counts.react_count++;
                else if (comments[i].counts.react_count > 0) {
                    comments[i].counts.react_count--;
                    if (comments[i].counts.react_count < 0) comments[i].counts.react_count = 0
                }

            }
        }
        this.onChange({ comments })
    }
    onReactReply(id, parent) {
        let comments = _.cloneDeep(this.props.comments);
        for (var cmt of comments) {
            if (cmt.id === parent) {
                for (var rep of cmt.reply) {
                    if (rep.id === id) {
                        rep.react_status = !rep.react_status;
                        if (rep.react_status)
                            rep.counts.react_count++;
                        else if (rep.counts.react_count > 0)
                            rep.counts.react_count--;
                    }
                }
            }
        }
        this.onChange({ comments })
    }
    onChange(opts) {
        if (this.props.onCommentUpdated) this.props.onCommentUpdated(opts);
    }
    onDelete(item, parent) {
        let comments = _.cloneDeep(this.props.comments);
        if (!parent) {
            let index = 0;
            for (var i = 0; i < comments.length; i++) {
                if (comments[i].id === item.id) {
                    index = i;
                    break;
                }
            }
            comments.splice(index, 1);
        } else {
            for (var i = 0; i < comments.length; i++) {
                if (comments[i].id === parent.id) {
                    let index = 0;
                    for (var j = 0; j < comments[i].reply.length; j++) {
                        if (comments[i].reply[j].id === item.id) {
                            index = j;
                            break;
                        }
                    }
                    comments[i].counts.reply_count--;
                    comments[i].reply.splice(j, 1);
                }
            }
        }
        this.onChange({ comments, type: 'delete' });
    }
    onNewComment(comment) {
        let comments = _.cloneDeep(this.props.comments);
        comments.push(comment);
        this.onChange({ comments, type: 'create' });
    }
    onNewReply(id, reply) {
        let comments = _.cloneDeep(this.props.comments);
        for (let i = 0; i < comments.length; i++) {
            if (comments[i].id === id) {
                if (!comments[i].reply) comments[i].reply = [];
                comments[i].reply.push(reply);
                comments[i].counts.reply_count++;
            }
        }
        this.setState({ replyInfo: null });
        this.onChange({ comments, type: 'create' });
    }
    calculateLoadedItemCount(comments) {
        let count = 0;
        comments.map(cmt => {
            count += cmt.counts.reply_count + 1;
            return null;
        });
        return count;
    }
    async loadMoreReply(index) {
        let comments = _.cloneDeep(this.props.comments);
        let currentComment = comments[index];
        let from_id = null;
        if (currentComment.reply && currentComment.reply.length > 0) {
            from_id = currentComment.reply[currentComment.reply.length - 1].id;
        }
        let rs = await services.data.getComment({
            post_id: this.props.post_id,
            from_id,
            parent_id: currentComment.id,
            limit: 10
        });
        if (!currentComment.reply) currentComment.reply = [];
        currentComment.reply = currentComment.reply.concat(rs);
        this.onChange({ comments });
    }

    async loadMoreComments() {
        let comments = _.cloneDeep(this.props.comments);
        if (comments.length <= 2) comments = []
        let from_id = comments[comments.length - 1] ? comments[comments.length - 1].id : null;
        let rs = await services.data.getComment({
            post_id: this.props.post_id,
            from_id,
            limit: 20
        });
        comments = comments.concat(rs);
        this.onChange({ comments });

    }
    onUpdateComment(newItem) {
        let item = _.cloneDeep(this.state.editData.item);
        Object.assign(item, newItem);
        let comments = _.cloneDeep(this.props.comments);
        if (this.state.editData.parent) { //edit reply
            for (let i = 0; i < comments.length; i++) {
                if (comments[i].id === this.state.editData.parent.id) {
                    for (var j = 0; j < comments[i].reply.length; j++) {
                        if (comments[i].reply[j].id === item.id) {
                            comments[i].reply[j] = item;
                        }
                    }
                }
            }
        } else { //edit comment
            for (let i = 0; i < comments.length; i++) {
                if (comments[i].id === item.id) {
                    comments[i] = item;
                }
            }
        }
        this.setState({ editData: null });
        this.onChange({ comments });
    }
    renderListComments() {
        if (this.props.post.counts.comment_count === 0) return <div className='mt-2'></div>;
        let commentCount = null, remainCommentCount = this.props.post.counts.comment_count - this.state.loadedItemCount
        if (this.props.post.counts.comment_count > 0) {
            commentCount = <div className="d-flex align-items-center px-3 py-2 mt-1">
                {remainCommentCount > 0 ? <a className="text-primary" onClick={this.loadMoreComments.bind(this)}>Xem thêm {remainCommentCount < 20 ? remainCommentCount : null} bình luận</a> : null}
                {remainCommentCount > 0 ? <div className="ml-auto text-dark">{`${this.state.loadedItemCount}/${this.props.post.counts.comment_count.toLocaleString()}`}</div> : null}
            </div>
        }
        return <div className="post-item__comments">
            {commentCount}
            {this.props.comments && this.props.comments.length > 0 ?
                <div className="comments__list">
                    {this.props.comments.sort((a, b) => a.update_time - b.update_time).map((comment, index) =>
                        <CommentItem
                            page={this.props.page}
                            post={this.props.post}
                            myPage={this.props.myPage}
                            userID={this.props.userID}
                            onEdit={(item, parent) => {
                                this.setState({
                                    editData: {
                                        item, parent
                                    }
                                })
                            }}
                            onDelete={(item, parent) => {
                                this.onDelete(item, parent);
                            }}
                            loadMoreReply={() => {
                                this.loadMoreReply(index);
                            }}
                            key={index}
                            comment={comment}
                            onReactComment={this.onReactComment.bind(this)}
                            onReactReply={this.onReactReply.bind(this)}
                            onReplyClick={() => {
                                this.onReplyClick(comment);
                            }} />)}
                </div> :
                null}
        </div>
    }
    render() {
        return <React.Fragment>
            {this.renderListComments()}
            <CommentForm
                onUpdateComment={this.onUpdateComment.bind(this)}
                editData={this.state.editData}
                replyInfo={this.state.replyInfo}
                onNewComment={this.onNewComment.bind(this)}
                onNewReply={(id, reply) => {
                    this.onNewReply(id, reply);
                }}

                post_id={this.props.post_id}
                ref={ref => {
                    this.commentFormRef = ref
                }} />
        </React.Fragment>
    }
}