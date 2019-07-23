import React from 'react';
import Loading from '../Loading';
import services from '../../services';
// import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import helper from '../../services/helper';
let info;
export default class PageEdit extends React.Component {
    constructor(props) {
        super(props)
        if (!props.pageInfo.info || props.pageInfo.info == "undefined") {
            info = {}
        } else {
            info = JSON.parse(props.pageInfo.info)
        }

        this.state = {
            title: props.pageInfo.title,
            type: '',
            website: info.website,
            address: info.address,
            phone: info.phone,
            description: props.pageInfo.description || props.pageInfo.description != 'undefined' ? props.pageInfo.description : ''
        }

    }
    componentDidMount() {

    }



    async updateDecription() {
        if (!this.state.description) return helper.alert('Vui lòng điền mô tả')
        await services.data.updatePage({ id: this.props.pageInfo.id, description: this.state.description })
        this.props.reloadData()
        helper.alert('Cập nhật thành công mô tả trang')
    }


    async updatePageName() {
        if (!this.state.title) return helper.alert('Vui lòng điền tên trang');
        try {
            await services.data.updatePage({ id: this.props.pageInfo.id, title: this.state.title })
            this.props.reloadData()
            helper.alert('Cập nhật thành công tên trang')
        } catch (err) {
            helper.alert(err.message)
        }

    }


    async updateWebsite() {
        if (!this.state.website) return helper.alert('Vui lòng điền tên website')
        info = { ...info, website: this.state.website }
        await services.data.updatePage({ id: this.props.pageInfo.id, info: { ...info, website: this.state.website } })
        this.props.reloadData()
        helper.alert('Cập nhật thành công website')
    }

    async updatePageaddress() {
        if (!this.state.address) return helper.alert('Vui lòng điền địa chỉ')
        info = { ...info, address: this.state.address }
        await services.data.updatePage({ id: this.props.pageInfo.id, info: { ...info, address: this.state.address } })
        this.props.reloadData()
        helper.alert('Cập nhật thành công địa chỉ')
    }

    async updatePhone() {
        if (!this.state.phone) return helper.alert('Vui lòng điền số điện thoại')
        info = { ...info, phone: this.state.phone }
        await services.data.updatePage({ id: this.props.pageInfo.id, info: { ...info, phone: this.state.phone } })
        this.props.reloadData()
        helper.alert('Cập nhật thành công số điện thoại')
    }



