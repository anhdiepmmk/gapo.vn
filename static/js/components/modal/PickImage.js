import React, { PureComponent } from 'react';
import services from '../../services';
import Loading from '../Loading';
import InfiniteScroll from 'react-infinite-scroller';

const ITEM_PERPAGE = 10;
export default class PickImage extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            hasMore: true,
        }
    }
    componentDidMount() {
        // this.loadImages()
    }
    loading = false
    async loadMore() {
        if (this.loading) return
        this.loading = true;
        let from_id = null;
        let hasMore = true;
        if (this.state.data.length > 0) {
            from_id = this.state.data[this.state.data.length - 1].id;
        }
        let { id, page_id } = this.props;
        let input = {
            user_id: id,
            post_type: 2,
            from_id,
            limit: ITEM_PERPAGE,
            target: page_id ? `page:${page_id}` : ''
        }
        let rs = await services.data.getPost(input);
        if (rs.length < ITEM_PERPAGE) hasMore = false
        let data = [...this.state.data, ...rs];
        // this.setState({ data, loading: false });
        // let inputAblum = {
        //     user_id: id,
        //     post_type: 4,
        //     limit: 50,
        //     target: page_id ? `page:${page_id}` : ''
        // }
        // let dataAblum = await services.data.getPost(inputAblum);
        // let all = data.concat(dataAblum)
        this.loading = false;
        this.setState({ data, hasMore });


    }
    loading = false;
    render() {
        let { data } = this.state;
        let { id, page_id } = this.props;
        // let datanew = data.map(item => item.mediaData)
        // let flatData = [].concat(...datanew)
        return (
            <div style={{ display: 'block', opacity: 1 }} tabIndex={-1} role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true" >
                <div className="modal-dialog" style={{ maxWidth: '872px' }} role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <div className="modal-title gapo-title" id="exampleModalLabel">Chọn ảnh</div>
                            <button onClick={() => this.props.onClick()} type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <i className="gapo-icon icon-close icon-2x" />
                            </button>
                        </div>
                        <div className="modal-body modal-upload text-left pick-image-modal">
                            <div className="rounded bg-white p-3">
                                <InfiniteScroll
                                    threshold={100}
                                    pageStart={0}
                                    loadMore={() => { this.loadMore() }}
                                    hasMore={this.state.hasMore}
                                    loader={<Loading full key={0} />}
                                    useWindow={false}
                                >
                                    <div className="row">
                                        {data.map((item, index) => {
                                            return (
                                                <div onClick={() => this.props.onClick(item.mediaData[0].src)} key={'indexImage' + index} className="col-3 mt-3">
                                                    <div className="profile-photo-item">
                                                        <a className="gapo-thumbnail gapo-thumbnail--1x1" style={{ backgroundImage: `url(${item.mediaData[0].src})` }}>
                                                            <img className="w-100" />
                                                        </a>
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {!data.length && page_id && !this.state.hasMore ? <p>Trang của bạn chưa có ảnh nào !</p> : null}
                                        {!data.length && !page_id && !this.state.hasMore ? <p>Bạn chưa đăng tải ảnh nào !</p> : null}
                                    </div>
                                </InfiniteScroll>
                            </div>


                        </div>
                        <div className="modal-footer px-3 py-2">
                            <button onClick={() => this.props.onClick()} type="button" className="btn btn-secondary btn-sm" data-dismiss="modal">Hủy</button>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}