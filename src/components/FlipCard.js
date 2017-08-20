import React, {Component} from 'react';
import cx from 'classnames';
import dispatcher from '../utils/dispatcher';

//styles
import './FlipCard.scss';

class FlipCard extends Component {
  constructor(props) {
    super(props)
    this.checkValidity(props);
    this.state = {
      flipped: false
    };
    this.flip = this.flip.bind(this);

    dispatcher.register(this.handleActions.bind(this));
  }

  handleActions(action) {
    switch(action.type) {
      case 'RESET_CARDS_FLIP_STATE':
        this.setFront();
      break;
      case 'FLIP_CARD_TO_BACK':
        if (action.cardIndex === this.props.index) this.setBack();
      break;
      default:
        // nothing
      break;
    }
  }

  componentWillReceiveProps(newProps) {
    this.checkValidity(newProps);
  }

  flip() {
    this.setState({flipped: !this.state.flipped});
  }

  setFront() {
    if (this.state.flipped) this.flip();
  }

  setBack() {
    if (!this.state.flipped) this.flip();
  }

  sidesDefinedInProps() {
    return this.props.front !== undefined && this.props.back !== undefined
  }

  checkValidity(props) {
    if (this.sidesDefinedInProps()) return;
    if (props.children === undefined) return;
    if (props.children.length === undefined) {
      throw new Error('FlipCard takes exactly two children. Only 1 was given.');
    }
    if (props.children.length !== 2) {
      throw new Error(`FlipCard takes exactly two children. ${props.children.length} were given.`);
    }
  }

  getFaces() {
    if (this.sidesDefinedInProps()) {
      return [this.props.front, this.props.back];
    }
    if ( ! this.props.children ) return [null, null];
    return this.props.children;
  }

  render() {
    let [front, back] = this.getFaces();
    if (front === null) return null;
    return (
      <div className={cx('thinkSystem-FlipCard', {flipped: this.state.flipped})}>

        <div className="thinkSystem-FlipCard-front" onClick={this.flip} dangerouslySetInnerHTML={{__html:front}}/>
        <div className="thinkSystem-FlipCard-back" onClick={this.flip} dangerouslySetInnerHTML={{__html:back}}/>
      </div>
    )
  }
}

export default FlipCard;
