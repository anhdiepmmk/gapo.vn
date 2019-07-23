import React, { Component } from 'react'
import _ from 'lodash'
import services from '../../services'
import SearchHeader from '../SearchHeader'

export default class ChangePassword extends Component {
  constructor(props) {
    super(props)
    this.state = {
      password: {
        old: '',
        new: '',
        confirm: ''
      },
      errorOldPasswordCode: 0,
      errorOldPassword: '',
      errorNewPasswordCode: 0,
      errorNewPassword: '',
      errorConfirmPasswordCode: 0,
      errorConfirmPassword: '',
      noMatchPasswordMessage: '',
      match: true,
    }
  }
  validateOldPassword() {
    if (!this.state.password.old) {
      this.setState({ errorOldPasswordCode: 1, errorOldPassword: 'Vui lòng nhập mật khẩu' })
      return false
    } else if (!services.helper.checkPasswordStrength(this.state.password.old)) {
      this.setState({ errorOldPasswordCode: 1, errorOldPassword: 'Mật khẩu cần có tối thiểu 8 kí tự bao gồm cả chữ và số' })
      return false
    } else {
      return true
    }
  }
  validateNewPassword() {
    if (!this.state.password.new) {
      this.setState({ errorNewPasswordCode: 1, errorNewPassword: 'Vui lòng nhập mật khẩu' })
      return false
    } else if (!services.helper.checkPasswordStrength(this.state.password.new)) {
      this.setState({ errorNewPasswordCode: 1, errorNewPassword: 'Mật khẩu cần có tối thiểu 8 kí tự bao gồm cả chữ và số' })
      return false
    } else {
      return true
    }
  }
  validateConfirmPassword() {
    if (!this.state.password.confirm) {
      this.setState({ errorConfirmPasswordCode: 1, errorConfirmPassword: 'Vui lòng nhập mật khẩu' })
      return false
    } else if (!services.helper.checkPasswordStrength(this.state.password.confirm)) {
      this.setState({ errorConfirmPasswordCode: 1, errorConfirmPassword: 'Mật khẩu cần có tối thiểu 8 kí tự bao gồm cả chữ và số' })
      return false
    } else if (this.state.password.confirm !== this.state.password.new) {
      this.setState({ errorConfirmPasswordCode: 1, match: false, noMatchPasswordMessage: 'Mật khẩu không trùng khớp. Vui lòng thử lại' })
      return false
    } else {
      return true
    }
  }
  noMatchText() {
    if (!this.state.match) return this.state.noMatchPasswordMessage
    if (this.state.errorConfirmPasswordCode === 1) return this.state.errorConfirmPassword
    return ''
  }
  async handlePasswordInput(evt) {
    let { name, value } = evt.target
    let password = _.clone(this.state.password)
    password[[name]] = value
    this.setState({ password })
  }
  async verifyPassword(evt) {
    evt.preventDefault();
    try {
      this.validateOldPassword()
      this.validateNewPassword()
      this.validateConfirmPassword()
      if (!this.validateOldPassword() ||
        !this.validateNewPassword() ||
        !this.validateConfirmPassword()) return
      await services.data.changePassword(this.state.password.confirm, this.state.password.old)
      services.helper.successAlert('Đổi mật khẩu thành công')
      window.location.href = '/profile'
    } catch (e) {
      services.helper.alert(e.message)
    }
  }
  render() {
    return (
      <React.Fragment>
        <SearchHeader />
        <main className="gapo-main">
          <div className="container">
            <div className="auth__box rounded mx-auto" style={{ marginTop: '5%' }}>
              <h3 className="gapo-title mb-3">Đổi mật khẩu</h3>
              <div className="font-size-large mb-4">Mật khẩu tối thiểu 8 ký tự, bao gồm cả chữ và số</div>
              <form onSubmit={this.verifyPassword.bind(this)}>
                <div className="form-group">
                  <div className="input-group input-group--password">
                    <input type="password" name="old" onChange={this.handlePasswordInput.bind(this)} placeholder="Nhập mật khẩu cũ" className={`form-control ${this.state.errorOldPasswordCode === 1 ? 'is-invalid' : ''}`}/>
                    <div className="invalid-feedback">{this.state.errorOldPassword}</div>
                  </div>
                </div>
                <div className="form-group">
                  <input type="password" name="new" onChange={this.handlePasswordInput.bind(this)} placeholder="Nhập mật khẩu mới" className={`form-control ${this.state.errorNewPasswordCode === 1 ? 'is-invalid' : ''}`}/>
                  <div className="invalid-feedback">{this.state.errorNewPassword}</div>
                </div>
                <div className="form-group">
                  <input type="password" name="confirm" onChange={this.handlePasswordInput.bind(this)} placeholder="Nhập lại mật khẩu mới" className={`form-control ${this.state.errorConfirmPasswordCode === 1 ? 'is-invalid' : ''}`} />
                  <div className="invalid-feedback">{this.noMatchText()}</div>
                </div>
                <div className="text-center mt-4 pt-2">
                  <button className="btn btn-primary btn-lg" type="submit">Lưu thay đổi</button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </React.Fragment>
    )
  }
}
