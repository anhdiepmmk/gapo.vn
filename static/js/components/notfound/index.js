import React from 'react'
import { withRouter } from 'react-router-dom'
import SearchHeader from '../SearchHeader';

function NotFound(props) {
    return (
        <React.Fragment>
            <div className="row justify-content-center">
                <SearchHeader />
                <div style={{ textAlign: 'center' }} className="col col-500 py-4">
                    <p style={{ fontSize: 32, textAlign: 'center', fontWeight: 'bold', marginTop: 50, marginTop: 60 }}>Trang không tồn tại</p>
                    <p style={{ textAlign: 'center', fontSize: 16 }}>Liên kết bạn truy cập có thể bị hỏng hoặc trang có thể đã bị gỡ.</p>
                    <img src='/assets/images/notfound.svg' />

                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
                        <div onClick={() => {
                            props.history.goBack()
                        }} style={{ width: 152, height: 36, backgroundColor: '#ffffff', cursor: 'pointer' }}>
                            <p style={{ lineHeight: '36px' }}>Quay lại trang trước</p>
                        </div>
                        <div style={{ width: 15 }}></div>
                        <div onClick={() => {
                            props.history.replace('/')
                        }} style={{ width: 152, height: 36, backgroundColor: '#ffffff', cursor: 'pointer' }}>
                            <p style={{ lineHeight: "36px" }}>Trở về trang chủ</p>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>
    )
}

export default withRouter(NotFound);
