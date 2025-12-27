const FLAG_COLORS = {
  RED: 'red',
  ORANGE: 'orange',
  YELLOW: 'yellow',
  GREEN: 'green',
  BLUE: 'blue',
  PURPLE: 'purple'
};

class Flag {
  constructor(container, onUpdate) {
    this.container = container;
    this.onUpdate = onUpdate;
    this.currentColour = null;
    this.render();
  }

  setFlag(colour) {
    if (colour === this.currentColour) {
      this.currentColour = null;
      this.onUpdate(null);
    } else {
      this.currentColour = colour;
      this.onUpdate(colour);
    }
    this.updateUI();
  }

  updateUI() {
    const buttons = this.container.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.classList.remove('selected');
      if (btn.dataset.color === this.currentColour) {
        btn.classList.add('selected');
      }
    });
  }

  render() {
    this.container.innerHTML = `
      <div class="flag-selector">
        <button title="Red" class="icon red-flag" data-color="${FLAG_COLORS.RED}"></button>
        <button title="Orange" class="icon orange-flag" data-color="${FLAG_COLORS.ORANGE}"></button>
        <button title="Yellow" class="icon yellow-flag" data-color="${FLAG_COLORS.YELLOW}"></button>
        <button title="Green" class="icon green-flag" data-color="${FLAG_COLORS.GREEN}"></button>
        <button title="Blue" class="icon blue-flag" data-color="${FLAG_COLORS.BLUE}"></button>
        <button title="Purple" class="icon purple-flag" data-color="${FLAG_COLORS.PURPLE}"></button>
      </div>
    `;

    const buttons = this.container.querySelectorAll('button');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setFlag(btn.dataset.color);
      });
    });
  }
}

