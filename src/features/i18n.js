
const NBSP2 = '\xa0'

class I18n {
  constructor(locale, strings) {
    if (locale === 'en-XA') locale = 'de'

    this._numberDateLocale = locale
    this._numberFormatter = new Intl.NumberFormat(locale)
    this._strings = /** @type {LH.I18NRendererStrings} */ (strings || {});
  }

  get strings() {
    return this._strings
  }

  formatNumber(number, granularity = 0.1) {
    const coarseValue = Math.round(number / granularity) * granularity
    return this._numberFormatter.format(coarseValue)
  }
  formatBytesToKiB(size, granularity = 0.1) {
    const kbs = this._numberFormatter.format(
      Math.round(size / 1024 / granularity) * granularity
    );
    return `${kbs}${NBSP2}KiB`;
  }

  formatBytes(size, granularity = 1) {
    const kbs = this._numberFormatter.format(
      Math.round(size / granularity) * granularity
    );
    return `${kbs}${NBSP2}bytes`;
  }

  formatMilliseconds(ms, granularity = 10) {
    const coarseTime = Math.round(ms / granularity) * granularity
    return `${this._numberFormatter.format(coarseTime)}${NBSP2}ms`
  }

  formatSeconds(ms, granularity = 0.1) {
    const coarseTime = Math.round(ms / 1000 / granularity) * granularity
    return `${this._numberFormatter.format(coarseTime)}${NBSP2}s`
  }

  formatDateTime(date) {
    /** @type {Intl.DateTimeFormatOptions} */
    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    };
    let formatter = new Intl.DateTimeFormat(this._numberDateLocale, options)
    const tz = formatter.resolvedOptions().timeZone
    if (!tz || tz.toLowerCase() === 'etc/unknown') {
      options.timeZone = 'UTC'
      formatter = new Intl.DateTimeFormat(this._numberDateLocale, options)
    }
    return formatter.format(new Date(date))
  }
  formatDuration(timeInMilliseconds) {
    let timeInSeconds = timeInMilliseconds / 1000
    if (Math.round(timeInSeconds) === 0) {
      return 'None'
    }

    const parts = [];
    const unitLabels =({
      d: 60 * 60 * 24,
      h: 60 * 60,
      m: 60,
      s: 1,
    });

    Object.keys(unitLabels).forEach((label) => {
      const unit = unitLabels[label];
      const numberOfUnits = Math.floor(timeInSeconds / unit)
      if (numberOfUnits > 0) {
        timeInSeconds -= numberOfUnits * unit
        parts.push(`${numberOfUnits}\xa0${label}`)
      }
    })

    return parts.join(' ');
  }
}

export default I18n;
