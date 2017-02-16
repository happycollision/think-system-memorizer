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
  
  checkValidity(props) {
    if (props.children === undefined) return;
    if (props.children.length === undefined) {
      throw new Error('FlipCard takes exactly two children. Only 1 was given.');
    }
    if (props.children.length !== 2) {
      throw new Error(`FlipCard takes exactly two children. ${props.children.length} were given.`);
    }
  }
  
  render() {
    if ( ! this.props.children ) return null;
    let [front, back] = this.props.children;
    return (
      <div className={cx('thinkSystem-FlipCard', {flipped: this.state.flipped})}>
        
        <div className="front" onClick={this.flip}>{front}</div>
        <div className="back" onClick={this.flip}>{back}</div>
      </div>
    )
  }
}

export default FlipCard;