    render() {
        let { title, type, address, website, phone, description } = this.props.pageInfo
        if (this.state.loading) return <Loading full />;
        return (
            <div className="row justify-content-center">
                <div className="col col-900 py-4">
                    <div>
                        <h1 className="gapo-title mb-3 pt-2">Giới thiệu</h1>
                        <div className="rounded bg-white shadow mb-3 px-5 py-4 profile-about">
                            <div className="about-form__title font-weight-semi-bold py-3 d-flex align-items-center">

                                Thông tin chung
                                        </div>
                            <div className="form-group mb-0 row py-1">
                                <label htmlFor="staticEmail" className="col-4 col-form-label">
                                    Tên trang
                                </label>
                                <div className="col-8">

                                    {!this.props.isMe ? <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                        {title ? title : 'chưa cập nhật'}
                                    </span> : <>
                                            <input
                                                type="text"
                                                className={`form-control border-0 my-2 ${this.state.errNamePage ? 'is-invalid' : ''}`}
                                                id="staticEmail"
                                                value={this.state.title}
                                                onChange={(val) => {
                                                    if (val.target.value.length > 30) return this.setState({ errNamePage: true })
                                                    this.setState({
                                                        title: val.target.value,
                                                        errNamePage: false
                                                    })
                                                }}
                                                placeholder={'Nhập tên trang'}
                                            />
                                            <div className='invalid-feedback'>Tên trang không được dài quá 30 ký tự</div>

                                        </>}

                                    {this.props.isMe ? <div className="my-2">
                                        <a onClick={() => { this.updatePageName() }} className="btn btn-sm btn-primary">
                                            Lưu thay đổi
                                </a>
                                        <a style={{ marginLeft: 5 }} className="btn btn-sm btn-light">
                                            Huỷ
                                </a>
                                    </div> : null}
                                </div>
                            </div>

                            <div className="form-group mb-0 row py-1">
                                <label htmlFor="staticEmail" className="col-4 col-form-label">
                                    Mô tả trang
                                </label>
                                <div className="col-8">

                                    {!this.props.isMe ? <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                        {description ? description : 'chưa cập nhật'}
                                    </span> : <textarea
                                            type="text"
                                            style={{ backgroundColor: '#eeee' }}
                                            className="form-control border-0 my-2"
                                            id="staticEmail"
                                            value={this.state.description}
                                            onChange={(val) => {
                                                this.setState({
                                                    description: val.target.value
                                                })
                                            }}
                                            placeholder={'Nhập mô tả trang'}
                                        />}

                                    {this.props.isMe ? <div className="my-2">
                                        <a onClick={() => { this.updateDecription() }} className="btn btn-sm btn-primary">
                                            Lưu thay đổi
                                </a>
                                        <a style={{ marginLeft: 5 }} className="btn btn-sm btn-light">
                                            Huỷ
                                </a>
                                    </div> : null}
                                </div>
                            </div>

                            {/* <div className="form-group mb-0 row py-1 row__editable">
                                <label htmlFor="staticEmail" className="col-4 col-form-label">
                                    Hạng mục
                               </label>
                                <div className="col-8">
                                    <form >
                                        <div className="d-flex align-items-center">
                                            <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                                {this.state.type ? this.state.type : 'chưa cập nhật'}
                                            </span>
                                            {this.props.isMe ? <a
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => {
                                                    this.setState({
                                                        showMariDrops: !this.state.showMariDrops
                                                    })
                                                }}
                                                className="text-primary ml-auto d-flex align-items-center edit__action"
                                            >
                                                <i className="gapo-icon icon-pencil-alt mr-1" />Thêm hạng mục
                                       </a> : null}
                                            <Dropdown isOpen={this.state.showMariDrops} toggle={evt => {
                                                if (this.state.showMariDrops) {
                                                    this.setState({
                                                        showMariDrops: false
                                                    })
                                                }
                                            }}>
                                                <DropdownToggle className='hidden' size='sm' color='link'>
                                                </DropdownToggle>

                                                <DropdownMenu right>
                                                    <DropdownItem onClick={() => {

                                                    }} key={0}>Thể thao</DropdownItem>
                                                    <DropdownItem
                                                        onClick={() => {

                                                        }}
                                                        key={1}>Âm nhạc</DropdownItem>
                                                </DropdownMenu>
                                            </Dropdown>
                                        </div>
                                    </form>
                                </div>
                            </div> */}

                            <div className="about-form__title font-weight-semi-bold pb-3 pt-4 d-flex align-items-center">
                                Thông tin liên hệ
                         </div>
                            <div className="form-group mb-0 row py-1">
                                <label htmlFor="staticEmail" className="col-4 col-form-label">
                                    Số điện thoại
                                </label>
                                <div className="col-8">

                                    {!this.props.isMe ? <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                        {phone ? phone : 'chưa cập nhật'}
                                    </span> : <input
                                            type="text"
                                            className="form-control border-0 my-2"
                                            id="staticEmail"
                                            value={this.state.phone}
                                            onChange={(val) => {
                                                this.setState({
                                                    phone: val.target.value
                                                })
                                            }}
                                            placeholder={'Nhập số điện thoại'}
                                        />}

                                    {this.props.isMe ? <div className="my-2">
                                        <a onClick={() => { this.updatePhone() }} className="btn btn-sm btn-primary">
                                            Lưu thay đổi
                                </a>
                                        <a style={{ marginLeft: 5 }} className="btn btn-sm btn-light">
                                            Huỷ
                                </a>
                                    </div> : null}
                                </div>
                            </div>
                            <div className="form-group mb-0 row py-1">
                                <label htmlFor="staticEmail" className="col-4 col-form-label">
                                    Website
                                </label>
                                <div className="col-8">

                                    {!this.props.isMe ? <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                        {website ? website : 'chưa cập nhật'}
                                    </span> : <input
                                            type="text"
                                            className="form-control border-0 my-2"
                                            id="staticEmail"
                                            value={this.state.website}
                                            onChange={(val) => {
                                                this.setState({
                                                    website: val.target.value
                                                })
                                            }}
                                            placeholder={'Nhập website'}
                                        />}

                                    {this.props.isMe ? <div className="my-2">
                                        <a onClick={() => { this.updateWebsite() }} className="btn btn-sm btn-primary">
                                            Lưu thay đổi
                                </a>
                                        <a style={{ marginLeft: 5 }} className="btn btn-sm btn-light">
                                            Huỷ
                                </a>
                                    </div> : null}
                                </div>
                            </div>

                            <div className="form-group mb-0 row py-1">
                                <label htmlFor="staticEmail" className="col-4 col-form-label">
                                    Địa chỉ
                                </label>
                                <div className="col-8">

                                    {!this.props.isMe ? <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                        {address ? address : 'chưa cập nhật'}
                                    </span> : <input
                                            type="text"
                                            className="form-control border-0 my-2"
                                            id="staticEmail"
                                            value={this.state.address}
                                            onChange={(val) => {
                                                this.setState({
                                                    address: val.target.value
                                                })
                                            }}
                                            placeholder={'Nhập địa chỉ'}
                                        />}

                                    {this.props.isMe ? <div className="my-2">
                                        <a onClick={() => { this.updatePageaddress() }} className="btn btn-sm btn-primary">
                                            Lưu thay đổi
                                </a>
                                        <a style={{ marginLeft: 5 }} className="btn btn-sm btn-light">
                                            Huỷ
                                </a>
                                    </div> : null}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        )
    }
}