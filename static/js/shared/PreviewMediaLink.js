import React, { Component } from 'react';
import Microlink from '@microlink/react'
import Loading from './../components/Loading';
export default class LinkPreview extends Component {
    render() {

        if (this.props.loading) return <Loading type='post' />;
        if (!this.props.content) return null;
        let item = this.props.content;
        return <a href={item.src} target="_blank" className='link-preview-container'>
            {this.props.showClose ? <i className="gapo-icon icon-close icon-2x close-btn" onClick={evt => {
                evt.preventDefault();
                if (this.props.onClose) {
                    this.props.onClose();
                }
            }}></i> : null}
            <div className='img' style={{ backgroundImage: `url(${item.thumb.src})` }} />
            <p className='title'>{item.title}</p>
            <p className='desc'>{item.description}</p>
            <p className='src'>{item.src}</p>
        </a>
    }
}