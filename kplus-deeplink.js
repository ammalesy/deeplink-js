/**
 * K PLUS Deep Link Handler
 * Functions to open K PLUS app with authentication token and handle fallbacks
 * Compatible with Safari iOS 15+ and Android 10+ browsers
 */

function KPlusDeepLinkHandler() {
  this.huaweiUrl = "https://kplusuat.dra.agconnect.link/Dtest";
  this.generalUrl = "https://www.kasikornbank.com/th/kplus/deeplinkkplus/";
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

  var fullUrl;
  
  if (this.isHuaweiDevice()) {
    // Use Huawei specific URL
    fullUrl = this.huaweiUrl;
  } else {
    // Use general URL with parameters
    fullUrl = this.generalUrl + '?nextAction=' + encodeURIComponent(nextAction) + '&tokenId=' + encodeURIComponent(token);
  }
  
  // Try to open the deep link
  window.location.href = fullUrl;
};



// Create a global instance
var kplusHandler = new KPlusDeepLinkHandler();

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KPlusDeepLinkHandler: KPlusDeepLinkHandler, kplusHandler: kplusHandler };
}

// Global function for easy access - compatible with older browsers
window.openKPlus = function(token, nextAction) {
  return kplusHandler.openKPlusApp(token, nextAction);
};
