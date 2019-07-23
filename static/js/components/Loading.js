import React from 'react';
import { Spinner } from 'reactstrap';
export default class Loading extends React.Component {
    render() {
        let cls = this.props.full ? 'full-loading' : '';
        // return <p className='text-center p-2'>Đang xử lý...</p>
        switch (this.props.type) {
            case 'post':
                return <div className="timeline-wrapper">
                    <div className="timeline-item">
                        <div className="animated-background">
                            <div className="background-masker header-top" />
                            <div className="background-masker header-left" />
                            <div className="background-masker header-right" />
                            <div className="background-masker header-bottom" />
                            <div className="background-masker subheader-left" />
                            <div className="background-masker subheader-right" />
                            <div className="background-masker subheader-bottom" />
                            <div className="background-masker content-top" />
                            <div className="background-masker content-first-end" />
                            <div className="background-masker content-second-line" />
                            <div className="background-masker content-second-end" />
                            <div className="background-masker content-third-line" />
                            <div className="background-masker content-third-end" />
                        </div>
                    </div>
                </div>
            case 'friend':
                return <div className="timeline-wrapper">
                    <div className="timeline-item">
                        <div className="animated-background sm">
                            <div className="background-masker header-top" />
                            <div className="background-masker header-left" />
                            <div className="background-masker header-right" />
                            <div className="background-masker header-bottom" />
                            <div className="background-masker subheader-left" />
                            <div className="background-masker subheader-right" />
                            <div className="background-masker subheader-bottom" />
                            <div className="background-masker content-top" />
                        </div>
                    </div>
                </div>
            default:
                return <p>Đang xử lý...</p>

        }

    }
}