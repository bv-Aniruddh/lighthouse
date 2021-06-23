
'use strict';


const ELLIPSIS = '\u2026'
const NBSP = '\xa0'
const PASS_THRESHOLD = 0.9
const SCREENSHOT_PREFIX = 'data:image/jpeg;base64,'

const RATINGS = {
  PASS: { label: 'pass', minScore: PASS_THRESHOLD },
  AVERAGE: { label: 'average', minScore: 0.5 },
  FAIL: { label: 'fail' },
  ERROR: { label: 'error' },
};
const listOfTlds = [
  'com',
  'co',
  'gov',
  'edu',
  'ac',
  'org',
  'go',
  'gob',
  'or',
  'net',
  'in',
  'ne',
  'nic',
  'gouv',
  'web',
  'spb',
  'blog',
  'jus',
  'kiev',
  'mil',
  'wi',
  'qc',
  'ca',
  'bel',
  'on',
];

class Util {
  static get PASS_THRESHOLD() {
    return PASS_THRESHOLD
  }

  static get MS_DISPLAY_VALUE() {
    return `%10d${NBSP}ms`
  }
  static getValueType(heading){
    const valueType = heading.valueType || 'text'
    const classes = `lh-table-column--${valueType}`
    return classes
}
  static _setRatingClass=(score, scoreDisplayMode)=>{
    const rating = Util.calculateRating(score, scoreDisplayMode)
    let Class = 'lh-audit'+` lh-audit--${scoreDisplayMode.toLowerCase()}`
    if(scoreDisplayMode !== 'informative'){
      Class=Class+` lh-audit--${rating}`
    }
    return Class
  }
  static prepareReportResult(result) {
    
    const clone = (JSON.parse(JSON.stringify(result)))

    if (!clone.configSettings.locale) {
      clone.configSettings.locale = 'en'
    }

    for (const audit of Object.values(clone.audits)) {
      
      if (
        audit.scoreDisplayMode === 'not_applicable' ||
        audit.scoreDisplayMode === 'not-applicable'
      ) {
        audit.scoreDisplayMode = 'notApplicable';
      }

      if (audit.details) {
        if (
          audit.details.type === undefined ||
          audit.details.type === 'diagnostic'
        ) {
          audit.details.type = 'debugdata';
        }

        if (audit.details.type === 'filmstrip') {
          for (const screenshot of audit.details.items) {
            if (!screenshot.data.startsWith(SCREENSHOT_PREFIX)) {
              screenshot.data = SCREENSHOT_PREFIX + screenshot.data
            }
          }
        }
      }
    }

    if (typeof clone.categories !== 'object')
      throw new Error('No categories provided.')
    for (const category of Object.values(clone.categories)) {
      category.auditRefs.forEach((auditRef) => {
        const result = clone.audits[auditRef.id]
        auditRef.result = result

        if (clone.stackPacks) {
          clone.stackPacks.forEach((pack) => {
            if (pack.descriptions[auditRef.id]) {
              auditRef.stackPacks = auditRef.stackPacks || []
              auditRef.stackPacks.push({
                title: pack.title,
                iconDataURL: pack.iconDataURL,
                description: pack.descriptions[auditRef.id],
              })
            }
          })
        }
      })
    }

    return clone;
  }

  static showAsPassed(audit) {
    switch (audit.scoreDisplayMode) {
      case 'manual':
      case 'notApplicable':
        return true;
      case 'error':
      case 'informative':
        return false;
      case 'numeric':
      case 'binary':
      default:
        return Number(audit.score) >= RATINGS.PASS.minScore
    }
  }

  static calculateRating(score, scoreDisplayMode) {
    if (scoreDisplayMode === 'manual' || scoreDisplayMode === 'notApplicable') {
      return RATINGS.PASS.label
    } else if (scoreDisplayMode === 'error') {
      return RATINGS.ERROR.label
    } else if (score === null) {
      return RATINGS.FAIL.label
    }

    let rating = RATINGS.FAIL.label
    if (score >= RATINGS.PASS.minScore) {
      rating = RATINGS.PASS.label
    } else if (score >= RATINGS.AVERAGE.minScore) {
      rating = RATINGS.AVERAGE.label
    }
    return rating
  }

