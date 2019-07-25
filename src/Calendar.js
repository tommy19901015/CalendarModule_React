import React, { Component } from 'react';
import Moment from 'moment';
import "./css/calendar.css";
import axios from "axios";
import propTypes from 'prop-types';

class Calendar extends Component {
    state = {
        initDate : Moment().format("YYYY/MM/DD"),
        weekText : [{text:"星期日",en:"Sunday"},{text:"星期一",en:"Monday"},{text:"星期二",en:"Tuesday"},{text:"星期三",en:"Wednesday"},{text:"星期四",en:"Thursday"},{text:"星期五",en:"Friday"},{text:"星期六",en:"Saturday"}],
        weekToatalDay : 7,
        tableGrid : 42,
        jsonUrl : '',
        jsonData : [],
        isSelectList : true,
        inDateRange:true,
        isErrorUrl:false,
        td_active:false

    }
    componentDidMount = () => {        
        this.getJsonData()
        .then(this.sortJsonData)
        .then(this.getRecentJsonData)
    }
    getJsonData = () => {
        let data = this.props.jsonData
        if(typeof data === 'string'){
            this.setState({jsonUrl:data})
            return axios.get(data)
            .then( res => res.data.sort((a, b) => Moment(b.date).diff(Moment(a.date))))
            .catch((error) => {this.setState({isErrorUrl:true})});
        }
        if(Array.isArray(data)){
            this.setState({jsonData:data})
            return Promise.resolve(data)
                .then( res => res.sort((a, b) => Moment(b.date).diff(Moment(a.date))))
        }
        this.setState({isErrorUrl:true});
        return Promise.resolve('')
    }
    sortJsonData = (res) => {
        let newRes = [];
        if(typeof res !== 'undefined' && res !== ''){
            newRes = res.map(o=>{
                if(Object.keys(o).includes('certain')){
                    o["availableVancancy"] = o["onsell"];
                    delete o["onsell"];
                    o["guaranteed"] = o["certain"];
                    delete o["certain"];
                    o["totalVacnacy"] = o["total"];
                    delete o["total"];
                    o["status"] = o["state"];
                    delete o["state"];
                }
                return o    
            })
        }
        this.setState({jsonData:newRes})
        return newRes
    }
    getRecentJsonData = () => {
        if(!this.state.isErrorUrl){
            const inputDate = (typeof(this.props.date) != "undefined") ? this.props.date : Moment().format("YYYY/MM/DD");
            let regEx = /^\d{4}(\/)(((0)[0-9])|((1)[0-2]))(\/)([0-2][0-9]|(3)[0-1])$/;
            if(this.props.date.match(regEx) != null){
                const recentDay = this.state.jsonData.map(o=>Math.abs(Moment(inputDate).diff(o.date, 'days')));
                const min = Math.min(...recentDay);
                const idxArr = recentDay.map((o,i)=>o===min?i:'').filter(k=>k!=='');
                let max = 0;
                let mode = null;
                let mostRepeated = idxArr.map(i=>this.state.jsonData[i]).reduce((acc, curr) => { 
                    (curr.date in acc) ? acc[curr.date]++ : acc[curr.date] = 1
                    if (max < acc[curr.date]) {
                        max = acc[curr.date];
                        mode = curr.date;
                    }
                    return acc;
                }, {});
                let mostRepeatedDate = Object.keys(mostRepeated).reduce((a, b) => mostRepeated[a] >= mostRepeated[b] ? a : b);
                let mostRepeatedDateIdx = idxArr.filter(i=> this.state.jsonData[i].date === mostRepeatedDate ? i : '')[0];    
                (typeof(mostRepeatedDateIdx) === 'undefined') ? mostRepeatedDateIdx = 0 : mostRepeatedDateIdx = mostRepeatedDateIdx;
                this.setState({initDate: this.state.jsonData[mostRepeatedDateIdx].date});
            }else{
                console.log('error date format (YYYY/MM/DD)')
            }
        }else{
            console.log('error url')
        }
    }
    renderTitle = () => {
        const now = Moment(this.state.initDate).format("YYYY MM月");
        const pre = Moment(this.state.initDate).subtract(1, 'months').format("YYYY MM月");
        const next = Moment(this.state.initDate).add(1, 'months').format("YYYY MM月");
        const nowDataInfo = Moment(this.state.initDate).format("YYYY/MM");
        const preDataInfo = Moment(this.state.initDate).subtract(1, 'months').format("YYYY/MM");
        const nextDataInfo = Moment(this.state.initDate).add(1, 'months').format("YYYY/MM");
        return(
            <div className="changeMonthBlock">
                <div onClick={this.ckickMothTitle} data-info={preDataInfo + '/01'} className={this.activeTitle(preDataInfo + '/01')}>
                <div className="pre">{'◀'}</div>
                {pre}</div>
                <div onClick={this.ckickMothTitle} data-info={nowDataInfo + '/01'} className={this.activeTitle(nowDataInfo + '/01')}>{now}</div>
                <div onClick={this.ckickMothTitle} data-info={nextDataInfo + '/01'} className={this.activeTitle(nextDataInfo + '/01')}>{next}
                <div className="next">{'▶'}</div>
                </div>
            </div> 
        )
    }
    ckickMothTitle = e => {
        if(!this.state.isErrorUrl){
            let endDay = this.state.jsonData[0].date;
            let startDay = this.state.jsonData.slice(-1)[0].date;
            let clickDay = e.currentTarget.dataset.info;
            this.setState({
                initDate:clickDay,
                inDateRange:Moment(clickDay).isBetween(startDay, endDay)
            })
        }
    }
    activeTitle = (title) => {
        return this.state.initDate.split('/',2).join('') === title.split('/',2).join('') ?
        'monthBlock active' : 'monthBlock'
    }
    renderDay = () => {
        const { initDate,weekText,weekToatalDay,tableGrid } = this.state;
        const endDay = parseInt(Moment(initDate).endOf('month').format('DD'),10); 
        const startDay = Moment(initDate).startOf('month').format('dddd');
        const monthDataArr = [];
        let weekDataArr = [];
        let startIndex = weekText.map(obj=>obj.en).indexOf(startDay);
        let d = 1;
        for(let i=0;i<=tableGrid-1;i++){
            if(i < startIndex || i >= endDay + startIndex){
                weekDataArr.push({empty:true})
            }else{
                weekDataArr.push({
                    year:Moment(initDate).format('YYYY'),
                    month:Moment(initDate).format('MM'),
                    day:d >= endDay ? d : d++,
                    week_en:Moment(Moment(initDate).format('YYYY') + "/" + Moment(initDate).format('MM') + "/" + d).subtract(1, 'days').format("dddd"),
                    week_ch : this.state.weekText.filter(o=>(o.en === Moment(Moment(initDate)
                        .format('YYYY') + "/" + Moment(initDate).format('MM') + "/" + d).subtract(1, 'days').format("dddd") ? o.text : ''))[0].text,
                    empty:false
                })
            }
            if((i+1)%weekToatalDay === 0){
                monthDataArr.push(weekDataArr);
                weekDataArr = [];
            }
        }
        return monthDataArr.map((obj,i) => <div key={i} className="div_tr">{obj.map((days,j)=>
                <div onClick={this.clickDay} key={j} className={days.empty ? 'div_td noDay noGroup' : this.renderContent(days) ? 
                (this.state.td_active) ? 'div_td hasData active' : 'div_td hasData' : 'div_td noGroup'}>
                    <div className="right_block">
                        <div className="dayText">{days.empty ? '' : days.day}</div>
                        <div className="week_ch">{days.week_ch}</div>
                    </div>
                    <div className="content">{this.renderContent(days)}</div>
                </div>)}</div>)
    }
    clickDay = (e) => {
        console.log(this)
        if(e.currentTarget.classList.contains('hasData')){
            this.setState({td_active : !this.state.td_active})
            console.log(this.state.td_active)
        }
    }

