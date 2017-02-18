import React, {Component} from 'react';
import cx from 'classnames';

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
  }

  componentWillReceiveProps(newProps) {
    this.checkValidity(newProps);
  }

  flip() {
    this.setState({flipped: !this.state.flipped});
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