  static splitMarkdownCodeSpans(text) {
    const segments = []

    const parts = text.split(/`(.*?)`/g);
    for (let i = 0; i < parts.length; i++) {
      const text = parts[i]
      if (!text) continue;
      const isCode = i % 2 !== 0
      segments.push({
        isCode,
        text,
      });
    }

    return segments
  }

  static splitMarkdownLink(text) {
    const segments = []

    const parts = text.split(/\[([^\]]+?)\]\((https?:\/\/.*?)\)/g)
    while (parts.length) {
      const [preambleText, linkText, linkHref] = parts.splice(0, 3)

      if (preambleText) {
        segments.push({
          isLink: false,
          text: preambleText,
        })
      }

      if (linkText && linkHref) {
        segments.push({
          isLink: true,
          text: linkText,
          linkHref,
        })
      }
    }

    return segments
  }

  static getURLDisplayName(parsedUrl, options) {
    options = options || {
      numPathParts: undefined,
      preserveQuery: undefined,
      preserveHost: undefined,
    };
    const numPathParts =
      options.numPathParts !== undefined ? options.numPathParts : 2
    const preserveQuery =
      options.preserveQuery !== undefined ? options.preserveQuery : true
    const preserveHost = options.preserveHost || false

    let name

    if (parsedUrl.protocol === 'about:' || parsedUrl.protocol === 'data:') {
      name = parsedUrl.href
    } else {
      name = parsedUrl.pathname
      const parts = name.split('/').filter((part) => part.length)
      if (numPathParts && parts.length > numPathParts) {
        name = ELLIPSIS + parts.slice(-1 * numPathParts).join('/')
      }

      if (preserveHost) {
        name = `${parsedUrl.host}/${name.replace(/^\//, '')}`
      }
      if (preserveQuery) {
        name = `${name}${parsedUrl.search}`
      }
    }

    const MAX_LENGTH = 64;
    // Always elide hexadecimal hash
    name = name.replace(/([a-f0-9]{7})[a-f0-9]{13}[a-f0-9]*/g, `$1${ELLIPSIS}`)
    // Also elide other hash-like mixed-case strings
    name = name.replace(
      /([a-zA-Z0-9-_]{9})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9-_]{10,}/g,
      `$1${ELLIPSIS}`
    );
    // Also elide long number sequences
    name = name.replace(/(\d{3})\d{6,}/g, `$1${ELLIPSIS}`);
    // Merge any adjacent ellipses
    name = name.replace(/\u2026+/g, ELLIPSIS)

    // Elide query params first
    if (name.length > MAX_LENGTH && name.includes('?')) {
      // Try to leave the first query parameter intact
      name = name.replace(/\?([^=]*)(=)?.*/, `?$1$2${ELLIPSIS}`)

      // Remove it all if it's still too long
      if (name.length > MAX_LENGTH) {
        name = name.replace(/\?.*/, `?${ELLIPSIS}`)
      }
    }

    // Elide too long names next
    if (name.length > MAX_LENGTH) {
      const dotIndex = name.lastIndexOf('.');
      if (dotIndex >= 0) {
        name =
          name.slice(0, MAX_LENGTH - 1 - (name.length - dotIndex)) +
          // Show file extension
          `${ELLIPSIS}${name.slice(dotIndex)}`
      } else {
        name = name.slice(0, MAX_LENGTH - 1) + ELLIPSIS
      }
    }

    return name;
  }

  static parseURL(url) {
    const parsedUrl = new URL(url);
    return {
      file: Util.getURLDisplayName(parsedUrl),
      hostname: parsedUrl.hostname,
      origin: parsedUrl.origin,
    }
  }

  static createOrReturnURL(value) {
    if (value instanceof URL) {
      return value
    }

    return new URL(value)
  }

  static getTld(hostname) {
    const tlds = hostname.split('.').slice(-2)

    if (!listOfTlds.includes(tlds[0])) {
      return `.${tlds[tlds.length - 1]}`
    }

    return `.${tlds.join('.')}`
  }

  static getRootDomain(url) {
    const hostname = Util.createOrReturnURL(url).hostname
    const tld = Util.getTld(hostname)
    const splitTld = tld.split('.')
    return hostname.split('.').slice(-splitTld.length).join('.')
  }

  static getEnvironmentDisplayValues(settings) {
    const emulationDesc = Util.getEmulationDescriptions(settings)

    return [
      {
        name: Util.i18n.strings.runtimeSettingsDevice,
        description: emulationDesc.deviceEmulation,
      },
      {
        name: Util.i18n.strings.runtimeSettingsNetworkThrottling,
        description: emulationDesc.networkThrottling,
      },
      {
        name: Util.i18n.strings.runtimeSettingsCPUThrottling,
        description: emulationDesc.cpuThrottling,
      },
    ]
  }

  static getEmulationDescriptions(settings) {
    let cpuThrottling
    let networkThrottling

    const throttling = settings.throttling;

    switch (settings.throttlingMethod) {
      case 'provided':
        cpuThrottling = Util.i18n.strings.throttlingProvided
        networkThrottling = Util.i18n.strings.throttlingProvided
        break
      case 'devtools': {
        const { cpuSlowdownMultiplier, requestLatencyMs } = throttling
        cpuThrottling = `${Util.i18n.formatNumber(
          cpuSlowdownMultiplier
        )}x slowdown (DevTools)`
        networkThrottling =
          `${Util.i18n.formatNumber(requestLatencyMs)}${NBSP}ms HTTP RTT, ` +
          `${Util.i18n.formatNumber(
            throttling.downloadThroughputKbps
          )}${NBSP}Kbps down, ` +
          `${Util.i18n.formatNumber(
            throttling.uploadThroughputKbps
          )}${NBSP}Kbps up (DevTools)`;
        break
      }
      case 'simulate': {
        const { cpuSlowdownMultiplier, rttMs, throughputKbps } = throttling
        cpuThrottling = `${Util.i18n.formatNumber(
          cpuSlowdownMultiplier
        )}x slowdown (Simulated)`
        networkThrottling =
          `${Util.i18n.formatNumber(rttMs)}${NBSP}ms TCP RTT, ` +
          `${Util.i18n.formatNumber(
            throughputKbps
          )}${NBSP}Kbps throughput (Simulated)`
        break
      }
      default:
        cpuThrottling = Util.i18n.strings.runtimeUnknown
        networkThrottling = Util.i18n.strings.runtimeUnknown
    }

    let deviceEmulation = Util.i18n.strings.runtimeNoEmulation
    if (settings.emulatedFormFactor === 'mobile') {
      deviceEmulation = Util.i18n.strings.runtimeMobileEmulation
    } else if (settings.emulatedFormFactor === 'desktop') {
      deviceEmulation = Util.i18n.strings.runtimeDesktopEmulation
    }

    return {
      deviceEmulation,
      cpuThrottling,
      networkThrottling,
    }
  }

  static filterRelevantLines(lines, lineMessages, surroundingLineCount) {
    if (lineMessages.length === 0) {
      return lines.slice(0, surroundingLineCount * 2 + 1)
    }

    const minGapSize = 3
    const lineNumbersToKeep = new Set()
    lineMessages = lineMessages.sort(
      (a, b) => (a.lineNumber || 0) - (b.lineNumber || 0)
    );
    lineMessages.forEach(({ lineNumber }) => {
      let firstSurroundingLineNumber = lineNumber - surroundingLineCount
      let lastSurroundingLineNumber = lineNumber + surroundingLineCount

      while (firstSurroundingLineNumber < 1) {
        firstSurroundingLineNumber++
        lastSurroundingLineNumber++
      }
      if (lineNumbersToKeep.has(firstSurroundingLineNumber - minGapSize - 1)) {
        firstSurroundingLineNumber -= minGapSize
      }
      for (
        let i = firstSurroundingLineNumber;
        i <= lastSurroundingLineNumber;
        i++
      ) {
        const surroundingLineNumber = i
        lineNumbersToKeep.add(surroundingLineNumber)
      }
    });

    return lines.filter((line) => lineNumbersToKeep.has(line.lineNumber))
  }

  static isPluginCategory(categoryId) {
    return categoryId.startsWith('lighthouse-plugin-')
  }
}

