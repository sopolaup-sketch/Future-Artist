#import <Foundation/Foundation.h>
#import <Capacitor/Capacitor.h>

CAP_PLUGIN(LiveActivityPlugin, "LiveActivityPlugin",
    CAP_PLUGIN_METHOD(startLiveActivity, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(updateLiveActivity, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(pauseLiveActivity, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(resumeLiveActivity, CAPPluginReturnPromise);
    CAP_PLUGIN_METHOD(stopLiveActivity, CAPPluginReturnPromise);
)
