import React from 'react';
import './Flag.css';

const RED = 'red';
const ORANGE = 'orange';
const YELLOW = 'yellow';
const GREEN = 'green';
const BLUE = 'blue';
const PURPLE = 'purple';

class Flag extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentColour: null
    }
  }

  setFlag(colour) {
    if (colour === this.state.currentColour) {
      this.props.update(null);
      this.setState({ currentColour: null });
    } else {
      this.props.update(colour);
      this.setState({ currentColour: colour });
    }
  }

  render() {
    return (
      <div className="flag-selector">
        <button title="Red" className={this.state.currentColour === RED ? 'icon red-flag selected' : 'icon red-flag'} onClick={() => this.setFlag(RED)}></button>
        <button title="Orange" className={this.state.currentColour === ORANGE ? 'icon orange-flag selected' : 'icon orange-flag'} onClick={() => this.setFlag(ORANGE)}></button>
        <button title="Yellow" className={this.state.currentColour === YELLOW ? 'icon yellow-flag selected' : 'icon yellow-flag'} onClick={() => this.setFlag(YELLOW)}></button>
        <button title="Green" className={this.state.currentColour === GREEN ? 'icon green-flag selected' : 'icon green-flag'} onClick={() => this.setFlag(GREEN)}></button>
        <button title="Blue" className={this.state.currentColour === BLUE ? 'icon blue-flag selected' : 'icon blue-flag'} onClick={() => this.setFlag(BLUE)}></button>
        <button title="Purple" className={this.state.currentColour === PURPLE ? 'icon purple-flag selected' : 'icon purple-flag'} onClick={() => this.setFlag(PURPLE)}></button>
      </div>
    );
  }
}

export default Flag;