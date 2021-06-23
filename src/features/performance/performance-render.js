import React from "react"
import CategoryHeader from "../category-header"
import MetricsRenderer from "./metrics-renderer"
import OpportunityRenderer from "./opportunity-renderer"
import DiagnosticRenderer from "./diagnostic-renderer"
import Util from "../utils"
import DetailsRenderer from "../details-renderer"
    
class PerformanceRender extends React.Component{
  renderAudit = ( audit )=>{
    return(
      <div class={Util._setRatingClass(audit.result.score,audit.result.scoreDisplayMode)} id={audit.result.id}>
        <details class="lh-expandable-details" open="">
          <summary>
            <div class="lh-audit__header lh-expandable-details__summary">
              <span class="lh-audit__score-icon"></span>
              <span class="lh-audit__title-and-text">
                <span class="lh-audit__title"><span>{DetailsRenderer.convertMarkdownCodeSnippets(audit.result.title)}</span></span>
                <span class="lh-audit__display-text">{audit.result.displayValue}</span>
              </span>
              <div class="lh-chevron-container"><svg class="lh-chevron" title="See audits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <g class="lh-chevron__lines">
                  <path class="lh-chevron__line lh-chevron__line-left" d="M10 50h40"></path>
                  <path class="lh-chevron__line lh-chevron__line-right" d="M90 50H50"></path>
                </g>
              </svg></div>
            </div>
          </summary>
          <div class="lh-audit__description">
            <span>{DetailsRenderer.convertMarkdownLinkSnippets(audit.result.description)}</span>
          </div>
          {this.loadStackpacks(audit)}
          <table class="lh-table lh-details">
              <thead><tr>{DetailsRenderer.renderTableHeader(audit.result.details)}</tr></thead>
              <tbody>{DetailsRenderer.tablerender(audit.result.details)}</tbody>
          </table>
        </details>
      </div>
    )
  }

  loadStackpacks = ( audit ) => {
    if( !audit.stackPacks ){
      return null
    }
    const collection = []
    audit.stackPacks.forEach((pack) => {
      collection.push(
        
        <div className="lh-audit__stackpack">
          <img className='lh-audit__stackpack__img' src={pack.iconDataURL} alt={pack.title}></img>
          <span>{DetailsRenderer.convertMarkdownLinkSnippets(pack.description)}</span>
        </div>
        
      )
    })
    return (<div className="lh-audit__stackpacks">{collection}</div>)
  }
  _getWastedMs(audit){
    if ( audit.result.details && audit.result.details.type === 'opportunity' ) {
      const details = audit.result.details;
      if ( typeof details.overallSavingsMs !== 'number' ) {
        throw new Error('non-opportunity details passed to _getWastedMs');
      }
      return details.overallSavingsMs;
    } else {
      return Number.MIN_VALUE;
    }
  }

  metricsgen(data){
    const metrics = [];
    for(let i=0;i<6;i++){
        metrics.push(data.audits[data.categories.performance.auditRefs[i].id]);
        console.log(metrics[i]);
    }
    return metrics;
  }

  render(){
    const performanceCategory=Util.reportJson.categories.performance.auditRefs;
    //Metrics data
    const metrics=this.metricsgen(Util.reportJson);
    
    // Opportunity data
    let opportunityAudits = performanceCategory.filter(
        (audit) =>
          audit.group === 'load-opportunities' && !Util.showAsPassed(audit.result)
      ).sort(
        (auditA, auditB) =>
          this._getWastedMs(auditB) -this._getWastedMs(auditA)
      );
      
    let scale=null;
    if (opportunityAudits.length) {
        const minimumScale = 2000;
        const wastedMsValues = opportunityAudits.map((audit) =>
          this._getWastedMs(audit)
        );
        const maxWaste = Math.max(...wastedMsValues);
        scale = Math.max(Math.ceil(maxWaste / 1000) * 1000, minimumScale);
    }
    // Diagnostic data
    const diagnosticAudits = performanceCategory.filter(
        (audit) =>
          audit.group === 'diagnostics' && !Util.showAsPassed(audit.result)
      ).sort((a, b) => {
        const scoreA =
          a.result.scoreDisplayMode === 'informative'
            ? 100
            : Number(a.result.score);
        const scoreB =
          b.result.scoreDisplayMode === 'informative'
            ? 100
            : Number(b.result.score);
        return scoreA - scoreB;
      });
    //Passed Audits
    const passedAudits = performanceCategory.filter(
      (audit) => (audit.group === 'load-opportunities' || audit.group === 'diagnostics') && Util.showAsPassed(audit.result))
    const renderedAudits=passedAudits.map((audit)=>this.renderAudit(audit))
    return(
        <React.Fragment>
        
        <div class="lh-category-wrapper">
        <div class="lh-category">
        <CategoryHeader category={this.props.data}/>
        <MetricsRenderer metrics={metrics}/>
        <OpportunityRenderer opportunityAudits={opportunityAudits} scale={scale}/>
        <DiagnosticRenderer diagnosticAudits={diagnosticAudits} />
        
        <details className="lh-clump lh-audit-group lh-clump--passed" open="">
            <summary>   
            <div className="lh-audit-group__summary">    
            <div class="lh-audit-group__header">
            <span class="lh-audit-group__title">Passed audits</span>
            <span class="lh-audit-group__itemcount">({passedAudits.length})</span>
            </div>
            </div>
            </summary>
            {renderedAudits}
          </details>
        </div>
        </div>
          
      </React.Fragment>
    )
  }  
} 

export default PerformanceRender