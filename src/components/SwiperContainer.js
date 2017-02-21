import React, {Component} from 'react';
import Swiper from './Swiper';
import * as CardActions from '../actions/CardActions';
//styles
import './SwiperContainer.scss';

class SwiperContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: true
    };

    this.toggleOpen = this.toggleOpen.bind(this);
    this.nextCard = this.nextCard.bind(this);
    this.prevCard = this.prevCard.bind(this);
  }

  toggleOpen() {
    this.setState({isOpen: !this.state.isOpen});
  }

  nextCard() {
    CardActions.incrementCard();
  }

  prevCard() {
    CardActions.decrementCard();
  }

  render() {
    if (!this.state.isOpen) {
      return (
        <div className="thinkSystem-SwiperContainer-openButton">
          <button type="button" onClick={ this.toggleOpen }>Open cards</button>
        </div>
      );
    } else {
      return (
        <div className="thinkSystem-SwiperContainer">
          <Swiper cards={ this.props.cards }/>
          <button type="button" onClick={ this.toggleOpen }>Close cards</button>
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