    renderContent = (days) => {
        if(!days.empty && this.state.jsonData.length !== 0){
           let date = days.year + "/" + days.month + "/" + ((days.day) < 10 ? '0' + days.day : days.day);
           let info = this.state.jsonData.filter(obj => obj.date === date);
           if(info.length !== 0){
            return ([
                <div className={info[0].guaranteed ? 'guaranteed' : 'guaranteed no'} key={'guaranteed'}>成團</div>,
                <div className={this.statusStyle(info[0].status)} key={'status'}>{info[0].status}</div>,
                <div className="availableVancancy" key={'availableVancancy'}>可賣 : {info[0].availableVancancy}</div>,
                <div className="totalVacnacy" key={'totalVacnacy'}>團位 : {info[0].totalVacnacy}</div>,
                <div className="price" key={'price'}>${this.moneyFormat(info[0].price)}</div>
            ])
           }
           return false
        }
    }
    statusStyle = (status) => {
        const style = 'status ';
        switch(status){
            case '報名' :
                return style + 'o'
            case '請洽專員' :
            case '後補' :
                return style + 'g'
            case '關團' :
            case '額滿' :
                return style    
            default :
                return style 
        }
    }
    moneyFormat = (money) => {
        if(money && money!=null){
            money = String(money);
            let left=money.split('.')[0],right=money.split('.')[1];
            right = right ? (right.length>=2 ? '.'+right.substr(0,2) : '.'+right+'0') : '';
            let temp = left.split('').reverse().join('').match(/(\d{1,3})/g);
            return (Number(money)<0?"-":"") + temp.join(',').split('').reverse().join('')+right;
        }
    }
    changeSelectList = () => {
        this.setState({isSelectList : !this.state.isSelectList})
    }
    render() {
        return (
            <div>
                <div className="changeBtn" onClick={this.changeSelectList}>{this.state.isSelectList ? "切換列表顯示" : "切換日歷顯示"}</div>
                <div className="main_container">
                    {this.renderTitle()}
                    <div className={this.state.isSelectList ? "div_table" : "div_table selectList"}>
                        {this.state.inDateRange ? '' : <div className="noTravel">本月無出發行程</div>}
                        <div className="div_tr weekBlock">
                            {this.state.weekText.map((obj,i) => <div className="div_td weekText" key={i}>{obj.text}</div>)}
                        </div>
                        {this.renderDay()}
                    </div>
                </div>
            </div>
        );
    }
}

export default Calendar;

Calendar.propTypes = {
    date :  propTypes.string 
}