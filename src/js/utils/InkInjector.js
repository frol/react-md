import { LEFT_MOUSE, TAB } from '../constants/keyCodes';
import { getOffset } from './index';

/**
 * This class is an alternate way to use inks. This class will
 * watch for the events on the window object and inject the
 * ink container and any inks when necessary. This will automatically
 * only use touch events for touch devices or mouse and keyboard events
 * for desktops.
 *
 * Example usage:
 *
 * ```js
 * require('react-md/lib/utils/InkInjector')();
 * ```
 */
export default class InkInjector {

  /**
   * @param {bool} touch? boolean if it is a touch device.
   *  If this is omitted, touch events are checked in the window
   *  object to determine if touch
   * @param {number} enterTimeout? the ink enter timeout to use.
   *  If this is omitted, 150 will be used.
   * @param {number} leaveTimeout? the ink leave timeout to use.
   *  If this is omitted, 450 will be used.
   */
  constructor(touch, enterTimeout = 150, leaveTimeout = 450) {
    this.enterTimeout = enterTimeout;
    this.leaveTimeout = leaveTimeout;
    this.transitions = [];

    if(typeof touch === 'undefined') {
      touch = typeof window !== 'undefined'
        ? !!('ontouchstart' in window || navigator.maxTouchPoints)
        : false;
    }

    if(touch) {
      window.addEventListener('touchstart', this._handleTouchStart);
      window.addEventListener('touchend', this._handleTouchEnd);
    } else {
      window.addEventListener('mousedown', this._handleMouseDown);
      window.addEventListener('mouseup', this._handleMouseUp);

      window.addEventListener('keyup', this._handleKeyUp);
    }
  }

  /**
   * Attempts to get an ink target from an event. It will check
   * the click target and then all parents to check if the data-ink-target
   * value was set on the element.
   *
   * @param {Object} e the event to traverse.
   * @return {DOMNode} the ink target container node or null.
   */
  _getInkTarget(e) {
    let target = e.target;
    while(target && target.parentNode) {
      if(target.dataset.inkTarget) {
        return target;
      }

      target = target.parentNode;
    }

    return null;
  }

  /**
   * Takes an ink target container and attempts to find the ink container inside. It iwll only
   * check the direct children.
   *
   * @param {DOMNode} container the container node to check.
   * @return {DOMNode} the ink container node or null.
   */
  _getInkContainer(container) {
    return Array.prototype.slice.call(container.childNodes)
      .filter(node => node.className && node.className.indexOf('md-ink-container') !== -1)[0];
  }

  /**
   * Attempts to find an ink container inside the given container element. If it does not
   * exist, a new ink container will be created and inserted as the first child in
   * the main container.
   *
   * @param {DOMNode} container the container node to check.
   * @return {DOMNode} the existing or newly created ink container node.
   */
  _getOrCreateInkContainer(container) {
    let inkContainer = this._getInkContainer(container);

    if(!inkContainer) {
      inkContainer = document.createElement('div');
      inkContainer.className = 'md-ink-container';

      container.insertBefore(inkContainer, container.firstChild);
    }

    return inkContainer;
  }

  /**
   * Calculates the hypotenuse using the x and y coordinates given.
   *
   * @param {number} a the x coordinate
   * @param {number} b the y coordinate
   * @return {number} the hypotenuse length for the given x and y coordinates.
   */
  _calcHypotenuse(a, b) {
    return Math.sqrt((a * a) + (b * b));
  }

  /**
   * Creacts a new ink for the given container from the pageX and pageY
   * coordinates.
   *
   * @param {number} pageX the click or touch pageX
   * @param {number} pageY the click or touch pageY
   * @param {DOMNode} container the container for all the inks.
   */
  _createInk = (pageX, pageY, container) => {
    const inkContainer = this._getOrCreateInkContainer(container);

    let left = 0, top = 0;
    let size, x, y;
    if(typeof pageX !== 'undefined' && typeof pageY !== 'undefined') {
      const offset = getOffset(inkContainer);

      x = pageX - offset.left;
      y = pageY - offset.top;
    } else {
      x = container.offsetWidth / 2;
      y = container.offsetHeight / 2;
    }

    const { offsetWidth, offsetHeight } = container;
    const r = Math.max(
      this._calcHypotenuse(x, y),
      this._calcHypotenuse(offsetWidth - x, y),
      this._calcHypotenuse(offsetWidth - x, offsetHeight - y),
      this._calcHypotenuse(x, offsetHeight - y)
    );

    left = x - r;
    top = y - r;
    size = r * 2;

    const ink = document.createElement('span');
    ink.className = 'md-ink';
    ink.style = `left:${left}px;top:${top}px;width:${size}px;height:${size}px`;
    inkContainer.insertBefore(ink, null);

    const transition = {
      ink,
      key: Date.now(),
      timeout: setTimeout(() => {
        transition.active = true;
        transition.key += 50;
        transition.ink.classList.add('active');
        transition.timeout = null;
      }, 50),
    };

    this.transitions.push(transition);
  };

