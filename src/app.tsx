import * as React from 'react'
import * as ReactDOM from 'react-dom';
import { createStore, combineReducers, compose, applyMiddleware, Action } from 'redux'
import { connect } from "react-redux";
import { Provider } from 'react-redux'
import { Router, Route, Switch, NavLink, RouteComponentProps } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'
import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
import { createBrowserHistory, createHashHistory } from 'history'

// choose type of history
// const history = createBrowserHistory();
const history = createHashHistory();
const middleware = routerMiddleware(history);

// reducers

const setValueAction = "SET_VALUE";

interface ISetValueAction extends Action {
    value: number;
}

const SET_VALUE_ACTION = (value: number): ISetValueAction => ({
    type: setValueAction,
    value
});

// store interface
interface IStore {
    value: number;
}

const anyWindow: any = window;
anyWindow.__REDUX_DEVTOOLS_EXTENSION__ && anyWindow.__REDUX_DEVTOOLS_EXTENSION__();

const middlewareParts = [
    applyMiddleware(middleware),
    anyWindow.__REDUX_DEVTOOLS_EXTENSION__ && anyWindow.__REDUX_DEVTOOLS_EXTENSION__()
].filter(m => m);

const reducers = {
    value: (state: number = 0, action: Action) => {
        switch(action.type) {
            case setValueAction:
                return (action as ISetValueAction).value;
            default:
                return state;
        }
    }
}

// Add the reducer to your store on the `routing` key
const store = createStore(
    combineReducers({
      ...reducers,
      routing: routerReducer
    }),
    compose(...middlewareParts)
  )

const App = () => 
    <div>
        App 
        <div><NavLink to="/foo">Foo</NavLink></div>
        <div><NavLink to="/bar">Bar</NavLink></div>
        <div><NavLink to="/rdx">Redux</NavLink></div>
    </div>

interface IFooRouterProps {
    id: string
}

const Foo = (props: RouteComponentProps<IFooRouterProps>) => {
    const allFoos = [1,2,3].map(id => <li key={id}><NavLink to={`/foo/${id}`}>Foo {id}</NavLink></li>)
    const selectedFoo = props && props.match.params.id ? props.match.params.id : `None`;
    return <div>
            <NavLink to="/foo">Foo</NavLink> ({selectedFoo}) 
            <NavLink to="/">App</NavLink>
            <ul>{allFoos}</ul>
        </div>
}
const Bar = () => <div>
        Bar <NavLink to="/">App</NavLink>
        <button onClick={e => history.push("/foo")}>Click to Foo</button>
    </div>

// redux
interface IReduxComnponentRouterProps {
    id: string;
}

interface IReduxConnectedProps extends RouteComponentProps<IReduxComnponentRouterProps> {
    valueInStore: number;
    setValue: (value: number) => void;
    setRoute: (value: string) => void;
}

interface IReduxConnectedState {
}

class ReduxComponent extends React.Component<IReduxConnectedProps, IReduxConnectedState> {
    constructor(props: IReduxConnectedProps) {
        super(props);
        this.state = {
        }
    }

    render() {
        const {valueInStore, setValue, setRoute, match: {params }} = this.props;
        const ticks = new Date();

        return <div>
            <div><NavLink to="/">App</NavLink></div>
            <div>StoreValue ({valueInStore})</div>
            <div>RouterValue ({params.id})</div>
            <div>Set store value: <button onClick={e => setValue(valueInStore + 1)}>Click</button></div>
            <div>Set router via history: <button onClick={e => history.push(`/rdx/${ticks.getMilliseconds()}`) }>Click</button></div>
            <div>Set router via action: <button onClick={e => setRoute(ticks.getMilliseconds().toString())}>Click</button></div>
        </div>
    }
}

const mapStateToProps = (store: IStore): Partial<IReduxConnectedProps> => ({
    valueInStore: store.value
})

const mapDispatchToProps = (dispatch: (payload: any) => void): Partial<IReduxConnectedProps> => ({
    setValue: (payload: number) => dispatch(SET_VALUE_ACTION(payload)),
    setRoute: (payload: string) => dispatch(push(payload))
});

const ReduxComponentConnect = connect(mapStateToProps, mapDispatchToProps)(ReduxComponent);

console.log("Loaded", store, ConnectedRouter);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={history}>
        <Switch>
            <Route path="/" exact component={App}/>
            <Route path="/foo/:id?" component={Foo}/>
            <Route path="/bar" component={Bar}/>
            <Route path="/rdx/:id?" component={ReduxComponentConnect}/>
        </Switch>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('container')
)
