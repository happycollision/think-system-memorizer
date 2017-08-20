import React, {Component} from 'react';
import Swiper from './Swiper';
import * as CardActions from '../actions/CardActions';
import CardStore from '../stores/CardStore';
//styles
import './SwiperContainer.scss';

class SwiperContainer extends Component {
  constructor(props) {
    super(props);

    this.nextCard = this.nextCard.bind(this);
    this.prevCard = this.prevCard.bind(this);
    this.backTwo = this.backTwo.bind(this);
    this.resetFlips = this.resetFlips.bind(this);
    this.flipCurrentCardToBack = this.flipCurrentCardToBack.bind(this);
    this.sequencePlay = this.sequencePlay.bind(this);

    this.state = {
      sequenceStep: 0,
      sequenceActions: [
        'flipCurrentCardToBack',
        'nextCard',
        'flipCurrentCardToBack',
        'nextCard',
        'flipCurrentCardToBack',
        'nextCard',
        'flipCurrentCardToBack',
        'resetFlipsAndBackTwo'
      ]
    }
  }

  nextCard() {
    CardActions.incrementCard();
  }

  prevCard() {
    CardActions.decrementCard();
  }

  backTwo() {
    CardStore.once('POSITION_CHANGE_REPORTED', () => {
      setTimeout(this.prevCard.bind(this),1);
    })
    this.prevCard();
  }

  flipCurrentCardToBack() {
    const currentCardIndex = CardStore.getCardPosition();
    CardActions.flipCardToBackByIndex(currentCardIndex);
  }

  resetFlips() {
    CardActions.resetFlippedStateForAllCards();
  }

  resetFlipsAndBackTwo() {
    this.resetFlips();
    this.backTwo();
  }

  sequenceStepAdvance() {
    const oldStep = this.state.sequenceStep;
    if (oldStep === this.state.sequenceActions.length - 1) {
      this.setState({sequenceStep: 0})
    } else {
      this.setState({sequenceStep: oldStep + 1});
    }
  }

  getAndAdvanceStep() {
    const currentStep = this.state.sequenceStep;
    this.sequenceStepAdvance();
    return currentStep;
  }

  sequencePlay() {
    const actionToPerform = this.state.sequenceActions[this.getAndAdvanceStep()];
    this[actionToPerform]();
  }

  render() {
    if (!this.props.isOpen) return null;
    return (
      <div className="thinkSystem-SwiperContainer">
        <Swiper cards={ this.props.cards }/>
        <div className="thinkSystem-SwiperContainer-actions">
          <div>
            <button type="button" onClick={ this.props.onToggleCardsOpen }>Close cards</button>
            <div>
              <button type="button" onClick={this.prevCard}>Prev</button>
              <button type="button" onClick={this.nextCard}>Next</button>
            </div>
          </div>
          <button type="button" onClick={this.sequencePlay}>Sequntial memorize</button>
        </div>
      </div>
    );
  }
}

export default SwiperContainer;
