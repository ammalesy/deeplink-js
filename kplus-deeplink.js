/**
 * K PLUS Deep Link Handler
 * Functions to open K PLUS app with authentication token and handle fallbacks
 * Compatible with Safari iOS 15+ and Android 10+ browsers
 */

function KPlusDeepLinkHandler() {
  //this.huaweiUrl = "https://kplusuat.dra.agconnect.link/?deeplink=https%3A%2F%2Fwww.kasikornbank.com%2Fth%2Fkplus%2Fdeeplinkkplus&android_deeplink=kbank.kplus%3A%2F%2Fauthenwithkplus%3FnextAction%3DNEXT_ACTION_REPLACEMENT%26tokenId%3DTOKEN_ID_REPLACEMENT&android_fallback_url=https%3A%2F%2Fwww.kasikornbank.com%2Fth%2Fkplus%2Fdeeplinkkplus&android_open_type=3&android_package_name=com.kasikorn.retail.mbanking.wap2&campaign_channel=First+Test+HMS&harmonyos_deeplink=kbank.kplus%3A%2F%2Fauthenwithkplus&ios_link=kbank.kplus%3A%2F%2Fauthenwithkplus&preview_type=2&landing_page_type=2&region_id=3"
  this.huaweiUrl = "https://kplusuat.dra.agconnect.link/Dtest";
  //this.huaweiUrl = "https://kplusuat.dra.agconnect.link/?deeplink=https%3A%2F%2Fwww.kasikornbank.com%2Fth%2Fkplus%2Fdeeplinkkplus&android_deeplink=kbank.kplus%3A%2F%2Fauthenwithkplus&android_fallback_url=https%3A%2F%2Fwww.kasikornbank.com%2Fth%2Fkplus%2Fdeeplinkkplus&android_open_type=3&android_package_name=com.kasikorn.retail.mbanking.wap2&campaign_channel=First+Test+HMS&harmonyos_deeplink=kbank.kplus%3A%2F%2Fauthenwithkplus&ios_link=kbank.kplus%3A%2F%2Fauthenwithkplus&preview_type=2&landing_page_type=2&region_id=3"
  this.generalUrl = "https://www.kasikornbank.com/th/kplus/deeplinkkplus/";
  this.fallbackUrl = "https://www.kasikornbank.com/th/kplus/deeplinkkplus/";
  this.deepLinkEnabled = true; // Flag to enable/disable deep link functionality
}

/**
 * Detect if device is Huawei
 * @returns {boolean} true if Huawei device, false otherwise
 */
KPlusDeepLinkHandler.prototype.isHuaweiDevice = function() {
  var userAgent = navigator.userAgent.toLowerCase();
  return /huawei/i.test(userAgent) || /honor/i.test(userAgent) || /hms/i.test(userAgent);
};

/**
 * Enable or disable deep link functionality
 * @param {boolean} enabled - true to enable deep link, false to disable
 */
KPlusDeepLinkHandler.prototype.setDeepLinkEnabled = function(enabled) {
  this.deepLinkEnabled = enabled;
};

/**
 * Open K PLUS app with authentication token
 * @param {string} token - Authentication token to be passed to the app (required)
 * @param {string} nextAction - Next action parameter (required)
 */
KPlusDeepLinkHandler.prototype.openKPlusApp = function(token, nextAction) {
  if (!token) {
    throw new Error('Token is required');
  }

  if (!nextAction) {
    throw new Error('NextAction is required');
  }

  // If useDeepLink is specified and deep link is enabled, try deep link first
  if (this.deepLinkEnabled) {
    var self = this;
    var deepLinkUrl = 'kbank.kplus://' + encodeURIComponent(nextAction) + '?tokenId=' + encodeURIComponent(token) + '&nextAction=' + encodeURIComponent(nextAction);

    // Try to open deep link
    var startTime = Date.now();
    var timeout = setTimeout(function() {
      // If deep link failed, fallback to web URL
      window.location.href = self.fallbackUrl;
    }, 2500);

    // Clear timeout if page becomes hidden (deep link worked)
    var handleVisibilityChange = function() {
      if (document.hidden || document.webkitHidden) {
        clearTimeout(timeout);
      }
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('webkitvisibilitychange', handleVisibilityChange);

    // Try to open the deep link
    window.location.href = deepLinkUrl;
    
    return;
  }

  // Default behavior: use web URLs
  var baseUrl;
  var fullUrl;
  
  if (this.isHuaweiDevice()) {
    // For Huawei devices, replace placeholders in the URL
    // fullUrl = this.huaweiUrl
      // .replace('NEXT_ACTION_REPLACEMENT', encodeURIComponent(nextAction))
      // .replace('TOKEN_ID_REPLACEMENT', encodeURIComponent(token));
    baseUrl = this.huaweiUrl;
  } else {
    baseUrl = this.generalUrl;
   
  }

  // Check if URL already has query parameters
  var separator = baseUrl.indexOf('?') !== -1 ? '&' : '?';

  // Build full URL with parameters
  fullUrl = baseUrl + separator + 'nextAction=' + encodeURIComponent(nextAction) + '&tokenId=' + encodeURIComponent(token);
  
  // Try to open the web URL
  window.location.href = fullUrl;
};



// Create a global instance
var kplusHandler = new KPlusDeepLinkHandler();

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KPlusDeepLinkHandler: KPlusDeepLinkHandler, kplusHandler: kplusHandler };
}

// Global function for easy access - compatible with older browsers
window.openKPlus = function(token, nextAction, useDeepLink) {
  return kplusHandler.openKPlusApp(token, nextAction, useDeepLink);
};

// Global function for deep link with fallback (backward compatibility)
window.openKPlusDeepLink = function(token, nextAction) {
  return kplusHandler.openKPlusApp(token, nextAction, true);
};

// Global function to enable/disable deep link
window.setKPlusDeepLinkEnabled = function(enabled) {
  return kplusHandler.setDeepLinkEnabled(enabled);
};
