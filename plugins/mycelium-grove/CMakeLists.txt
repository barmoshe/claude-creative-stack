cmake_minimum_required(VERSION 3.22)

# Set deployment target BEFORE project() so it propagates to all toolchain probes.
# Without this, CMake defaults to the build host's macOS version (15.x in our case),
# which makes the resulting binary fail to load in Ableton — see JUCE forum 68723.
set(CMAKE_OSX_DEPLOYMENT_TARGET "11.0" CACHE STRING "macOS deployment target")

project(MyceliumGrove VERSION 0.1.0 LANGUAGES C CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# JUCE 8.0.4+ is required — earlier WebView is unusable.
set(JUCE_MIN_VERSION "8.0.4")

# Pull JUCE in via FetchContent. Pin to a tag rather than tracking master.
include(FetchContent)
FetchContent_Declare(
    JUCE
    GIT_REPOSITORY https://github.com/juce-framework/JUCE.git
    GIT_TAG        8.0.4
    GIT_SHALLOW    TRUE
)
FetchContent_MakeAvailable(JUCE)

juce_add_plugin(MyceliumGrove
    COMPANY_NAME           "claude-creative-stack"
    BUNDLE_ID              "com.ccs.myceliumgrove"
    PLUGIN_MANUFACTURER_CODE "Ccsk"
    PLUGIN_CODE              "Mygv"
    FORMATS                  VST3 AU Standalone
    PRODUCT_NAME             "Mycelium Grove"
    PLUGIN_NAME              "Mycelium Grove"
    DESCRIPTION              "Generative MIDI from a living mycelial network"
    # Self-contained synth: drop on a MIDI track, click the canvas, hear sound.
    # NEEDS_MIDI_INPUT=TRUE because Ableton expects synths to declare a MIDI input
    # port in the VST3 manifest — even if (like us) we ignore incoming MIDI.
    IS_SYNTH                 TRUE
    NEEDS_MIDI_INPUT         TRUE
    NEEDS_MIDI_OUTPUT        FALSE
    IS_MIDI_EFFECT           FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS TRUE
    COPY_PLUGIN_AFTER_BUILD  TRUE
    NEEDS_WEBVIEW2           TRUE
)

juce_generate_juce_header(MyceliumGrove)

target_sources(MyceliumGrove PRIVATE
    Source/PluginProcessor.cpp
    Source/PluginProcessor.h
    Source/PluginEditor.cpp
    Source/PluginEditor.h
    Source/AudioEngine.cpp
    Source/AudioEngine.h
    Source/EventQueue.h
    Source/Voices.h
    Source/ScaleTables.h
    Source/Presets.h
)

# Bundle the web UI as binary data so the plugin is a single file.
juce_add_binary_data(MyceliumGroveWebData
    HEADER_NAME "WebData.h"
    NAMESPACE   WebData
    SOURCES
        Resources/web/index.html
        Resources/web/sim.js
        Resources/web/bridge.js
        Resources/web/styles.css
        Resources/web/jucefrontend.js
        Resources/web/check_native_interop.js
)

target_compile_definitions(MyceliumGrove
    PUBLIC
        JUCE_WEB_BROWSER=1
        JUCE_USE_WIN_WEBVIEW2=1
        JUCE_USE_CURL=0
        JUCE_VST3_CAN_REPLACE_VST2=0
)

target_link_libraries(MyceliumGrove
    PRIVATE
        MyceliumGroveWebData
        juce::juce_audio_utils
        juce::juce_dsp
        juce::juce_gui_extra
    PUBLIC
        juce::juce_recommended_config_flags
        juce::juce_recommended_lto_flags
        juce::juce_recommended_warning_flags
)
