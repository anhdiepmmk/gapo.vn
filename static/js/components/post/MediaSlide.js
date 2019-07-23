import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Create from '../Create';
import ReactPlayer from 'react-player'
const CONTENT_WIDTH = 200, HEIGHT_PADDING = 50, WIDTH_PADDING = 200;
export default class MediaSlide extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            size: this.calculateContainerSize(this.props.media),
            index: this.props.itemIndex || 0
        }
    }
    calculateContainerSize(media) {
        let maxWidth = window.innerWidth - CONTENT_WIDTH - WIDTH_PADDING * 2,
            maxHeight = window.innerHeight - (HEIGHT_PADDING * 2),
            maxRatio = maxWidth / maxHeight,
            width = 0, height = 0;
        return { width: maxWidth, height: maxHeight }
        media.map(item => {
            if (item.type === 'video') {
                item.width = item.thumb.width;
                item.height = item.thumb.height;
            }
            let r = item.width / item.height;
            if (r > maxRatio) {
                let iWidth = maxWidth,
                    iHeight = iWidth / r;
                width = maxWidth;
                if (height < iHeight) height = iHeight;
            } else {
                let iHeight = maxHeight,
                    iWidth = iHeight * r;
                height = maxHeight;
                if (width < iWidth) width = iWidth;
            }
        });
        return { width, height };
    }
    calculateItemSize(item) {
        if (item.type === 'video') {
            item.width = item.thumb.width;
            item.height = item.thumb.height;
        }
        let width = 0, height = 0, ratio = item.width / item.height, cRatio = this.state.size.width / this.state.size.height;
        if (ratio > cRatio) {
            width = this.state.size.width;
            height = width / ratio;
        } else {
            height = this.state.size.height;
            width = height * ratio;
        }
        return { width, height };
    }
    renderImage(item) {
        let size = this.calculateItemSize(item);
        return <div className='slide-attachment'>
            <img src={item.src} style={{ width: size.width, height: size.height }} className='item' />
        </div>
    }
    rendervideo(item) {
        let size = this.calculateItemSize(item);
        return <div className='slide-attachment'>
            <ReactPlayer url={item.src} width={size.width} height={size.height} controls playing={true} className='item' />
        </div>
    }
    onNav(type) {
        let index = this.state.index;
        switch (type) {
            case 'next':
                index++;
                if (index >= this.props.media.length) {
                    index = 0;
                }
                break;
            default:
                index--;
                if (index < 0) index = this.props.media.length - 1;
                break;
        }
        this.setState({ index });
    }
    render() {
        let containerSize = this.calculateContainerSize(this.props.media);
        return <div style={{ width: containerSize.width }} className='media-container'>
            {this.props.media[this.state.index].type === 'image' ? this.renderImage(this.props.media[this.state.index]) :
                this.rendervideo(this.props.media[this.state.index])}
            {this.props.media.length > 1 ? <React.Fragment>
                <a className="slide-navigator" onClick={evt => {
                    evt.preventDefault();
                    this.onNav('prev');
                }}>
                    <svg width={24} height={42} viewBox="0 0 24 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.1668 2.66675L2.8335 21.0001L21.1668 39.3334" stroke="white" strokeOpacity="0.6" strokeWidth={4} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>

                </a>
                <a className="slide-navigator nav-right" onClick={evt => {
                    evt.preventDefault();
                    this.onNav('next');
                }}> <svg width={24} height={42} viewBox="0 0 24 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.83317 2.66675L21.1665 21.0001L2.83317 39.3334" stroke="white" strokeOpacity="0.6" strokeWidth={4} strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </a>
            </React.Fragment> : null}
        </div>
    }
}