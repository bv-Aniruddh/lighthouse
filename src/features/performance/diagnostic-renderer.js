import DetailsRenderer from "../details-renderer"
import CriticalRequestChainRenderer from '../crc-renderer'
import Util from "../utils"
import React from "react"


class DiagnosticRenderer extends React.Component{
  renderDetails = (details)=>{
    switch (details.type){
      case 'table':
        return(
          <table class="lh-table lh-details">
          <thead><tr>{DetailsRenderer.renderTableHeader(details)}</tr></thead>
          <tbody>{DetailsRenderer.tablerender(details)}</tbody>
          </table>
        )
      case 'criticalrequestchain' :
        return CriticalRequestChainRenderer.render(details) 
      default : {return null}  
    }
  }
  render(){  
    const Diagnosticloader= this.props.diagnosticAudits.map((audit)=>(
      <div class={Util._setRatingClass(audit.result.score,audit.result.scoreDisplayMode)} id={audit.result.id}>
        <details class="lh-expandable-details" open="">
          <summary>
            <div class="lh-audit__header lh-expandable-details__summary">
              <span class="lh-audit__score-icon"></span>
              <span class="lh-audit__title-and-text">
                <span class="lh-audit__title">
                  <span>{audit.result.title}</span>
                </span>
                <span class="lh-audit__display-text">{audit.result.displayValue}</span>
              </span>
              <div class="lh-chevron-container">
                <svg class="lh-chevron" title="See audits" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                  <g class="lh-chevron__lines">
                    <path class="lh-chevron__line lh-chevron__line-left" d="M10 50h40"></path>
                    <path class="lh-chevron__line lh-chevron__line-right" d="M90 50H50"></path>
                  </g>
                </svg>
              </div>
            </div>
          </summary>
          <div class="lh-audit__description">
            <span>{DetailsRenderer.convertMarkdownLinkSnippets(audit.result.description)}</span>
          </div>
          {this.renderDetails(audit.result.details)}
        </details>
      </div>
    ))
    
    return(
      <div className="lh-audit-group lh-audit-group--diagnostics">
        <div class="lh-audit-group__header">
          <span class="lh-audit-group__title">Diagnostics</span>
          <span class="lh-audit-group__description">More information about the performance of your application. These numbers don't <a rel="noopener" target="_blank" href="https://web.dev/performance-scoring/?utm_source=lighthouse&amp;utm_medium=node">directly affect</a> the Performance score.</span>
        </div>
        {Diagnosticloader}
      </div>
    )
  }  
}

export default DiagnosticRenderer