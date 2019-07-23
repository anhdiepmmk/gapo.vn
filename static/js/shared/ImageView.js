import React, { Component } from 'react';
import Lightbox from 'react-image-lightbox';
export default class ImageViewer extends Component {
    constructor(props) {
        super(props);

        this.state = {
            photoIndex: 0,
            isOpen: false,
        };
    }

    render() {
        const { photoIndex, isOpen } = this.state;
        if (this.props.images.length === 1) {
            return (
                <div>
                    <img src={this.props.images[0]} alt={'...'} className='img-fluid' onClick={() => this.setState({ isOpen: true })} />
                    {isOpen && (
                        <Lightbox
                            mainSrc={this.props.images[photoIndex]}
                            onCloseRequest={() => this.setState({ isOpen: false })}
                        />
                    )}
                </div>
            );
        }
        return (
            <div>
                <img src={this.props.images[0]} alt={'...'} className='img-fluid' onClick={() => this.setState({ isOpen: true })} />
                {isOpen && (
                    <Lightbox
                        mainSrc={this.props.images[photoIndex]}
                        nextSrc={this.props.images[(photoIndex + 1) % this.props.images.length]}
                        prevSrc={this.props.images[(photoIndex + this.props.images.length - 1) % this.props.images.length]}
                        onCloseRequest={() => this.setState({ isOpen: false })}
                        onMovePrevRequest={() =>
                            this.setState({
                                photoIndex: (photoIndex + this.props.images.length - 1) % this.props.images.length,
                            })
                        }
                        onMoveNextRequest={() =>
                            this.setState({
                                photoIndex: (photoIndex + 1) % this.props.images.length,
                            })
                        }
                    />
                )}
            </div>
        );
    }
}