  /**
   * Attempts to remove the next ink from a container node.
   *
   * @param {DOMNode} container the container node to use.
   */
  _removeInk = container => {
    let transition;
    this.transitions.some(t => {
      if(!t.timeout && !t.leaving) {
        transition = t;
      }

      return transition;
    });

    if(transition) {
      transition.timeout = setTimeout(() => {
        transition.ink.classList.add('leaving');
        transition.leaving = true;

        transition.timeout = setTimeout(() => {
          const inkContainer = this._getInkContainer(container);

          try {
            inkContainer.removeChild(transition.ink);
            this.transitions.shift();
          } catch(e) {
            this._removeAllButLastInks();
          }

        }, this.leaveTimeout);
      }, this.enterTimeout);
    }
  };

  /**
   * If a user spams the tab key, there is sometimes a chance that the wrong ink will
   * be removed from an ink container. The *fix* is to remove all the inks except
   * for the latest ink. This is a rare case.
   */
  _removeAllButLastInks = () => {
    const [last, ...remove] = this.transitions.reverse();
    remove.forEach(({ ink, timeout }) => {
      timeout && clearTimeout(timeout);
      ink.parentNode.removeChild(ink);
    });

    this.transitions = [last];
  };

  _handleMouseDown = e => {
    let target;
    if(e.button !== LEFT_MOUSE || e.ctrlKey || !(target = this._getInkTarget(e))) {
      return;
    }

    e.stopPropagation();

    this._createInk(e.pageX, e.pageY, target);
    target.addEventListener('mouseleave', this._handleMouseLeave);
  };

  _handleMouseLeave = e => {
    this._removeInk(e.target);
    e.target.removeEventListener('mouseleave', this._handleMouseLeave);
  };

  _handleMouseUp = e => {
    let target;
    if(e.button !== LEFT_MOUSE || e.ctrlKey || !(target = this._getInkTarget(e))) {
      return;
    }

    this._removeInk(target);
  };

  _handleKeyUp = e => {
    let target;
    if((e.which || e.keyCode) !== TAB || !(target = this._getInkTarget(e))) { return; }

    this._createInk(e.pageX, e.pageY, target);
    target.addEventListener('blur', this._handleBlur);
  };

  _handleBlur = (e) => {
    this._removeInk(e.target);
    e.target.removeEventListener('blur', this._handleBlur);
  };

  _handleTouchStart = (e) => {
    const target = this._getInkTarget(e);
    if(target) {
      const { pageX, pageY } = e.changedTouches[0];
      this._createInk(pageX, pageY, target);
      window.addEventListener('touchmove', this._handleTouchMove);
    }
  };

  _handleTouchMove = () => {
    const lastTransition = this.transitions[this.transitions.length - 1];
    if(!lastTransition) { return; }
    const { key, timeout, ink } = lastTransition;
    if(Date.now() < (key + 200)) {
      // abort ink creation if scrolling
      timeout && clearTimeout(timeout);
      ink.parentNode.removeChild(ink);
      this.transitions.pop();
    }

    window.removeEventListener('touchmove', this._handleTouchMove);
  };

  _handleTouchEnd = (e) => {
    const target = this._getInkTarget(e);
    if(target) {
      const transition = this.transitions.filter(transition => !transition.leaving)[0];
      if(transition) {
        window.removeEventListener('touchmove', this._handleTouchMove);

        setTimeout(() => {
          this._removeInk(target);
        }, Date.now() - transition.key);
      }
    }
  };
}
