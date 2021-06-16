import Util from "./features/performance/utils"
export const stringsArray = (report,envValues)=>{return([
    {
      name: Util.i18n.strings.runtimeSettingsUrl,
      description: report.finalUrl,
    },
    {
      name: Util.i18n.strings.runtimeSettingsFetchTime,
      description: Util.i18n.formatDateTime(report.fetchTime),
    },
    ...envValues,
    {
      name: Util.i18n.strings.runtimeSettingsChannel,
      description: report.configSettings.channel,
    },
    {
      name: Util.i18n.strings.runtimeSettingsUA,
      description: report.userAgent,
    },
    {
      name: Util.i18n.strings.runtimeSettingsUANetwork,
      description: report.environment && report.environment.networkUserAgent,
    },
    {
      name: Util.i18n.strings.runtimeSettingsBenchmark,
      description:
        report.environment && report.environment.benchmarkIndex.toFixed(0),
    },
  ]
)}  