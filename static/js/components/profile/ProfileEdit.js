import React from 'react';
import Loading from '../Loading';
import services from '../../services';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import ReactModal from 'react-modal';
import amplitude from 'amplitude-js';

let optionDay = [];
let optionMon = [];
let optionYear = [];
export default class ProfileEdit extends React.Component {
    constructor(props) {
        super(props)
        let dateBirday = props.data.birthday;
        let day = 1;
        let mon = 1;
        let year = 1980;
        if (dateBirday) {
            let date = new Date(dateBirday)
            day = date.getDate()
            mon = date.getMonth() + 1
            year = date.getFullYear()
        }
        let { email = '', province = '', address = '', relationship = '', education = '', work = '' } = props.data.user_info ? props.data.user_info : '';
        this.state = {
            isMe: props.isMe,
            user_id: props.user_id,
            data: props.data,
            displayName: props.data.display_name,
            gender: props.data.gender,
            birday: null,
            phone: '',
            phoneReal: props.data.phone ? props.data.phone : 'chưa cập nhật',
            email,
            province,
            address,
            marriageState: relationship,
            education,
            work: work,
            showMariDrops: false,
            day,
            mon,
            year,
            otherInfo: props.data.user_info,
            showOtp: false,
            showPhoneInput: false,
            otp: '',
            errPhoneInput: false,
            errOTP: false
        }
        this.creatTimeDate()
    }

    creatTimeDate() {
        for (let i = 1; i <= 31; i++) {
            optionDay.push(i)
        }
        for (let i = 1; i <= 12; i++) {
            optionMon.push(i)
        }

        for (let i = 1980; i <= 2010; i++) {
            optionYear.push(i)
        }
    }

    componentDidMount() {

    }


    async updateGender() {
        if (this.state.gender == 0) return services.helper.alert('Vui lòng chọn giới tính')
        await services.data.updateUser({
            id: this.props.user_id,
            gender: this.state.gender
        })
        this.props.refreshData({ gender: this.state.gender })
        services.helper.alert('Cập nhật giới tính thành công');

    }

    async updateBirday() {
        let birthday = this.state.year + "-" + this.state.mon + "-" + this.state.day
        await services.data.updateUser({
            id: this.props.user_id,
            birthday
        })
        this.props.refreshData({ birthday })
        services.helper.alert('Cập nhật ngày sinh thành công')
    }

    async updateContact() {
        let user_info = {
            ...this.state.otherInfo,
            address: this.state.address,
            province: this.state.province,
            email: this.state.email
        }
        await services.data.updateUser({
            id: this.props.user_id,
            user_info
        })
        this.props.refreshData({ user_info })
        services.helper.alert('Cập nhật thành công');
        amplitude.getInstance().logEvent('Profile_Update Contact');

    }

    async updateMarriageState() {
        let user_info = {
            ...this.state.otherInfo,
            relationship: this.state.marriageState
        }
        await services.data.updateUser({
            id: this.props.user_id,
            user_info
        })
        this.props.refreshData({ user_info })
    }


    sendOtp = async () => {
        if (!this.state.phone) return this.setState({ errPhoneInput: true, errPhoneInputMes: 'Hãy nhập số điện thoại' })
        try {
            await services.data.phoneUpdate(this.state.phone)
            this.setState({ showPhoneInput: false, showOtp: true, errPhoneInput: false })
        } catch (error) {
            this.setState({ errPhoneInput: true, errPhoneInputMes: error.message })
        }
    }

    confirmOtp = async () => {
        if (!this.state.otp) return this.setState({ errOTP: true, errOTPMes: 'Vui lòng nhập OTP' })
        try {
            let result = await services.data.phoneUpdateVerify(this.state.phone, this.state.otp)
            this.setState({ showOtp: false, phoneReal: this.state.phone, errOTP: false, errOTPMes: '' }, () => { services.helper.alert('Cập nhật thành công số điện thoại') })
        } catch (err) {
            this.setState({ errOTP: true, errOTPMes: err.message })
        }

        // console.log({ result })


    }

