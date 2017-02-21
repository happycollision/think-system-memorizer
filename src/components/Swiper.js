import React, {Component} from 'react';
import ReactSwipe from 'react-swipe';
import CardStore from '../stores/CardStore';
//styles
import './Swiper.scss';

class Swiper extends Component {
  constructor(props) {
    super(props)
    this.goToSlide = this.goToSlide.bind(this);

    this.state = {
      swipeOptions: {
        startSlide: CardStore.getCardPosition(),
        // auto: parseInt(query.auto, 10) || 0,
        // speed: parseInt(query.speed, 10) || 300,
        // disableScroll: query.disableScroll === 'true',
        // continuous: query.continuous === 'true',
        continuous: false
        // callback() {
        //   console.log('slide changed');
        // },
        // transitionEnd() {
        //   console.log('ended transition');
        // }
      }
    }

    CardStore.on('POSITION_CHANGE', this.updateSlidePosition.bind(this));
  }

  updateSlidePosition() {
    this.goToSlide(CardStore.getCardPosition());
  }

  componentWillUnmount() {
    CardStore.removeListener('POSITION_CHANGE', this.updateSlidePosition);
  }

  goToSlide(slideIndex) {
    this.refs.swiper.slide(slideIndex, 500);
  }

  render() {
    return (
      <div className="thinkSystem-Swiper">
        <ReactSwipe ref="swiper" swipeOptions={this.state.swipeOptions}>
          { this.props.cards }
        </ReactSwipe>
      </div>
    )
  }
}

export default Swiper;
