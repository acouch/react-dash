import React, { Component } from 'react';
import { browserHistory } from 'react-router';
import { findDOMNode } from 'react-dom';
import EventDispatcher from '../dispatcher/EventDispatcher';
import Dataset from '../models/Dataset';
import {omit, isEqual, isEmpty, isFunction, isPlainObject, isString, isArray, debounce} from 'lodash';
import StateHandler from '../utils/StateHandler';
import Registry from '../utils/Registry';
import { makeKey } from '../utils/utils';
import { qFromParams, getOwnQueryParams, getFID, objToQueryString } from '../utils/paramRouting';

const CARD_VARS = ['header', 'footer', 'iconClass', 'cardStyle', 'cardClasses', 'cardInnerClasses', 'subheader', 'topmatter', 'subheader2', 'topmatter2', 'footerHeader', 'footerSubheader', 'bottommatter', 'footerSubheader2', 'bottommatter2'];

export default class BaseComponent extends Component {

  constructor(props) {
    super(props);

    this.makeKey = makeKey;
    this.state = {
      data: [],
      dataset: null,
      queryObj: Object.assign({from: 0}, this.props.queryObj), // dataset query
      isFetching: false,
    };
  }

  /**
   * LIFECYCLE
   **/
  componentWillMount() {
    // Register to all the actions
    EventDispatcher.register(this.onAction.bind(this));
  }

  componentDidMount(){
    window.addEventListener('resize', this._resizeHandler );
    console.log('<1>', this); 
    this.setState({
      cardVariables: this.getCardVariables()
    });
    
    this._resizeHandler();
    this.onResize();
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('<1>', this); 
    if (!isEqual(this.props.data, prevProps.data)) {
      let newState = this.executeStateHandlers();
      newState.cardVariables = this.getCardVariables();
      this.setState(newState);
      this.onResize();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._resizeHandler);
  }

  emit(payload) {
    EventDispatcher.dispatch(payload);
  }

  getGlobalData() {
    return this.props.globalData || [];
  }

  /**
   * If stateHandlers are defined on the component call them and return the result
   *
   * @returns {obj} object with calculated state paramaters
   */
  executeStateHandlers() {
    let newState = {};

    if (this.props.stateHandlers && this.props.stateHandlers.length > 0) {
      let handledState = StateHandler.handle(this.props.stateHandlers, this.props.data, this.state.dashboardData);
      newState = Object.assign(newState, handledState);
    }

    return newState;
  }

  // if we have card variables set on the state, return them
  // otherwise use props or undefined
  getCardVariables() {
    console.log('<1.2>', this); 
    let cardVars = {};

    CARD_VARS.forEach(v => {
      cardVars[v] = this.state[v] || this.props[v];
    });

    return cardVars;
  }
  
  _resizeHandler = (e) => {
      let componentWidth = findDOMNode(this).getBoundingClientRect().width;
    
      console.log('>_RH', this, componentWidth);
      this.setState({ componentWidth : componentWidth});
      this.onResize(e);
  }

  /**
   * Abstract
   */

  onResize() {
    /* IMPLEMENT */
  }

  onAction() {
    /* IMPLEMENT */
  }

}
