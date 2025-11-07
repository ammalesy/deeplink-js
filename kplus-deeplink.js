/**
 * K PLUS Deep Link Handler
 * Functions to open K PLUS app with authentication token and handle fallbacks
 * Compatible with Safari iOS 15+ and Android 10+ browsers
 */

function KPlusDeepLinkHandler() {
  this.deepLinkUrl = "kbank.kplus://authenwithkplus";
  this.storeUrls = {
    ios: "https://apps.apple.com/app/id361170631",
    android: "https://play.google.com/store/apps/details?id=com.kasikorn.retail.mbanking.wap"
  };
}

/**
 * Detect the current platform
 * @returns {string} 'ios', 'android', or 'unknown'
 */
KPlusDeepLinkHandler.prototype.detectPlatform = function() {
  var userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else if (/android/.test(userAgent)) {
    return 'android';
  } else {
    return 'unknown';
  }
};

/**
 * Open K PLUS app with authentication token
 * @param {string} token - Authentication token to be passed to the app
 * @param {number} fallbackDelay - Delay before showing fallback (default: 2500ms)
 */
KPlusDeepLinkHandler.prototype.openKPlusApp = function(token, fallbackDelay) {
  var self = this;
  
  // Default parameter handling for older browsers
  if (typeof fallbackDelay === 'undefined') {
    fallbackDelay = 2500;
  }
  
  if (!token) {
    throw new Error('Token is required');
  }

  var fullUrl = this.deepLinkUrl + '?tokenId=' + encodeURIComponent(token) + '&nextAction=authenwithkplus';
  
  var hasLeftPage = false;
  
  function handleVisibilityChange() {
    var hidden = document.hidden || 
                 document.msHidden || 
                 document.webkitHidden || 
                 false;
                 
    if (hidden) {
      hasLeftPage = true;
      if (document.removeEventListener) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      } else if (document.detachEvent) {
        document.detachEvent('onvisibilitychange', handleVisibilityChange);
      }
    }
  }

  // Check if Visibility API is supported
  var supportsVisibilityAPI = typeof document.hidden !== 'undefined' || 
                              typeof document.msHidden !== 'undefined' || 
                              typeof document.webkitHidden !== 'undefined';

  if (supportsVisibilityAPI) {
    // Use Visibility API if supported
    if (document.addEventListener) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else if (document.attachEvent) {
      document.attachEvent('onvisibilitychange', handleVisibilityChange);
    }
  }

  // Try to open the deep link
  window.location.href = fullUrl;

  // Set fallback timer
  setTimeout(function() {
    if (supportsVisibilityAPI) {
      // Remove event listener if we added one
      if (document.removeEventListener) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      } else if (document.detachEvent) {
        document.detachEvent('onvisibilitychange', handleVisibilityChange);
      }
    }
    
    if (!hasLeftPage) {
      self.handleFallback();
    }
  }, fallbackDelay);
};

/**
 * Handle fallback when deep link fails
 */
KPlusDeepLinkHandler.prototype.handleFallback = function() {
  var platform = this.detectPlatform();
  var storeUrl = platform === 'android' ? this.storeUrls.android : this.storeUrls.ios;
  
  window.open(storeUrl, '_blank');
};

// Create a global instance
var kplusHandler = new KPlusDeepLinkHandler();

// Export for use in different environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { KPlusDeepLinkHandler: KPlusDeepLinkHandler, kplusHandler: kplusHandler };
}

// Global function for easy access - compatible with older browsers
window.openKPlus = function(token, delay) {
  return kplusHandler.openKPlusApp(token, delay);
};
