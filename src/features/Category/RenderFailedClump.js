import React from "react"
import Util from "../performance/utils"
import DetailsRenderer from "../performance/details-renderer"

export class RenderFailedClump extends React.Component{
  renderGroupAudits = (grouped,groups)=>{
    const failedAuditsGroups = []

    for (const [groupId, groupAuditRefs] of grouped){
        const failedAuditsGroup=groupAuditRefs.map((audit)=>this.renderAudit(audit))
        failedAuditsGroups.push(
            <div className="lh-audit-group lh-audit-group--diagnostics">
              <div class="lh-audit-group__header">
                <span class="lh-audit-group__title">{groups[groupId].title}</span>
                <span class="lh-audit-group__description">{groups[groupId].description}</span>
              </div>
              {failedAuditsGroup}
            </div>
        )
    }

    return failedAuditsGroups
  }
  renderAudit = (audit)=>{
    return (
        <div class={Util._setRatingClass(audit.result.score,audit.result.scoreDisplayMode)} id={audit.result.id}>
          <details class="lh-expandable-details" open="">
            <summary>
              <div class="lh-audit__header lh-expandable-details__summary">
                <span class="lh-audit__score-icon"></span>
                <span class="lh-audit__title-and-text">
                  <span class="lh-audit__title">
                    <span>{DetailsRenderer.convertMarkdownCodeSnippets(audit.result.title)}</span>
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
  render(){
    const grouped = new Map();

    // Add audits without a group first so they will appear first.
    const notAGroup = 'NotAGroup';
    grouped.set(notAGroup, []);

    for(const auditRef of this.props.auditRefs) {
      const groupId = auditRef.group || notAGroup;
      const groupAuditRefs = grouped.get(groupId) || [];
      groupAuditRefs.push(auditRef);
      grouped.set(groupId, groupAuditRefs);
    }

    const failedNoGroupAudits = grouped.get(notAGroup);
    grouped.delete(notAGroup);

    const renderNoGroupAudits = failedNoGroupAudits.map((audit)=>(this.renderAudit(audit)))
    
    return (
        <div className="lh-clump--failed">
            {renderNoGroupAudits}
            {this.renderGroupAudits(grouped,this.props.groups)}
        </div>
    )
  }  
}