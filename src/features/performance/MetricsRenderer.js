import React from "react"
export class MetricsRenderer extends React.Component{
  render(){
    const classMetrics = [];
    for(let i=0;i<6;i++){
        let score=parseInt(parseFloat(this.props.metrics[i].score)*100);
        if( score<50 ){
            classMetrics.push("lh-metric lh-metric--fail")
        }
        else if ( score>49 && score <90 ){
            classMetrics.push("lh-metric lh-metric--average")
        }
        else{
            classMetrics.push("lh-metric lh-metric--pass")
        }
        
    }
  return(
    <React.Fragment>    
      <div class="lh-audit-group lh-audit-group--metrics">
        <div class="lh-audit-group__header">
          <span class="lh-audit-group__title">Metrics</span>
        </div>
        <input class="lh-metrics-toggle__input" type="checkbox" id="toggle-metric-descriptions" aria-label="Toggle the display of metric descriptions"/>
        <label class="lh-metrics-toggle__label" for="toggle-metric-descriptions">
          <div class="lh-metrics-toggle__icon lh-metrics-toggle__icon--less" aria-hidden="true"></div>
          <div class="lh-metrics-toggle__icon lh-metrics-toggle__icon--more" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path class="lh-metrics-toggle__lines" d="M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z"></path>
            </svg>
          </div>
        </label>
        <div class="lh-metrics-container">
          <div class={classMetrics[0]} id="first-contentful-paint">
            <div class="lh-metric__innerwrap">
              <span class="lh-metric__title">First Contentful Paint</span>
              <div class="lh-metric__value">{this.props.metrics[0].displayValue}&nbsp;</div>
              <div class="lh-metric__description">
                <span>First Contentful Paint marks the time at which the first text or image is painted. <a rel="noreferrer" target="_blank" href="https://web.dev/first-contentful-paint/?utm_source=lighthouse&amp;utm_medium=node">Learn more</a>.</span>
              </div>
            </div>
          </div>
          <div class={classMetrics[1]} id="speed-index">
            <div class="lh-metric__innerwrap">
              <span class="lh-metric__title">Speed Index</span>
              <div class="lh-metric__value">{this.props.metrics[1].displayValue}&nbsp;</div>
              <div class="lh-metric__description">
                <span>Speed Index shows how quickly the contents of a page are visibly populated. <a rel="noreferrer" target="_blank" href="https://web.dev/speed-index/?utm_source=lighthouse&amp;utm_medium=node">Learn more</a>.</span>
              </div>
            </div>
          </div>
          <div class={classMetrics[2]} id="largest-contentful-paint">
            <div class="lh-metric__innerwrap">
              <span class="lh-metric__title">Largest Contentful Paint</span>
              <div class="lh-metric__value">{this.props.metrics[2].displayValue}&nbsp;</div>
              <div class="lh-metric__description">
                <span>Largest Contentful Paint marks the time at which the largest text or image is painted. <a rel="noreferrer" target="_blank" href="https://web.dev/lighthouse-largest-contentful-paint/?utm_source=lighthouse&amp;utm_medium=node">Learn More</a></span>
              </div>
            </div>
          </div>
          <div class={classMetrics[3]} id="interactive">
            <div class="lh-metric__innerwrap">
            <span class="lh-metric__title">Time to Interactive</span>
            <div class="lh-metric__value">{this.props.metrics[3].displayValue}&nbsp;</div>
            <div class="lh-metric__description">
              <span>Time to interactive is the amount of time it takes for the page to become fully interactive. <a rel="noreferrer" target="_blank" href="https://web.dev/interactive/?utm_source=lighthouse&amp;utm_medium=node">Learn more</a>.</span>
            </div>
            </div>
          </div>
          <div class={classMetrics[4]} id="total-blocking-time">
            <div class="lh-metric__innerwrap">
              <span class="lh-metric__title">Total Blocking Time</span>
              <div class="lh-metric__value">{this.props.metrics[4].displayValue}&nbsp;</div>
              <div class="lh-metric__description">
                <span>Sum of all time periods between FCP and Time to Interactive, when task length exceeded 50ms, expressed in milliseconds. <a rel="noreferrer" target="_blank" href="https://web.dev/lighthouse-total-blocking-time/?utm_source=lighthouse&amp;utm_medium=node">Learn more</a>.</span>
              </div>
            </div>
          </div>
          <div class={classMetrics[5]} id="cumulative-layout-shift">
            <div class="lh-metric__innerwrap">
              <span class="lh-metric__title">Cumulative Layout Shift</span>
              <div class="lh-metric__value">{this.props.metrics[5].displayValue}</div>
              <div class="lh-metric__description">
                <span>Cumulative Layout Shift measures the movement of visible elements within the viewport. <a rel="noreferrer" target="_blank" href="https://web.dev/cls/?utm_source=lighthouse&amp;utm_medium=node">Learn more</a>.</span>
              </div>
            </div>
          </div>
        </div>
        <div class="lh-metrics__disclaimer">
          <span>Values are estimated and may vary. The <a rel="noreferrer" target="_blank" href="https://web.dev/performance-scoring/?utm_source=lighthouse&amp;utm_medium=node">performance score is calculated</a> directly from these metrics.</span><a class="lh-calclink" target="_blank" href="https://googlechrome.github.io/lighthouse/scorecalc/#FCP=4197&amp;SI=9000&amp;LCP=4945&amp;TTI=11004&amp;TBT=842&amp;CLS=0.05&amp;FCI=10672&amp;FMP=4197&amp;device=mobile&amp;version=7.0.1">See calculator.</a>
      </div>
    </div>
    </React.Fragment>
  );
  }
}