    async updateRelationship() {
        let user_info = {
            ...this.state.otherInfo, education: this.state.education, work: this.state.work,
        }
        await services.data.updateUser({
            id: this.props.user_id,
            user_info
        })
        this.props.refreshData({ user_info })
        services.helper.alert('Cập nhật thành công');
        amplitude.getInstance().logEvent('Profile_Update Job');

    }

    async updateDisplayName() {
        if (!this.state.displayName) return services.helper.alert('Vui lòng nhập tên tài khoản')
        let rs = await services.data.updateUser({
            id: this.props.user_id,
            display_name: this.state.displayName
        })
        this.props.refreshData({ display_name: this.state.displayName })
        services.helper.alert('Cập nhật thành công');
        amplitude.getInstance().logEvent('Profile_Update Name');
    }


    renderOtp() {
        return <ReactModal
            closeTimeoutMS={200}
            key={0}
            isOpen={this.state.showOtp}
            onRequestClose={() => {
                this.setState({
                    showOtp: false
                })
            }}
            className="Modal">
            <main className="gapo-main" style={{ marginTop: '4.5rem' }}>
                <div className="container">
                    <div className="auth__box rounded mx-auto">
                        <h3 className="gapo-title mb-3">Nhập mã xác thực</h3>
                        <div className="font-size-large mb-4">Vui lòng nhập mã xác thực đã được gửi tới số điện thoại
                  <strong> {this.state.phone}</strong></div>

                        <div className="form-group">
                            <input name='otp'
                                onChange={(val) => { this.setState({ otp: val.target.value }) }}
                                type="text" className={`form-control form-control-lg text-center border-top-0 border-left-0 border-right-0 rounded-0 shadow-none ${this.state.errOTP ? 'is-invalid' : ''} `} placeholder="Nhập mã xác thực" />

                            {this.state.errOTP ? <div className="invalid-feedback">{this.state.errOTPMes}</div> : null}

                        </div>
                        <div className="font-weight-normal line-height">
                            Bạn chưa nhận được mã xác thực? <a href className="text-primary"
                            // onClick={this.onRegisterResendClick.bind(this)}
                            >Gửi lại</a>
                        </div>
                        <div className="text-center mt-4 pt-2">
                            <button onClick={this.confirmOtp} className="btn btn-primary btn-lg" >Hoàn thành</button>
                        </div>

                    </div>
                </div>
            </main>
        </ReactModal>
    }


    renderInputPhone() {
        return <ReactModal
            closeTimeoutMS={200}
            key={1}
            isOpen={this.state.showPhoneInput}
            onRequestClose={() => {
                this.setState({
                    showPhoneInput: false
                })
            }}
            className="Modal">
            <main className="gapo-main" style={{ marginTop: '4.5rem' }}>
                <div className="container">
                    <div className="auth__box rounded mx-auto">
                        <h3 className="gapo-title mb-3">Nhập số điện thoại</h3>
                        <div className="font-size-large mb-4">Vui lòng nhập số điện thoại mới của bạn
                  <strong> {this.props.phone}</strong></div>

                        <div className="form-group">
                            <input name='otp'
                                onChange={(val) => { this.setState({ phone: val.target.value }) }}
                                type="text" className={`form-control form-control-lg text-center border-top-0 border-left-0 border-right-0 rounded-0 shadow-none ${this.state.errPhoneInput ? 'is-invalid' : ''} `} placeholder="Nhập số điện thoại" />
                            {this.state.errPhoneInput ? <div className="invalid-feedback">{this.state.errPhoneInputMes}</div> : null}

                        </div>
                        <div className="text-center mt-4 pt-2">
                            <button onClick={this.sendOtp} className="btn btn-primary btn-lg" >Gửi</button>
                        </div>

                    </div>
                </div>
            </main>
        </ReactModal>
    }


