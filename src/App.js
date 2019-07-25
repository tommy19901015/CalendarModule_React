import React, { Component } from 'react';
import Calendar from './Calendar'

class App extends Component {
    render() {
        let jsonData =
        [{
            "certain": false,
            "date": "2019/08/15",
            "price": 62083,
            "onsell": 46,
            "total": 337,
            "state": "預定"
        },
        {
            "certain": false,
            "date": "2019/10/15",
            "price": 909,
            "onsell": 87,
            "total": 497,
            "state": "報名"
        },]
        return (
            <div className="App">
                {/* <Calendar /> */}
                <Calendar jsonData={'/json/data1.json'} />
                {/* <Calendar date={'2020/5/25'} jsonData={jsonData} /> */}
                {/* <Calendar date={'2020/5/25'} jsonData={{}} />   */}
            </div>
        );
    }
}

export default App;