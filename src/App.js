import React from "react"
import { fetchData } from "./features/data-slice-reducer"
import './App.css'
import Lighthouseoverview from "./features/lighouse-overview"
import PerformanceRender from "./features/performance/performance-render"
import CategoryRenderer from "./features/Category/category-renderer"
import Util from "./features/utils"
import I18n from "./features/i18n"
import PwaRenderer from "./features/pwa/pwa-renderer"
import {stringsArray} from "./features/il8n-strings"
import {connect} from "react-redux" 

//Main react component
class App extends React.Component{

  renderList = (report) =>{
    const li= []
    const envValues = Util.getEnvironmentDisplayValues(
      report.configSettings || {}
    );
    stringsArray(report,envValues).forEach((runtime) => {
      if (!runtime.description) return
      li.push(
        <li className="lh-env__item">
          <span className="lh-env__name">{runtime.name}</span>
          <span className="lh-env__description">{runtime.description}</span>
        </li>
      )
    })
    return li
  }
  
  runFetch = () => this.props.fetchData()

  render(){   
    if (this.props.status==="idle" && this.props.lighthouseData===null && this.props.error===null){
      console.log('inside')
      try{
        this.runFetch()
      } catch(e){
        console.log(e)
      }
    }   

    if (this.props.lighthouseData){
      console.log('succeeded')
      const report = Util.prepareReportResult(this.props.lighthouseData)
      const i18n = new I18n(report.configSettings.locale, {
        ...Util.UIStrings,
        ...report.i18n.rendererFormattedStrings,
      });
      Util.i18n = i18n;
      Util.reportJson = report;

      return (
        <React.Fragment>
        <div class="lh-container lh-root lh-vars lh-screenshot-overlay--enabled lh-narrow">  
          <div class="lh-container">
            <div class="lh-report">       
              <Lighthouseoverview categories={report.categories}/>
              <div class="lh-categories">
        
                <PerformanceRender data={report.categories['performance']}/>
                <CategoryRenderer data= {report.categories['accessibility']} id ="accessibility" categoryGroups={report.categoryGroups}/>
                <CategoryRenderer data= {report.categories['seo']} id ="seo" categoryGroups={report.categoryGroups}/>
                <CategoryRenderer data = {report.categories['best-practices']} id = 'best-practices' categoryGroups={report.categoryGroups}/>
                <PwaRenderer/>
              </div>
              <footer className="lh-footer">
                <div className="lh-env">
                  <div className="lh-env__title">Runtime Settings</div>
                  <ul className="lh-env__items" id="runtime-settings">
                    {this.renderList(report)}
                  </ul>
                </div>
              </footer>
            </div>
          </div>
        </div>  
        </React.Fragment>
      );
    }

    return (<p> Loading </p>)
  }
}

const mapStateToProps = (state)=>{
  const {data} = state
  return({
    lighthouseData: data.lighthouseData,
    status: data.status,
    error : data.error,
  })
}

const mapDispatchToProps = {
  fetchData
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App)