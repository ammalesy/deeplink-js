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
 * @param {Object} callbacks - Callback functions for different events
 * @param {Function} callbacks.onStart - Called when deep link attempt starts
 * @param {Function} callbacks.onTimer - Called every second with remaining time
 * @param {Function} callbacks.onSuccess - Called when app opens successfully
 * @param {Function} callbacks.onFallback - Called when fallback to store
 */
KPlusDeepLinkHandler.prototype.openKPlusApp = function(token, fallbackDelay, callbacks) {
  var self = this;
  
  // Default parameter handling for older browsers
  if (typeof fallbackDelay === 'undefined') {
    fallbackDelay = 2500;
  }
  
  // Default callbacks
  callbacks = callbacks || {};
  var onStart = callbacks.onStart || function() {};
  var onTimer = callbacks.onTimer || function() {};
  var onSuccess = callbacks.onSuccess || function() {};
  var onFallback = callbacks.onFallback || function() {};
  
  if (!token) {
    throw new Error('Token is required');
  }

  var fullUrl = this.deepLinkUrl + '?tokenId=' + encodeURIComponent(token) + '&nextAction=authenwithkplus';
  
  var hasLeftPage = false;
  var timerInterval = null;
  var timeRemaining = Math.ceil(fallbackDelay / 1000); // Convert to seconds
  
  // Call onStart callback
  onStart();
  
  function handleVisibilityChange() {
    var hidden = document.hidden || 
                 document.msHidden || 
                 document.webkitHidden || 
                 false;
                 
    if (hidden) {
      hasLeftPage = true;
      
      // Clear timer
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      
      // Remove event listener
      if (document.removeEventListener) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      } else if (document.detachEvent) {
        document.detachEvent('onvisibilitychange', handleVisibilityChange);
      }
      
      // Call success callback
      onSuccess();
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

  // Start countdown timer
  timerInterval = setInterval(function() {
    timeRemaining--;
    onTimer(timeRemaining);
    
    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }, 1000);
  
  // Initial timer call
  onTimer(timeRemaining);

  // Try to open the deep link
  window.location.href = fullUrl;

  // Set fallback timer
  setTimeout(function() {
    // Clear timer interval if still running
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    
    if (supportsVisibilityAPI) {
      // Remove event listener if we added one
      if (document.removeEventListener) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      } else if (document.detachEvent) {
        document.detachEvent('onvisibilitychange', handleVisibilityChange);
      }
    }
    
    if (!hasLeftPage) {
      onFallback();
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
window.openKPlus = function(token, delay, callbacks) {
  return kplusHandler.openKPlusApp(token, delay, callbacks);
};