Util.reportJson = null
Util.i18n = null
Util.UIStrings = {
  /** Disclaimer shown to users below the metric values (First Contentful Paint, Time to Interactive, etc) to warn them that the numbers they see will likely change slightly the next time they run Lighthouse. */
  varianceDisclaimer:
    'Values are estimated and may vary. The [performance score is calculated](https://web.dev/performance-scoring/) directly from these metrics.',
  /** Text link pointing to an interactive calculator that explains Lighthouse scoring. The link text should be fairly short. */
  calculatorLink: 'See calculator.',
  /** Column heading label for the listing of opportunity audits. Each audit title represents an opportunity. There are only 2 columns, so no strict character limit.  */
  opportunityResourceColumnLabel: 'Opportunity',
  /** Column heading label for the estimated page load savings of opportunity audits. Estimated Savings is the total amount of time (in seconds) that Lighthouse computed could be reduced from the total page load time, if the suggested action is taken. There are only 2 columns, so no strict character limit. */
  opportunitySavingsColumnLabel: 'Estimated Savings',

  /** An error string displayed next to a particular audit when it has errored, but not provided any specific error message. */
  errorMissingAuditInfo: 'Report error: no audit information',
  /** A label, shown next to an audit title or metric title, indicating that there was an error computing it. The user can hover on the label to reveal a tooltip with the extended error message. Translation should be short (< 20 characters). */
  errorLabel: 'Error!',
  /** This label is shown above a bulleted list of warnings. It is shown directly below an audit that produced warnings. Warnings describe situations the user should be aware of, as Lighthouse was unable to complete all the work required on this audit. For example, The 'Unable to decode image (biglogo.jpg)' warning may show up below an image encoding audit. */
  warningHeader: 'Warnings: ',
  /** The tooltip text on an expandable chevron icon. Clicking the icon expands a section to reveal a list of audit results that was hidden by default. */
  auditGroupExpandTooltip: 'Show audits',
  /** Section heading shown above a list of passed audits that contain warnings. Audits under this section do not negatively impact the score, but Lighthouse has generated some potentially actionable suggestions that should be reviewed. This section is expanded by default and displays after the failing audits. */
  warningAuditsGroupTitle: 'Passed audits but with warnings',
  /** Section heading shown above a list of audits that are passing. 'Passed' here refers to a passing grade. This section is collapsed by default, as the user should be focusing on the failed audits instead. Users can click this heading to reveal the list. */
  passedAuditsGroupTitle: 'Passed audits',
  /** Section heading shown above a list of audits that do not apply to the page. For example, if an audit is 'Are images optimized?', but the page has no images on it, the audit will be marked as not applicable. This is neither passing or failing. This section is collapsed by default, as the user should be focusing on the failed audits instead. Users can click this heading to reveal the list. */
  notApplicableAuditsGroupTitle: 'Not applicable',
  /** Section heading shown above a list of audits that were not computed by Lighthouse. They serve as a list of suggestions for the user to go and manually check. For example, Lighthouse can't automate testing cross-browser compatibility, so that is listed within this section, so the user is reminded to test it themselves. This section is collapsed by default, as the user should be focusing on the failed audits instead. Users can click this heading to reveal the list. */
  manualAuditsGroupTitle: 'Additional items to manually check',

  /** Label shown preceding any important warnings that may have invalidated the entire report. For example, if the user has Chrome extensions installed, they may add enough performance overhead that Lighthouse's performance metrics are unreliable. If shown, this will be displayed at the top of the report UI. */
  toplevelWarningsMessage:
    'There were issues affecting this run of Lighthouse:',

  /** String of text shown in a graphical representation of the flow of network requests for the web page. This label represents the initial network request that fetches an HTML page. This navigation may be redirected (eg. Initial navigation to http://example.com redirects to https://www.example.com). */
  crcInitialNavigation: 'Initial Navigation',
  /** Label of value shown in the summary of critical request chains. Refers to the total amount of time (milliseconds) of the longest critical path chain/sequence of network requests. Example value: 2310 ms */
  crcLongestDurationLabel: 'Maximum critical path latency:',

  /** Label for button that shows all lines of the snippet when clicked */
  snippetExpandButtonLabel: 'Expand snippet',
  /** Label for button that only shows a few lines of the snippet when clicked */
  snippetCollapseButtonLabel: 'Collapse snippet',

  /** Explanation shown to users below performance results to inform them that the test was done with a 4G network connection and to warn them that the numbers they see will likely change slightly the next time they run Lighthouse. 'Lighthouse' becomes link text to additional documentation. */
  lsPerformanceCategoryDescription:
    '[Lighthouse](https://developers.google.com/web/tools/lighthouse/) analysis of the current page on an emulated mobile network. Values are estimated and may vary.',
  /** Title of the lab data section of the Performance category. Within this section are various speed metrics which quantify the pageload performance into values presented in seconds and milliseconds. "Lab" is an abbreviated form of "laboratory", and refers to the fact that the data is from a controlled test of a website, not measurements from real users visiting that site.  */
  labDataTitle: 'Lab Data',

  /** This label is for a checkbox above a table of items loaded by a web page. The checkbox is used to show or hide third-party (or "3rd-party") resources in the table, where "third-party resources" refers to items loaded by a web page from URLs that aren't controlled by the owner of the web page. */
  thirdPartyResourcesLabel: 'Show 3rd-party resources',

  /** Option in a dropdown menu that opens a small, summary report in a print dialog.  */
  dropdownPrintSummary: 'Print Summary',
  /** Option in a dropdown menu that opens a full Lighthouse report in a print dialog.  */
  dropdownPrintExpanded: 'Print Expanded',
  /** Option in a dropdown menu that copies the Lighthouse JSON object to the system clipboard. */
  dropdownCopyJSON: 'Copy JSON',
  /** Option in a dropdown menu that saves the Lighthouse report HTML locally to the system as a '.html' file. */
  dropdownSaveHTML: 'Save as HTML',
  /** Option in a dropdown menu that saves the Lighthouse JSON object to the local system as a '.json' file. */
  dropdownSaveJSON: 'Save as JSON',
  /** Option in a dropdown menu that opens the current report in the Lighthouse Viewer Application. */
  dropdownViewer: 'Open in Viewer',
  /** Option in a dropdown menu that saves the current report as a new Github Gist. */
  dropdownSaveGist: 'Save as Gist',
  /** Option in a dropdown menu that toggles the themeing of the report between Light(default) and Dark themes. */
  dropdownDarkTheme: 'Toggle Dark Theme',

  /** Title of the Runtime settings table in a Lighthouse report.  Runtime settings are the environment configurations that a specific report used at auditing time. */
  runtimeSettingsTitle: 'Runtime Settings',
  /** Label for a row in a table that shows the URL that was audited during a Lighthouse run. */
  runtimeSettingsUrl: 'URL',
  /** Label for a row in a table that shows the time at which a Lighthouse run was conducted; formatted as a timestamp, e.g. Jan 1, 1970 12:00 AM UTC. */
  runtimeSettingsFetchTime: 'Fetch Time',
  /** Label for a row in a table that describes the kind of device that was emulated for the Lighthouse run.  Example values for row elements: 'No Emulation', 'Emulated Desktop', etc. */
  runtimeSettingsDevice: 'Device',
  /** Label for a row in a table that describes the network throttling conditions that were used during a Lighthouse run, if any. */
  runtimeSettingsNetworkThrottling: 'Network throttling',
  /** Label for a row in a table that describes the CPU throttling conditions that were used during a Lighthouse run, if any.*/
  runtimeSettingsCPUThrottling: 'CPU throttling',
  /** Label for a row in a table that shows in what tool Lighthouse is being run (e.g. The lighthouse CLI, Chrome DevTools, Lightrider, WebPageTest, etc). */
  runtimeSettingsChannel: 'Channel',
  /** Label for a row in a table that shows the User Agent that was detected on the Host machine that ran Lighthouse. */
  runtimeSettingsUA: 'User agent (host)',
  /** Label for a row in a table that shows the User Agent that was used to send out all network requests during the Lighthouse run. */
  runtimeSettingsUANetwork: 'User agent (network)',
  /** Label for a row in a table that shows the estimated CPU power of the machine running Lighthouse. Example row values: 532, 1492, 783. */
  runtimeSettingsBenchmark: 'CPU/Memory Power',

  /** Label for button to create an issue against the Lighthouse Github project. */
  footerIssue: 'File an issue',

  /** Descriptive explanation for emulation setting when no device emulation is set. */
  runtimeNoEmulation: 'No emulation',
  /** Descriptive explanation for emulation setting when emulating a Moto G4 mobile device. */
  runtimeMobileEmulation: 'Emulated Moto G4',
  /** Descriptive explanation for emulation setting when emulating a generic desktop form factor, as opposed to a mobile-device like form factor. */
  runtimeDesktopEmulation: 'Emulated Desktop',
  /** Descriptive explanation for a runtime setting that is set to an unknown value. */
  runtimeUnknown: 'Unknown',

  /** Descriptive explanation for environment throttling that was provided by the runtime environment instead of provided by Lighthouse throttling. */
  throttlingProvided: 'Provided by environment',
};

export default Util