    render() {
        let gender = 'không xác định'
        if (this.state.gender == 2) {
            gender = 'Nam'
        } if (this.state.gender == 1) {
            gender = 'Nữ'
        }
        if (this.state.loading) return <Loading full />;
        return (

            <div>
                {this.renderOtp()}
                {this.renderInputPhone()}

                <h1 className="gapo-title mb-3 pt-2">Giới thiệu</h1>
                <div className="rounded bg-white shadow mb-3 px-5 py-4 profile-about">
                    <div className="about-form__title font-weight-semi-bold py-3 d-flex align-items-center">
                        <i className="gapo-icon icon-user-circle mr-2" />
                        Thông tin cá nhân
                                        </div>
                    <div className="form-group mb-0 row py-1">
                        <label htmlFor="staticEmail" className="col-4 col-form-label">
                            Tên tài khoản
                                        </label>
                        <div className="col-8">

                            {!this.props.isMe ? <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                {this.state.displayName ? this.state.displayName : 'chưa cập nhật'}
                            </span> : <input
                                    type="text"
                                    className="form-control border-0 my-2"
                                    id="staticEmail"
                                    value={this.state.displayName}
                                    onChange={(val) => {
                                        this.setState({
                                            displayName: val.target.value
                                        })
                                    }}
                                    placeholder={'Nhập tên tài khoản'}
                                />}

                            {this.props.isMe ? <div className="my-2">
                                <a href onClick={() => { this.updateDisplayName() }} className="btn btn-sm btn-primary">
                                    Lưu thay đổi
                                </a>
                                <a style={{ marginLeft: 5 }} className="btn btn-sm btn-light">
                                    Huỷ
                                </a>
                            </div> : null}
                        </div>

                    </div>
                    <div className="form-group mb-0 row py-1 row__editable">
                        <label htmlFor="inputPassword" className="col-4 col-form-label">
                            Giới tính
                        </label>
                        <div className="col-8">
                            {this.props.isMe ? <form  >
                                <div className="d-flex align-items-center">
                                    <div className="custom-control custom-radio mr-4 py-2">
                                        <input
                                            type="radio"
                                            id="male"
                                            name="sex"
                                            className="custom-control-input"
                                            onClick={() => { this.setState({ gender: 2 }) }}
                                            defaultChecked={this.state.gender == 2}
                                        />
                                        <label className="custom-control-label" htmlFor="male">
                                            Nam
                                        </label>
                                    </div>
                                    <div className="custom-control custom-radio py-2">
                                        <input
                                            type="radio"
                                            id="female"
                                            name="sex"
                                            onClick={() => { this.setState({ gender: 1 }) }}
                                            className="custom-control-input"
                                            defaultChecked={this.state.gender == 1}
                                        />
                                        <label
                                            className="custom-control-label"
                                            htmlFor="female"
                                        >
                                            Nữ
                                        </label>
                                    </div>

                                    <span className="form-control-plaintext w-auto font-weight-semi-bold">

                                    </span>

                                </div>
                                <div className="my-2">
                                    <a onClick={() => { this.updateGender() }} className="btn btn-sm btn-primary">
                                        Lưu thay đổi
            </a>
                                    <a style={{ marginLeft: 5 }} className="btn btn-sm btn-light">
                                        Huỷ
            </a>
                                </div>
                            </form> : <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                    {gender}
                                </span>}
                        </div>
                    </div>
                    <div className="form-group mb-0 row mb-1 py-1 row__editable">
                        <label htmlFor="inputPassword" className="col-4 col-form-label">
                            Ngày sinh
                         </label>
                        <div className="col-8">
                            {this.props.isMe ? <form >
                                <div className="d-flex align-items-center">

                                    <span className="form-control-plaintext w-auto font-weight-semi-bold">

                                    </span>
                                    <select value={this.state.day} onChange={(data) => {
                                        this.setState({ day: data.target.value })
                                    }} className="custom-select w-auto my-2 mr-2">

                                        {optionDay.map((item, index) => {
                                            return <option key={index} value={item}>
                                                {item}
                                            </option>
                                        })}

                                    </select>
                                    <select
                                        onChange={(data) => {
                                            this.setState({ mon: data.target.value })
                                        }}
                                        value={this.state.mon}
                                        className="custom-select w-auto my-2  mr-2">

                                        {optionMon.map((item, index) => {
                                            return <option onClick={() => this.setState({ mon: item })} key={index} value={item}>
                                                {item}
                                            </option>
                                        })}

                                    </select>
                                    <select
                                        onChange={(data) => {
                                            this.setState({ year: data.target.value })
                                        }}
                                        value={this.state.year}
                                        className="custom-select w-auto my-2  mr-2">

                                        {optionYear.map((item, index) => {
                                            return <option onClick={() => this.setState({ year: item })} key={index} value={item}>
                                                {item}
                                            </option>
                                        })}
                                    </select>

                                </div>
                                <div className="my-2">
                                    <a onClick={() => { this.updateBirday() }} className="btn btn-sm btn-primary">
                                        Lưu thay đổi
            </a>
                                    <a style={{ marginLeft: 5 }} className="btn btn-sm btn-light">
                                        Huỷ
            </a>
                                </div>
                            </form> : <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                    {this.state.day + ' / ' + this.state.mon + ' / ' + this.state.year}
                                </span>}
                        </div>
                    </div>
                    <div className="about-form__title font-weight-semi-bold pb-3 pt-4 d-flex align-items-center">
                        {/* <i className="gapo-icon icon-alert-alt icon-2x mr-2" /> */}
                        <a className='svg-icon  mr-2' style={{ backgroundImage: `url(/assets/images/svg-icons/phone.svg)`, width: 21, height: 21 }}></a>
                        Thông tin liên hệ
    </div>
                    <div className="form-group mb-0 row py-1 row__editable">
                        <label htmlFor="staticEmail" className="col-4 col-form-label">
                            Số điện thoại
      </label>
                        <div className="col-8">
                            <form >
                                <div className="d-flex align-items-center">
                                    <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                        {this.state.phoneReal}
                                    </span>
                                    {this.props.isMe ? <a
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => {
                                            this.setState({ showPhoneInput: true })
                                        }}
                                        className="text-primary ml-auto d-flex align-items-center edit__action"
                                    >
                                        <i className="gapo-icon icon-pencil-alt mr-1" />Chỉnh
                                        sửa
                                       </a> : null}
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="form-group mb-0 row py-1">
                        <label htmlFor="staticEmail" className="col-4 col-form-label">
                            Email
                                         </label>
                        <div className="col-8">
                            <div className="d-flex align-items-center">
                                {this.props.isMe ? <input
                                    type="text"
                                    className="form-control border-0 my-1"
                                    id="staticEmail"
                                    value={this.state.email}
                                    onChange={(val) => { this.setState({ email: val.target.value }) }}
                                    placeholder="Nhập email"
                                /> : <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                        {this.state.email ? this.state.email : 'chưa cập nhật'}
                                    </span>}
                            </div>
                        </div>
                    </div>
                    <div className="form-group mb-0 row py-1">
                        <label htmlFor="staticEmail" className="col-4 col-form-label">
                            Tỉnh/Thành phố hiện tại
                                         </label>
                        <div className="col-8">
                            <div className="d-flex align-items-center">
                                {this.props.isMe ? <input
                                    type="text"
                                    className="form-control border-0 my-1"
                                    id="staticEmail"
                                    value={this.state.province}
                                    onChange={(val) => { this.setState({ province: val.target.value }) }}
                                    placeholder="Nhập tỉnh /thành phố"
                                /> : <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                        {this.state.province ? this.state.province : 'chưa cập nhật'}
                                    </span>}
                            </div>
                        </div>
                    </div>
                    {/* <div className="form-group mb-0 row py-1">
                        <label htmlFor="inputPassword" className="col-4 col-form-label">
                            Quê quán
                                      </label>
                        <div className="col-8">
                            <form >
                                <div className="d-flex align-items-center">
                                    {this.props.isMe ? <input
                                        type="text"
                                        className="form-control border-0 my-1"
                                        id="staticEmail"
                                        value={this.state.address}
                                        onChange={(val) => { this.setState({ address: val.target.value }) }}
                                        placeholder="Nhập quê quán"
                                    /> : <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                            {this.state.address ? this.state.address : 'chưa cập nhật'}
                                        </span>}


                                </div>
                                {this.props.isMe ? <div className="my-2">
                                    <a onClick={() => {
                                        this.updateContact()
                                    }} className="btn btn-sm btn-primary">
                                        Lưu thay đổi
                                    </a>
                                    <a style={{ marginLeft: 5 }} className="btn btn-sm btn-light">
                                        Huỷ
                                    </a>
                                </div> : null}
                            </form>
                        </div>
                    </div> */}
                    <div className="about-form__title font-weight-semi-bold pb-3 pt-4 d-flex align-items-center">
                        <i className="gapo-icon icon-heart icon-2x mr-2" />
                        Mối quan hệ
    </div>
                    <div className="form-group mb-0 row py-1 row__editable">
                        <label htmlFor="staticEmail" className="col-4 col-form-label">
                            Tình trạng
      </label>
                        <div className="col-8">
                            <form >
                                <div className="d-flex align-items-center">
                                    <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                        {this.state.marriageState ? this.state.marriageState : 'chưa cập nhật'}
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
                                        <i className="gapo-icon icon-pencil-alt mr-1" />Chỉnh
                                        sửa
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
                                                this.setState({
                                                    marriageState: 'Đã kết hôn'
                                                }, () => { this.updateMarriageState() })
                                            }} key={0}>Đã kết hôn</DropdownItem>
                                            <DropdownItem
                                                onClick={() => {
                                                    this.setState({
                                                        marriageState: 'Độc thân'
                                                    }, () => { this.updateMarriageState() })
                                                }}
                                                key={2}>Độc thân</DropdownItem>
                                        </DropdownMenu>
                                    </Dropdown>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="about-form__title font-weight-semi-bold pb-3 pt-4 d-flex align-items-center">
                        {/* <i className="gapo-icon icon-briefcase icon-2x mr-2" /> */}
                        <a className='svg-icon  mr-2' style={{ backgroundImage: `url(/assets/images/svg-icons/job.svg)`, width: 21, height: 21 }}></a>
                        Công việc và học vấn
                    </div>
                    <div className="form-group mb-0 row py-1">
                        <label htmlFor="staticEmail" className="col-4 col-form-label">
                            Trường học
                        </label>
                        <div className="col-8">
                            {this.props.isMe ? <input
                                type="text"
                                className="form-control border-0 my-2"
                                id="staticEmail"
                                value={this.state.education}
                                onChange={(val) => {
                                    this.setState({
                                        education: val.target.value
                                    })
                                }}
                                placeholder={'Nhập tên trường học'}
                            /> : <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                    {this.state.education ? this.state.education : 'chưa cập nhật'}
                                </span>}
                        </div>
                    </div>
                    <div className="form-group mb-0 row py-1 row__editable">
                        <label htmlFor="inputPassword" className="col-4 col-form-label">
                            Công việc hiện tại
                       </label>
                        <div className="col-8">
                            <form >
                                <div className="d-flex align-items-center">
                                    <span className="form-control-plaintext w-auto font-weight-semi-bold">

                                    </span>
                                    <div className="media-body">
                                        {this.props.isMe ? <input
                                            type="text"
                                            className="form-control border-0 my-2"
                                            id="staticEmail"
                                            value={this.state.work}
                                            onChange={(val) => {
                                                this.setState({
                                                    work: val.target.value
                                                })
                                            }}
                                            placeholder={'Nhập công việc hiện tại'}
                                        /> : <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                                Công việc hiện tại:        {this.state.work ? this.state.work : 'chưa cập nhật'}
                                            </span>}
                                        {/* {this.props.isMe ? <input
                                            onChange={(val) => {
                                                this.setState({
                                                    position: val.target.value
                                                })
                                            }}
                                            type="text"
                                            className="form-control border-0"
                                            id="staticEmail"
                                            value={this.state.position}
                                            placeholder="Chức vụ"
                                        /> : <span className="form-control-plaintext w-auto font-weight-semi-bold">
                                                Chức vụ:        {this.state.position ? this.state.position : 'chưa cập nhật'}
                                            </span>} */}
                                    </div>
                                </div>
                                {this.props.isMe ? <div className="my-2">
                                    <a onClick={() => { this.updateRelationship() }} className="btn btn-sm btn-primary">
                                        Lưu thay đổi
                                     </a>
                                    <a style={{ marginLeft: 5 }} className="btn btn-sm btn-light">
                                        Huỷ
                                    </a>
                                </div> : null}
                            </form>
                        </div>
                    </div>
                </div>
            </div>

        )
    }
}