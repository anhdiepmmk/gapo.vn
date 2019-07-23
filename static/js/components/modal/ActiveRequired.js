import React, { PureComponent } from 'react'
// import { Link } from 'react-router-dom'

export default class ActiveRequired extends PureComponent {
  render() {
    return (
      <div>
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title gapo-subtitle">Yêu cầu hoàn tất</div>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => this.props.onClick()}>
                <i className="gapo-icon icon-close" />
              </button>
            </div>
              <div className="modal-body">
                Vui lòng hoàn tất đăng ký để sử dụng tính năng này
              </div>
              <div className="modal-footer">
                <button onClick={() => this.props.onClick('active')} type="button" className="btn btn-sm btn-primary">Hoàn tất đăng ký</button>
              </div>
          </div>
        </div>
      </div>
    )
  }
}
