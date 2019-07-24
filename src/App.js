import React, { Component } from 'react';
import Calendar from './Calendar'

class App extends Component {
    render() {
        return (
            <div className="App">
                {/* <Calendar /> */}
                <Calendar date={'2018/12/25'}/>    
            </div>
        );
    }
}

export default App;