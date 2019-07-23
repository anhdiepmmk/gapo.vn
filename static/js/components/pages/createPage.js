import React from 'react';
import SearchHeader from '../SearchHeader'
import Feed from '../feed/Feed';
import SideBarPage from './SidebarPage'
import _ from 'lodash';
import services from '../../services';
import helper from '../../services/helper';
import Textarea from 'react-textarea-autosize';
import amplitude from 'amplitude-js';

export default class CreatePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showForm: false,
            title: '',
            decription: '',
            pageType: [],
            pageTypeSelect: null,
            showErr: false
        }
    }

    componentDidMount() {
        this.getPageType()
    }

    async getPageType() {
        try {
            let pageType = await services.data.getPageType()
            this.setState({ pageType })
        } catch (error) {
            console.log(error.message)
        }
    }

    async handleInput(evt) {
        let { name, value } = evt.target;
        let form = _.clone(this.state);
        form[name] = value;
        if (name == 'title' && value.length > 30) {
            return this.setState({ showErr: true })
        }
        this.setState({
            [name]: form[name],
            showErr: false
        });
    }

    async createPage() {
        if (!this.state.title) return helper.alert('Vui lòng nhập tên trang')
        if (!this.state.title) return helper.alert('Vui lòng nhập mô tả trang')
        if (!this.state.pageTypeSelect) return helper.alert('Vui lòng chọn hạng mục')
        let result = await services.data.createPage(this.state.title, this.state.decription, this.state.pageTypeSelect);
        amplitude.getInstance().logEvent('Create Page');
        this.props.history.push(`/pagepreview/${result.page.id}`)
    }


    renderFormCreate() {
        return (
            <div className="gapo-box p-4">
                <form action="#" className="px-3 pt-3">
                    <div className="form-group">
                        <label htmlFor className="font-weight-semi-bold">Tên trang  </label>

                        <input
                            value={this.state.title}
                            onChange={this.handleInput.bind(this)}
                            name="title" type="text"
                            className={`form-control ${this.state.showErr ? 'is-invalid' : ''} `}
                            placeholder="Nhập tên trang" />
                        <div className='invalid-feedback'>Tên trang không được dài quá 30 ký tự</div>
                    </div>



                    <div className="form-group">
                        <label htmlFor className="font-weight-semi-bold">Mô tả về trang</label>
                        <Textarea
                            onChange={this.handleInput.bind(this)}
                            name="decription"
                            type="text"
                            className="form-control"
                            placeholder="Nhập mô tả trang"
                            maxRows={10}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor className="font-weight-semi-bold">Hạng mục</label>
                        <select onChange={(val) => {
                            this.setState({ pageTypeSelect: val.target.value })
                        }} className="custom-select">
                            <option value disabled selected>- Chọn hạng mục -</option>
                            {this.state.pageType.map((item, index) => {
                                return <option value={item.id} >{item.title}</option>
                            })}
                        </select>
                    </div>
                </form>
                <div className="text-center">
                    <button onClick={() => {
                        this.createPage()
                    }} className="btn btn-primary btn-lg mt-2 mb-4">Tạo trang</button>
                </div>
            </div>
        )
    }

    renderIntroCreate() {
        return (
            <div className="gapo-box text-center pt-4 pb-5">
                <div className="pt-2 pb-4">
                    <img src="assets/images/create-page-banner.svg" alt />
                </div>
                <div className="gapo-title pb-2 pt-3">Tạo trang mới của bạn</div>
                <div className="text-secondary">Kết nối doanh nghiệp, bản thân hoặc mục đích xã hội của bạn <br /> với cộng đồng người dùng
                  Gapo.
                           </div>
                <button onClick={() => {
                    this.setState({
                        showForm: true
                    })
                }} className="btn btn-primary btn-lg mt-4 mb-2">Bắt đầu</button>
            </div>
        )
    }

    render() {
        return (
            <React.Fragment>
                <SearchHeader />

                <div className="row justify-content-center">
                    <div className="col create-page">
                        {this.state.showForm ? this.renderFormCreate() : this.renderIntroCreate()}
                    </div>
                </div>
            </React.Fragment>

        )
    }
}