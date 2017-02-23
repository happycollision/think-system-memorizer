import React, {Component} from 'react';
import ReactSwipe from 'react-swipe';
import CardStore from '../stores/CardStore';
import * as CardActions from '../actions/CardActions';
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
        continuous: false,
        // callback(position) {
        //
        // },
        transitionEnd(position) {
          console.log(position)
          CardActions.reportCardPosition(position);
        }
      }

    }
    this.updateSlidePosition = this.updateSlidePosition.bind(this);
    this.goToSlide = this.goToSlide.bind(this);

    CardStore.on('POSITION_CHANGE', this.updateSlidePosition);
  }

  updateSlidePosition() {
    this.goToSlide(CardStore.getCardPosition());
  }

  componentWillUnmount() {
    CardStore.removeListener('POSITION_CHANGE', this.updateSlidePosition);
  }

  goToSlide(slideIndex) {
    this.swiperRef.slide(slideIndex, 500);
  }

  render() {
    return (
      <div className="thinkSystem-Swiper">
        <ReactSwipe ref={el => {this.swiperRef = el}} swipeOptions={this.state.swipeOptions}>
          { this.props.cards }
        </ReactSwipe>
      </div>
    )
  }
}

export default Swiper;
