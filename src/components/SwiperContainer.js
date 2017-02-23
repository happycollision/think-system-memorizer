import React, {Component} from 'react';
import Swiper from './Swiper';
import * as CardActions from '../actions/CardActions';
//styles
import './SwiperContainer.scss';

class SwiperContainer extends Component {
  constructor(props) {
    super(props);

    this.nextCard = this.nextCard.bind(this);
    this.prevCard = this.prevCard.bind(this);
  }

  nextCard() {
    CardActions.incrementCard();
  }

  prevCard() {
    CardActions.decrementCard();
  }

  render() {
    if (!this.props.isOpen) {
      return (
        <div className="thinkSystem-SwiperContainer-openButton">
          <button type="button" onClick={ this.props.onToggleCardsOpen }>Open cards</button>
        </div>
      );
    } else {
      return (
        <div className="thinkSystem-SwiperContainer">
          <Swiper cards={ this.props.cards }/>
          <button type="button" onClick={ this.props.onToggleCardsOpen }>Close cards</button>
          <div>
            <button type="button" onClick={this.prevCard}>Prev</button>
            <button type="button" onClick={this.nextCard}>Next</button>
          </div>
        </div>
      );
    }
  }
}

export default SwiperContainer;
