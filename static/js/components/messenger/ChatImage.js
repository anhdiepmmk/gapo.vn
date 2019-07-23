import React, { Component } from 'react';
import services from '../../services';
import ImageViewer from './../../shared/ImageView';
export default class ChatImage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            src: this.props.file.src || ''
        }
        if (!this.props.file.src) this.load();
    }
    async load() {
        let src = await services.data.chat.getImageBase64(this.props.file);
        this.setState({ src });
    }
    render() {
        return <ImageViewer images={[this.state.src]} alt='...' />
    }
}