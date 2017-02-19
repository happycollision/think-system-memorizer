import React, {Component} from 'react';
import ReactSwipe from 'react-swipe';
import CardStore from '../stores/CardStore';
import * as CardActions from '../actions/CardActions';
//styles
import './Swiper.scss';

class Swiper extends Component {
  constructor(props) {
    super(props)
    this.nextCard = this.nextCard.bind(this);
    this.prevCard = this.prevCard.bind(this);
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

    CardStore.on('POSITION_CHANGE', this.updateSlidePosition.bind(this))
  }

  updateSlidePosition() {
    this.goToSlide(CardStore.getCardPosition());
  }

  componentWillUnmount() {
    CardStore.removeEventListener('POSITION_CHANGE')
  }

  nextCard() {
    CardActions.incrementCard();
  }

  prevCard() {
    CardActions.decrementCard();
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
        <div>
          <button type="button" onClick={this.prevCard}>Prev</button>
          <button type="button" onClick={this.nextCard}>Next</button>
        </div>
      </div>
    )
  }
}

export default Swiper;
